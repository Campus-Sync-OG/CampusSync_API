const express = require("express");
const router = express.Router();
const classSectionController = require("../controllers/classsectionController");

// Get all class-sections
router.get("/all", classSectionController.getAllClassSections);



module.exports = router;
