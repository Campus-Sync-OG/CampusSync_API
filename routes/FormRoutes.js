const express = require("express");
const router = express.Router();
const FormController = require("../controllers/FormController");

// Route to create a form
router.post("/create", FormController.createForm);

// Route to update a form by title
router.put("/updateform/:title", FormController.updateForm);

// Route to fetch a form by title
router.get("/getbytitle/:title", FormController.getFormByTitle);

// Route to fetch all forms
router.get("/getall", FormController.getAllForms);

module.exports = router;
