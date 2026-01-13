const router = require("express").Router();
const WardenController = require("../controllers/WardenController");

// Blocks
router.post("/block/create", WardenController.createBlock);

// Rooms
router.post("/room/create", WardenController.createRoom);
router.get("/rooms/available", WardenController.getAvailableRooms);

// Allotment
router.post("/allotment/create", WardenController.createAllotment);
router.post("/allotment/vacate", WardenController.vacateAllotment);

// Leave Requests
router.post("/leave/create", WardenController.requestLeave);
router.get("/leave/all", WardenController.getAllLeaveRequests);
router.put("/leave/update/:leave_id", WardenController.updateLeaveStatus);

// Complaints
router.post("/complaint/create", WardenController.submitComplaint);
router.get("/complaints/all", WardenController.getAllComplaints);
router.put("/complaint/update/:complaint_id", WardenController.updateComplaintStatus);

module.exports = router;
