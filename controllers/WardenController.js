const {
  warden,
  hostel_blocks,
  hostel_rooms,
  hostel_registration,
  hostel_allotments,
  hostel_attendance,
} = require("../models");

// ----------------------------------------
// ✔ Create Warden
// ----------------------------------------
exports.createWarden = async (req, res) => {
  try {
    const { name, phone, email, gender, address, assigned_block_id } = req.body;
    if (!name || !phone || !gender) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const last = await warden.findOne({ order: [["warden_id", "DESC"]] });
    let newId = "W-2025-0001";
    if (last) {
      const count = parseInt(last.warden_id.split("-")[2]) + 1;
      newId = `W-2025-${String(count).padStart(4, "0")}`;
    }

    const newWarden = await warden.create({
      warden_id: newId,
      name,
      phone,
      email,
      gender,
      address,
      assigned_block_id,
    });

    res
      .status(201)
      .json({ message: "Warden created successfully", data: newWarden });
  } catch (error) {
    console.error("Error creating warden:", error);
    res
      .status(500)
      .json({
        message: "Error creating warden",
        error: error.message || error,
      });
  }
};

// ----------------------------------------
// ✔ Create Block
// ----------------------------------------
exports.createBlock = async (req, res) => {
  try {
    const { block_name, block_type } = req.body;
    if (!block_name || !block_type)
      return res.status(400).json({ message: "Block name and type required" });

    const newBlock = await hostel_blocks.create({ block_name, block_type });
    return res
      .status(201)
      .json({ message: "Hostel block created successfully", block: newBlock });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating block", error: error.message || error });
  }
};

// ----------------------------------------
// ✔ Create Room inside a Block
// ----------------------------------------
exports.createRoom = async (req, res) => {
  try {
    const { block_id, room_number, sharing_type, capacity } = req.body;
    if (!block_id || !room_number || !sharing_type || !capacity) {
      return res
        .status(400)
        .json({
          message: "block_id, room_number, sharing_type, capacity are required",
        });
    }

    const blockExists = await hostel_blocks.findByPk(block_id);
    if (!blockExists)
      return res.status(404).json({ message: "Block not found" });

    const newRoom = await hostel_rooms.create({
      block_id,
      room_number,
      sharing_type,
      capacity,
    });
    return res
      .status(201)
      .json({ message: "Room created successfully", room: newRoom });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating room", error: error.message || error });
  }
};

// ----------------------------------------
// ✔ Room Allotment by Warden
// ----------------------------------------
exports.allotRoom = async (req, res) => {
  try {
    const { admission_no, room_id } = req.body;
    if (!admission_no || !room_id)
      return res
        .status(400)
        .json({ message: "admission_no and room_id are required" });

    const registration = await hostel_registration.findOne({
      where: { admission_no, status: "Registered" },
    });
    if (!registration)
      return res
        .status(404)
        .json({ message: "Student not registered for hostel" });

    const room = await hostel_rooms.findByPk(room_id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Check if room capacity allows
    const currentAllotments = await hostel_allotments.count({
      where: { room_id },
    });
    if (currentAllotments >= room.capacity)
      return res.status(400).json({ message: "Room is full" });

    const allotment = await hostel_allotments.create({
      admission_no,
      room_id,
      status: "Room Allotted",
    });
    return res
      .status(201)
      .json({ message: "Room allotted successfully", allotment });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error allotting room", error: error.message || error });
  }
};

// ----------------------------------------
// ✔ Mark Attendance by Warden
// ----------------------------------------
exports.markAttendance = async (req, res) => {
  try {
    const { block_id, date, attendance } = req.body;
    /**
     * attendance = [
     *   { admission_no: "S-2025-0001", status: "Present" },
     *   { admission_no: "S-2025-0002", status: "Absent" }
     * ]
     */

    if (!block_id || !date || !attendance)
      return res
        .status(400)
        .json({ message: "block_id, date and attendance are required" });

    const blockExists = await hostel_blocks.findByPk(block_id);
    if (!blockExists)
      return res.status(404).json({ message: "Block not found" });

    const results = [];
    for (const record of attendance) {
      const student = await hostel_registration.findOne({
        where: { admission_no: record.admission_no },
      });
      if (!student) continue;

      const att = await hostel_attendance.create({
        admission_no: record.admission_no,
        date,
        status: record.status,
      });
      results.push(att);
    }

    return res
      .status(201)
      .json({ message: "Attendance marked successfully", attendance: results });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error marking attendance",
        error: error.message || error,
      });
  }
};

