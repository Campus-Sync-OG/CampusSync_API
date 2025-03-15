const express = require("express");
const router = express.Router();
const ParentController = require("../controllers/ParentController");

router.post("/postinfo", ParentController.createParent);
router.get("/:admission_no", ParentController.getParent);
router.put("/:admission_no", ParentController.updateParent);
router.delete("/:admission_no", ParentController.deleteParent);

module.exports = router;
