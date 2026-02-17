const { hostel_registration, student, hostel_rooms, hostel_blocks, notification, user,hostel_allotments } = require("../models");
const { Op } = require("sequelize");

// 1. Student applies for hostel
exports.applyHostel = async (req, res) => {
  try {
    const {
      admission_no,
      premium_room,
      preferred_sharing,
      payment_type,
      total_fee,
      caution_fee,
      is_rejoiner,
      remarks,
    } = req.body;

    const ALLOWED_SHARING =
      hostel_registration.rawAttributes.preferred_sharing.values;

    const ALLOWED_PAYMENT =
      hostel_registration.rawAttributes.payment_type.values;

    if (!admission_no) {
      return res.status(400).json({ error: "admission_no is required" });
    }

    if (preferred_sharing && !ALLOWED_SHARING.includes(preferred_sharing)) {
      return res.status(400).json({
        error: `preferred_sharing must be one of: ${ALLOWED_SHARING.join(", ")}`,
      });
    }

    if (payment_type && !ALLOWED_PAYMENT.includes(payment_type)) {
      return res.status(400).json({
        error: `payment_type must be one of: ${ALLOWED_PAYMENT.join(", ")}`,
      });
    }

    const Student = await student.findOne({
      where: { admission_no },
    });

    if (!Student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const existing = await hostel_registration.findOne({
      where: {
        admission_no,
        status: { [Op.in]: ["Pending", "Registered"] },
      },
    });

    if (existing) {
      return res.status(409).json({
        error:
          "An active or pending hostel registration already exists for this student.",
        registration: existing,
      });
    }

    // ✅ CREATE REGISTRATION
    const registration = await hostel_registration.create({
      admission_no,
      premium_room: premium_room ?? false,
      preferred_sharing: preferred_sharing || null,
      payment_type: payment_type || null,
      total_fee: total_fee ?? 0.0,
      caution_fee: caution_fee ?? 0.0,
      is_rejoiner: is_rejoiner ?? false,
      status: "Pending",
      remarks: remarks || null,
    });

    // 🔔 🔔 🔔 NOTIFY PRINCIPAL (ADD HERE)
    const principals = await user.findAll({
      where: { role: "principal" },
      attributes: ["unique_id"],
    });

    for (const p of principals) {
      await notification.create({
        title: "New Hostel Application",
        message: {
          admission_no,
          preferred_sharing,
          payment_type,
          registration_id: registration.registration_id,
        },
        user_id: p.unique_id,
      });
    }

    return res.status(201).json({
      message: "Hostel application submitted successfully",
      registration,
    });

  } catch (err) {
    console.error("applyHostel error:", err);
    return res.status(500).json({ error: err.message });
  }
};


// 2. Warden: get all pending applications
exports.getPendingApplications = async (req, res) => {
  try {
    const pending = await hostel_registration.findAll({
      where: { status: "Pending" },
      include: [student, hostel_blocks]
    });

    return res.status(200).json(pending);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 3. Warden: Approve and assign room
exports.approveAndAssignRoom = async (req, res) => {
  try {
    const { registration_id, room_id } = req.body;

    const registration = await hostel_registration.findByPk(registration_id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const room = await hostel_rooms.findByPk(room_id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.available_beds <= 0) {
      return res.status(400).json({ message: "No beds available in this room" });
    }

    /* ======================================================
       1️⃣ CREATE HOSTEL ALLOTMENT (THIS WAS MISSING)
    ====================================================== */
    await hostel_allotments.create({
      admission_no: registration.admission_no,
      room_id: room_id,
      status: "Room Allotted",
      start_date: new Date(),
    });

    /* ======================================================
       2️⃣ UPDATE REGISTRATION
    ====================================================== */
    registration.room_id = room_id;
    registration.status = "Registered";
    await registration.save();

    /* ======================================================
       3️⃣ UPDATE ROOM AVAILABILITY
    ====================================================== */
    room.available_beds -= 1;
    await room.save();

    /* ======================================================
       4️⃣ NOTIFY STUDENT
    ====================================================== */
    await notification.create({
      title: "Hostel Room Allotted",
      message: {
        room_id,
        block_id: room.block_id,
        status: "Room Allotted",
      },
      user_id: registration.admission_no, // student unique_id
    });

    return res.status(200).json({
      message: "Room allocated successfully",
    });

  } catch (err) {
    console.error("approveAndAssignRoom error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.principalApproveHostel = async (req, res) => {
  try {
    const { registration_id, decision } = req.body;

    const registration = await hostel_registration.findByPk(registration_id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    if (decision === "reject") {
      registration.status = "Rejected";
      await registration.save();
      return res.json({ message: "Rejected" });
    }

    // APPROVED
    registration.status = "Registered";
    await registration.save();

    // 🔔 Notify Warden
    const wardens = await user.findAll({
      where: { role: "warden" },
      attributes: ["unique_id"],
    });

    for (const w of wardens) {
      await notification.create({
        title: "Hostel Approval Pending",
        message: {
          admission_no: registration.admission_no,
          registration_id,
        },
        user_id: w.unique_id,
      });
    }

    return res.json({ message: "Approved" });
  } catch (err) {
    console.error("principalApproveHostel error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getHostelRooms = async (req, res) => {
  try {
    const rooms = await hostel_rooms.findAll({
      include: [
        {
          model: hostel_blocks,
          as: "block", // ✅ REQUIRED (must match association)
          attributes: ["id", "block_name"],
        },
      ],
      order: [
        ["block_id", "ASC"],
        ["room_number", "ASC"],
      ],
    });

    return res.status(200).json(rooms);
  } catch (err) {
    console.error("getHostelRooms error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getApprovedApplicationsForWarden = async (req, res) => {
  try {
    const applications = await hostel_registration.findAll({
      where: { status: "Approved" },
      include: [
        {
          model: student,
          as: "student", // 🔥 REQUIRED
        },
      ],
      order: [["registered_on", "ASC"]],
    });

    return res.status(200).json(applications);
  } catch (err) {
    console.error("getApprovedApplicationsForWarden error:", err);
    return res.status(500).json({ error: err.message });
  }
};


exports.getHostelStudents = async (req, res) => {
  try {
    const data = await hostel_allotments.findAll({
      include: [
        {
          model: student,
          attributes: ["admission_no", "student_name", "class", "section"],
        },
        {
          model: hostel_rooms,
          attributes: ["room_number", "sharing_type", "capacity"],
          include: [
            {
              model: hostel_blocks,
              attributes: ["block_name"],
            },
          ],
        },
      ],
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

