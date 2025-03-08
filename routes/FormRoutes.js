const express = require("express");
const router = express.Router();
const FormController = require("../controllers/FormController");
const Auth = require("../middleware/authMiddleware");

// Route to create a form
router.post("/create", Auth.verifyToken, FormController.createForm);

// Route to update a form by title
router.put("/updateform/:title", Auth.verifyToken, FormController.updateForm);

// Route to fetch a form by title
router.get("/getbytitle/:title", Auth.verifyToken, FormController.getFormByTitle);

// Route to fetch all forms
router.get("/getall", Auth.verifyToken, FormController.getAllForms);

module.exports = router;
