const { teacher_leave_application, user } = require('../models');

// Teacher applies for leave
exports.applyLeave = async (req, res) => {
  try {
    const { from_date, to_date, reason } = req.body;
    const teacher_id = req.user.unique_id;

    const leave = await teacher_leave_application.create({
      teacher_id,
      from_date,
      to_date,
      reason,
    });

    res.status(201).json({ success: true, message: 'Leave applied', data: leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error applying for leave' });
  }
};

// Principal approves/rejects leave
exports.reviewLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'
    const principal_id = req.user.unique_id;

    const leave = await leave_application.findByPk(leaveId);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    leave.status = status;
    leave.reviewed_by = principal_id;
    await leave.save();

    res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error reviewing leave' });
  }
};

// Teacher views own leave applications
exports.viewMyLeaves = async (req, res) => {
  try {
    const teacher_id = req.user.unique_id;
    const leaves = await leave_application.findAll({
      where: { teacher_id },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave records' });
  }
};

// Principal views all leave requests
exports.viewAllLeaves = async (req, res) => {
  try {
    const leaves = await leave_application.findAll({
      include: [{ model: user, as: 'teacher', attributes: ['name', 'unique_id'] }],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave records' });
  }
};
