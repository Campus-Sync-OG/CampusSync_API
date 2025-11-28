const express = require("express");
const router = express.Router();

const {
  createWarden,
  createBlock,
  createRoom,
  allotRoom,
  markAttendance,
  getStudentsInBlock,
} = require("../controllers/WardenController");

// ➤ Create warden
router.post("/create", createWarden);

// ➤ Create hostel block
router.post("/block/create", createBlock);

// ➤ Create room inside a block
router.post("/room/create", createRoom);

// ➤ Allot room to a student
router.post("/room/allot", allotRoom);

// ➤ Mark daily attendance
router.post("/attendance/mark", markAttendance);

// ➤ Get all students in a specific block
router.get("/block/:block_id/students", getStudentsInBlock);

module.exports = router;
