const {
  hostel_blocks,
  hostel_rooms,
  hostel_allotments,
  hostel_leave_request: LeaveRequests,
  hostel_complaints: Complaints,
  student: Student,
  user: User,
} = require("../models");

// -----------------------------
// Create Block
// -----------------------------
exports.createBlock = async (req, res) => {
  try {
    const { block_name, gender } = req.body;

    if (!block_name || !gender) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const block = await hostel_blocks.create({ block_name, gender });

    return res.status(201).json({
      message: "Block created",
      data: block,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -----------------------------
// Create Room
// -----------------------------
exports.createRoom = async (req, res) => {
  try {
    const { block_id, room_number, sharing_type } = req.body;

    if (!block_id || !room_number || !sharing_type) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const capacityMap = {
      Single: 1,
      "2 Sharing": 2,
      "3 Sharing": 3,
      "4 Sharing": 4,
    };

    const room = await hostel_rooms.create({
      block_id,
      room_number,
      sharing_type,
      capacity: capacityMap[sharing_type],
      status: true,
    });

    return res.status(201).json({
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -----------------------------
// Show Available Rooms Grouped by Sharing Type
// -----------------------------
exports.getAvailableRooms = async (req, res) => {
  try {
    const rooms = await hostel_rooms.findAll({
      where: { status: true },
      attributes: ["room_id", "room_number", "sharing_type", "capacity"],
      order: [["sharing_type", "ASC"]],
    });

    const grouped = rooms.reduce((acc, room) => {
      if (!acc[room.sharing_type]) acc[room.sharing_type] = [];
      acc[room.sharing_type].push(room);
      return acc;
    }, {});

    return res.status(200).json({
      message: "Available rooms fetched",
      data: grouped,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -----------------------------
// Allot Room to Student
// -----------------------------
exports.createAllotment = async (req, res) => {
  try {
    const { admission_no, room_id } = req.body;

    if (!admission_no || !room_id) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const student = await Student.findOne({ where: { admission_no } });
    if (!student)
      return res.status(404).json({ message: "Invalid admission number" });

    const room = await hostel_rooms.findOne({ where: { room_id } });
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.status) return res.status(400).json({ message: "Room is full" });

    const newCapacity = room.capacity - 1;
    const capacityMap = {
      Single: 1,
      "2 Sharing": 2,
      "3 Sharing": 3,
      "4 Sharing": 4,
    };

    const updateData = { capacity: newCapacity };
    if (newCapacity === 0) updateData.status = false;

    await hostel_rooms.update(updateData, { where: { room_id } });

    const allot = await hostel_allotments.create({
      admission_no,
      room_id,
      status: "Room Allotted",
    });

    return res.status(201).json({
      message: "Allotment created successfully",
      data: allot,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -----------------------------
// Vacate Room
// -----------------------------
exports.vacateAllotment = async (req, res) => {
  try {
    const { allotment_id } = req.body;

    if (!allotment_id) {
      return res.status(400).json({ message: "allotment_id is required" });
    }

    const allotment = await hostel_allotments.findOne({
      where: { allotment_id },
    });
    if (!allotment)
      return res.status(404).json({ message: "Allotment not found" });

    if (allotment.status === "Vacated") {
      return res.status(400).json({ message: "Already vacated" });
    }

    const room = await hostel_rooms.findOne({
      where: { room_id: allotment.room_id },
    });

    const sharingCapacityMap = {
      Single: 1,
      "2 Sharing": 2,
      "3 Sharing": 3,
      "4 Sharing": 4,
    };

    const newCapacity = room.capacity + 1;

    const updateData = { capacity: newCapacity };
    if (newCapacity <= sharingCapacityMap[room.sharing_type]) {
      updateData.status = true;
    }

    await hostel_rooms.update(updateData, { where: { room_id: room.room_id } });

    await hostel_allotments.update(
      { status: "Vacated", vacated_at: new Date() },
      { where: { allotment_id } }
    );

    return res.status(200).json({
      message: "Room vacated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// -----------------------------
// Student: Request Leave
// -----------------------------
exports.requestLeave = async (req, res) => {
  try {
    const { admission_no, reason, note, start_date, end_date, visit_address } =
      req.body;

    if (!admission_no || !reason || !start_date || !end_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const student = await Student.findOne({ where: { admission_no } });
    if (!student)
      return res.status(404).json({ message: "Invalid admission number" });

    const leave = await LeaveRequests.create({
      admission_no,
      reason,
      note,
      start_date,
      end_date,
      visit_address,
    });

    return res.status(201).json({
      message: "Leave request submitted successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Leave Request Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -----------------------------
// Warden: Get All Leaves
// -----------------------------
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequests.findAll({
      include: [
        {
          model: Student,
          as: 'student',                     // <-- alias used when defining association
          attributes: ['student_name', 'class', 'admission_no'],
        },
        {
          model: hostel_allotments,
          as: 'allotment',                   // <-- alias used when defining association
          attributes: ['allotment_id', 'room_id', 'status', 'start_date', 'end_date'],
          required: false,                   // don't require an allotment (leave may exist without one)
          include: [
            {
              model: hostel_rooms,
              as: 'room',                    // <-- alias used when defining allotment->room
              attributes: ['room_id', 'room_number'],
              required: false
            }
          ]
        }
      ],
      order: [['leave_id', 'DESC']],
    });

    return res.status(200).json({
      message: 'Leave requests fetched successfully',
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error('Fetch Leaves Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// -----------------------------
// Warden: Approve / Reject Leave
// -----------------------------
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leave_id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either Approved or Rejected",
      });
    }

    const leave = await LeaveRequests.findOne({ where: { leave_id } });
    if (!leave)
      return res.status(404).json({ message: "Leave request not found" });

    leave.status = status;
    await leave.save();

    return res.status(200).json({
      message: `Leave request ${status} successfully`,
      data: leave,
    });
  } catch (error) {
    console.error("Leave Update Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -----------------------------
// Student: Submit Complaint
// -----------------------------
exports.submitComplaint = async (req, res) => {
  try {
    const {
      admission_no,
      complaint_type,
      subject,
      description,
      attachment_url,
    } = req.body;

    if (!admission_no || !complaint_type || !subject || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const student = await Student.findOne({ where: { admission_no } });
    if (!student)
      return res.status(404).json({ message: "Invalid admission number" });

    const complaint = await Complaints.create({
      admission_no,
      complaint_type,
      subject,
      description,
      attachment_url,
    });

    return res.status(201).json({
      message: "Complaint submitted successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Complaint Submit Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -----------------------------
// Warden: Get All Complaints
// -----------------------------
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaints.findAll({
      include: [
        {
          model: Student,
          as: "student", 
          attributes: ["student_name", "admission_no", "class"],
        },
      ],
      order: [["complaint_id", "DESC"]],
    });

    return res.status(200).json({
      message: "Complaints fetched successfully",
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("Fetch Complaints Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


// -----------------------------
// Warden: Update Complaint Status
// -----------------------------
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { complaint_id } = req.params;
    const { status, response_message, responded_by } = req.body;

    if (!["Pending", "In Review", "Resolved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaints.findOne({ where: { complaint_id } });
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    complaint.status = status;
    complaint.response_message = response_message || null;
    complaint.responded_by = responded_by || null;
    complaint.responded_on = new Date();
    complaint.updated_on = new Date();

    await complaint.save();

    return res.status(200).json({
      message: `Complaint ${status} successfully`,
      data: complaint,
    });
  } catch (error) {
    console.error("Complaint Update Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
