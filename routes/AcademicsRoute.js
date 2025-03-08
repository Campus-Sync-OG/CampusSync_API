const express = require("express");
const academicController = require("../controllers/AcademicController");
const Auth = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/list", Auth.verifyToken, academicController.getAllAcademics);
router.get("/:admission_no", Auth.verifyToken, academicController.getAcademicById);
router.delete("/delete/:admission_no", Auth.verifyToken, academicController.deleteAcademicById);


module.exports = router;
