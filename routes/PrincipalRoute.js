const express = require('express');
const router = express.Router();
const principalController = require('../controllers/PrincipalController');
const Auth = require("../middleware/authMiddleware");

router.post('/create', Auth.verifyToken, principalController.createPrincipal);
router.put('/update/:p_id', Auth.verifyToken, principalController.updatePrincipal);
router.delete('/delete/:p_id', Auth.verifyToken, principalController.softDeletePrincipal);
router.get('/:p_id', Auth.verifyToken, principalController.getPrincipalDetails);
router.post('/:p_id/subjects', Auth.verifyToken, principalController.createSubject);
router.put("/:p_id/update/subjects/:id", Auth.verifyToken, principalController.updateSubject);

//get feedback
router.get("/view",Auth.verifyToken, principalController.getAllFeedback);
module.exports = router;
