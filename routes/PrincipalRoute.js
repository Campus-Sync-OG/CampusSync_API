const express = require('express');
const router = express.Router();
const principalController = require('../controllers/PrincipalController');

// Routes for Principal CRUD Operations
router.post('/create', principalController.createPrincipal); // Create a new principal
router.put('/update/:p_id', principalController.updatePrincipal); // Update principal details
router.delete('/delete/:p_id', principalController.softDeletePrincipal); // Delete a principal
router.get('/:p_id', principalController.getPrincipalDetails); // Get principal details
router.post('/:p_id/subjects', principalController.createSubject);
router.put("/:p_id/update/subjects/:id", principalController.updateSubject);

module.exports = router;
