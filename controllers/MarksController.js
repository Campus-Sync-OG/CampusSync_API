// controllers/marksController.js
const { academics, notification: Notification, teacher, principal, sequelize } = require('../models');

/**
 * Utility: build notification message JSON string
 */
function buildSubmissionMessage(submission, submittedBy) {
  return JSON.stringify({
    type: 'marks_submission',
    status: 'pending',
    submitted_by: submittedBy,
    submitted_at: new Date().toISOString(),
    submission // object with metadata + marks array
  });
}

/**
 * Teacher submits marks (stores payload in notification.message for principals)
 * POST /api/marks/submit
 * body: { class_grade, section, subject, exam_format, academic_year, exam_date, marks: [{admission_no, roll_no, student_name, marks_obtained, total_marks}], emp_id? }
 */
async function submitMarks(req, res) {
  const payload = req.body;
  const emp_id = (req.user && req.user.unique_id) || payload.emp_id;
  if (!emp_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { class_grade, section, subject, exam_format, academic_year, exam_date, marks } = payload;
  if (!class_grade || !section || !subject || !Array.isArray(marks) || marks.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing required fields or marks' });
  }

  try {
    // Build message storing full submission
    const submission = { class_grade, section, subject, exam_format, academic_year, exam_date, marks };
    const message = buildSubmissionMessage(submission, emp_id);

    // Find principals to notify (you have principal table)
    const principals = await principal.findAll({ attributes: ['p_id'] });

    // create notification entries for all principals
    const notifs = principals.map(p => ({
      title: `Marks submitted: ${subject} (${class_grade}-${section})`,
      message,
      class_id: class_grade,
      section_id: section,
      user_id: p.p_id // principal user id according to your notification model
    }));

    await Notification.bulkCreate(notifs);

    return res.status(201).json({ success: true, message: 'Submitted for principal approval' });
  } catch (err) {
    console.error('submitMarks error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Principal lists pending submissions (reads notifications and returns those with message.type === 'marks_submission' && status === 'pending')
 * GET /api/marks/pending
 */
async function listPendingSubmissions(req, res) {
  try {
    // Fetch notifications addressed to this principal (or all if admin)
    const principalId = req.user?.unique_id || req.query.principal_id; // adjust to your auth
    const where = {};
    if (principalId) where.user_id = principalId;

    const notifs = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    // filter and parse
    const pending = [];
    for (const n of notifs) {
      let parsed;
      try { parsed = JSON.parse(n.message); } catch (e) { continue; }
      if (parsed && parsed.type === 'marks_submission' && parsed.status === 'pending') {
        pending.push({
          notification_id: n.id,
          title: n.title,
          class_id: n.class_id,
          section_id: n.section_id,
          submitted_at: parsed.submitted_at,
          submitted_by: parsed.submitted_by,
          submission: parsed.submission,
          raw: n // full row if needed
        });
      }
    }

    return res.json({ success: true, pending });
  } catch (err) {
    console.error('listPendingSubmissions err', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Principal reviews a submission (approve/reject)
 * PUT /api/marks/:notificationId/review
 * body: { action: 'approved'|'rejected', comments?: string }
 *
 * If approved -> write into academics table (upsert per student)
 * Then update the notification.message JSON status and add review info
 * Notify teacher (and optionally students)
 */
async function reviewSubmission(req, res) {
  const id = req.params.id;                 // <-- use 'id' param
  const { action, comments } = req.body;
  const reviewer = req.user?.unique_id;
  const reviewerRole = req.user?.role;      // ensure your verifyToken attaches role

  // optional: role check (useful if you don't have authorizeRole middleware)
  if (reviewerRole !== 'principal') {
    return res.status(403).json({ success: false, message: 'Only principals can review submissions' });
  }

  if (!['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  const t = await sequelize.transaction();
  try {
    // find by id (DB column name 'id')
    const notif = await Notification.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!notif) { await t.rollback(); return res.status(404).json({ success: false, message: 'Notification not found' }); }

    let parsed;
    try { parsed = JSON.parse(notif.message); } catch (e) { await t.rollback(); return res.status(400).json({ success: false, message: 'Invalid notification payload' }); }

    if (parsed.type !== 'marks_submission' || parsed.status !== 'pending') { await t.rollback(); return res.status(400).json({ success: false, message: 'Submission already acted upon or invalid' }); }

    const submission = parsed.submission;

    if (action === 'approved') {
      // Upsert each student's marks into academics
      const marks = submission.marks || [];
      for (const m of marks) {
        const where = {
          admission_no: m.admission_no,
          subjects: submission.subject,
          exam_format: submission.exam_format,
          academic_year: submission.academic_year
        };

        const existing = await academics.findOne({ where, transaction: t });
        const payload = {
          admission_no: m.admission_no,
          subjects: submission.subject,
          class_grade: submission.class_grade,
          section: submission.section,
          exam_format: submission.exam_format,
          academic_year: submission.academic_year,
          marks_obtained: m.marks_obtained,
          total_marks: m.total_marks,
          exam_date: submission.exam_date
        };

        if (existing) {
          await academics.update(payload, { where, transaction: t });
        } else {
          await academics.create(payload, { transaction: t });
        }
      }
    }

    // update notification.message with review metadata
    parsed.status = action;
    parsed.reviewed_by = reviewer;
    parsed.reviewed_at = new Date().toISOString();
    parsed.review_comments = comments || null;

    notif.message = JSON.stringify(parsed);
    await notif.save({ transaction: t });

    // notify teacher
    const teacherUserId = parsed.submitted_by;
    await Notification.create({
      title: `Marks ${action} by Principal`,
      message: JSON.stringify({
        type: 'marks_review',
        status: action,
        submission_ref_notification_id: notif.id,
        comments: comments || null,
        acted_by: reviewer,
        acted_at: new Date().toISOString()
      }),
      class_id: parsed.submission.class_grade,
      section_id: parsed.submission.section,
      user_id: teacherUserId
    }, { transaction: t });

    // notify students on approve
    if (action === 'approved') {
      const studentNotifs = (submission.marks || []).map(m => ({
        title: `Marks published: ${submission.subject}`,
        message: `Marks for ${submission.subject} (${submission.exam_format}) have been published.`,
        class_id: submission.class_grade,
        section_id: submission.section,
        user_id: m.admission_no,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      if (studentNotifs.length) {
        await Notification.bulkCreate(studentNotifs, { transaction: t });
      }
    }

    await t.commit();
    return res.json({ success: true, message: `Submission ${action}` });
  } catch (err) {
    await t.rollback();
    console.error('reviewSubmission err', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  submitMarks,
  listPendingSubmissions,
  reviewSubmission
};
