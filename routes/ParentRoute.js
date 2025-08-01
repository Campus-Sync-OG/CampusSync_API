const express = require("express");
const router = express.Router();
const ParentController = require("../controllers/ParentController");

router.get("/:admission_no", ParentController.getParent);
router.delete("/:admission_no", ParentController.deleteParent);
router.put("/update/:admission_no", ParentController.updateParent);

module.exports = router;
