// controllers/hostelController.js
const { Op } = require("sequelize");
const {
  student,
  warden,
  hostel_blocks,
  hostel_rooms,
  hostel_allotments,
  hostel_attendance
} = require("../models");

exports.getHostelStudentsForWarden = async (req, res) => {
  try {
    const wardenId = req.user?.unique_id;
    if (!wardenId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 1️⃣ Find warden & block
    const wardens = await warden.findOne({
      where: { warden_id: wardenId }, // ✅ FIXED HERE
      include: [
        {
          model: hostel_blocks,
          as: "hostel_block",
          attributes: ["id", "block_name"],
        },
      ],
    });

    if (!wardens || !wardens.hostel_block) {
      return res.status(404).json({ error: "Hostel block not assigned" });
    }

    const blockId = wardens.hostel_block.id;

    // 2️⃣ Fetch hostel students via allotments
    const allotments = await hostel_allotments.findAll({
      where: { status: "Room Allotted" },
      include: [
        {
          model: student,
          attributes: [
            "admission_no",
            "student_name",
            "class",
            "section",
          ],
        },
        {
          model: hostel_rooms,
          attributes: ["room_number"],
          where: { block_id: blockId },
        },
      ],
      order: [["start_date", "ASC"]],
    });

    return res.json(allotments);
  } catch (err) {
    console.error("getHostelStudentsForWarden error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.saveHostelAttendance = async (req, res) => {
  try {
    const { date, attendance } = req.body;

    if (!date || !Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({ error: "Invalid attendance data" });
    }

    for (const item of attendance) {
      if (!item.admission_no || !item.status) continue;

      await hostel_attendance.upsert({
        admission_no: item.admission_no,
        date,
        status: item.status,
        note: item.note || null,
      });
    }

    return res.json({
      message: "Hostel attendance saved successfully",
    });
  } catch (err) {
    console.error("saveHostelAttendance error:", err);
    return res.status(500).json({ error: err.message });
  }
};

