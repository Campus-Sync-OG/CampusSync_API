const express = require("express");
const router = express.Router();
const WardenController = require("../controllers/WardenController");

router.post("/warden/create", WardenController.createWarden);

router.post("/block/create", WardenController.createBlock);

router.post("/room/create", WardenController.createRoom);
router.get("/rooms/available", WardenController.getAvailableRooms);
router.get("/rooms/available/grouped", WardenController.getAvailableRoomsGrouped);

router.post("/room/allot", WardenController.allotRoom);
router.post("/room/vacate", WardenController.vacateAllotment);

router.post("/attendance/mark", WardenController.markAttendance);

router.get("/block/:block_id/students", WardenController.getStudentsInBlock);

router.post("/maintenance/create", WardenController.createComplaint);
router.get("/maintenance/all", WardenController.getAllComplaints);
router.post("/maintenance/:complaint_id/update", WardenController.updateComplaintStatus);

router.post("/leave/request", WardenController.requestLeave);
router.get("/leave/all", WardenController.getAllLeaveRequests);
router.post("/leave/:leave_id/update", WardenController.updateLeaveStatus);

module.exports = router;
