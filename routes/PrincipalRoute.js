const express = require('express');
const router = express.Router();
const principalController = require('../controllers/PrincipalController');
const Auth = require("../middleware/authMiddleware");

router.post('/create',  principalController.createPrincipal);
router.put('/update/:p_id', Auth.verifyToken, principalController.updatePrincipal);
router.delete('/delete/:p_id', Auth.verifyToken, principalController.softDeletePrincipal);
router.get('/:p_id', Auth.verifyToken, principalController.getPrincipalDetails);

module.exports = router;
