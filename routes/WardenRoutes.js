const express = require("express");
const router = express.Router();
const wardenController = require("../controllers/warden.controller");

// ---------------- Warden ----------------
router.post("/create", wardenController.createWarden);
router.get("/", wardenController.getWardens);
router.get("/:id", wardenController.getWardenById);
router.put("/:id", wardenController.updateWarden);
router.delete("/:id", wardenController.deleteWarden);

// ---------------- Blocks ----------------
router.post("/blocks/create", wardenController.createBlock);
router.get("/blocks", wardenController.getBlocks);

// ---------------- Rooms ----------------
router.post("/rooms/create", wardenController.createRoom);
router.get("/rooms/:block_id", wardenController.getRoomsByBlock);

// ---------------- Room Allotment ----------------
router.post("/rooms/allot", wardenController.allotRoom);

// ---------------- Attendance ----------------
router.post("/attendance/mark", wardenController.markAttendance);

// ---------------- Students in Block ----------------
router.get("/students/:block_id", wardenController.getStudentsInBlock);

module.exports = router;
