const express = require("express");
const academicController = require("../controllers/AcademicController");

const router = express.Router();

router.get("/list", academicController.getAllAcademics);
router.get("/:admission_no", academicController.getAcademicById);
router.delete("/delete/:admission_no", academicController.deleteAcademicById);

module.exports = router;
