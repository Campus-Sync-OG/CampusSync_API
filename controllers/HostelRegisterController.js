const {hostel_registration, student, hostel_rooms, hostel_block } = require("../models");
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

    // Auto-read ENUM values from model
    const ALLOWED_SHARING =
      hostel_registration.rawAttributes.preferred_sharing.values;

    const ALLOWED_PAYMENT =
      hostel_registration.rawAttributes.payment_type.values;

    // Basic validation
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

    // verify student exists
    const Student = await student.findOne({
      where: { admission_no },
    });

    if (!Student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Prevent duplicate pending/registered application
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

    // Create registration
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
        const pending = await HostelRegistration.findAll({
            where: { status: "pending" },
            include: [student,  hostel_block] 
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
        if (!registration) return res.status(404).json({ message: "Registration not found" });

        const room = await Room.findByPk(room_id);
        if (!room) return res.status(404).json({ message: "Room not found" });

        // Check availability
        if (room.available_beds <= 0) {
            return res.status(400).json({ message: "No beds available in this room" });
        }

        // Assign student to the room
        registration.room_id = room_id;
        registration.status = "approved";
        await registration.save();

        // Reduce available beds
        room.available_beds -= 1;
        await room.save();

        return res.status(200).json({
            message: "Room allocated successfully",
            registration
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