// ----------------------------------------
// ✔ Get Students in Block (for Warden)
// ----------------------------------------
exports.getStudentsInBlock = async (req, res) => {
  try {
    const { block_id } = req.params;
    if (!block_id)
      return res.status(400).json({ message: "block_id required" });

    const students = await hostel_registration.findAll({
      where: { hostel_id: block_id, status: "Registered" },
    });

    return res.status(200).json(students);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error fetching students",
        error: error.message || error,
      });
  }
};

// allotment.controller.js

exports.createAllotment = async (req, res) => {
  try {
    const { registration_id, room_id, start_date, end_date } = req.body;

    if (!registration_id || !room_id) {
      return res
        .status(400)
        .json({ message: "registration_id and room_id are required" });
    }

    const registration = await hostel_registration.findOne({
      where: { registration_id },
    });
    if (!registration)
      return res.status(404).json({ message: "Registration not found" });

    const room = await hostel_rooms.findOne({ where: { room_id } });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const sharingCapacityMap = {
      Single: 1,
      "2 Sharing": 2,
      "3 Sharing": 3,
      "4 Sharing": 4,
    };
    const maxCapacity = sharingCapacityMap[room.sharing_type];

    // Don’t allot if room is already full
    if (room.capacity >= maxCapacity) {
      return res.status(400).json({ message: "Room capacity exceeded" });
    }

    const allotment = await hostel_allotments.create({
      registration_id,
      room_id,
      admission_no: registration.admission_no,
      status: "Room Allotted",
      start_date,
      end_date,
    });

    const updatedCapacity = room.capacity + 1;

    // Update room capacity (+1)
    const updateData = { capacity: updatedCapacity };

    // If room becomes full → set status = false
    if (updatedCapacity === maxCapacity) {
      updateData.status = false;
    }

    await hostel_rooms.update(updateData, { where: { room_id } });

    await hostel_registration.update(
      { status: "Registered", updated_at: new Date() },
      { where: { registration_id } }
    );

    return res.status(201).json({
      message: "Hostel allotment completed successfully",
      data: allotment,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

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
      return res.status(400).json({ message: "Student is already vacated" });
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
    const newCapacity = room.capacity - 1;

    const updateData = { capacity: newCapacity };
    // Room becomes available again
    if (newCapacity < sharingCapacityMap[room.sharing_type]) {
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
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

exports.getAvailableRooms = async (req, res) => {
  try {
    const { block_id, sharing_type } = req.query;

    const where = {};

    if (block_id) where.block_id = block_id;
    if (sharing_type) where.sharing_type = sharing_type;

    const rooms = await hostel_rooms.findAll({ where });

    if (!rooms || rooms.length === 0) {
      return res.status(200).json({
        message: "No rooms found",
        data: [],
      });
    }

    const sharingCapacityMap = {
      Single: 1,
      "2 Sharing": 2,
      "3 Sharing": 3,
      "4 Sharing": 4,
    };

    const result = rooms.map((room) => {
      const maxCapacity = sharingCapacityMap[room.sharing_type] || 0;
      const remaining = maxCapacity - room.capacity;

      return {
        room_id: room.room_id,
        block_id: room.block_id,
        sharing_type: room.sharing_type,
        max_capacity: maxCapacity,
        filled: room.capacity,
        remaining_beds: remaining,
        available: remaining > 0,
      };
    });

    return res.status(200).json({
      message: "Room availability fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
