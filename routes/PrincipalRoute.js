const express = require('express');
const router = express.Router();
const PrincipalController = require('../controllers/PrincipalController');

// Create a new principal
router.post('/create', PrincipalController.createPrincipal);

// Get all principals
router.get('/all', PrincipalController.getAllPrincipals);

// Get a principal by emp_id
router.get('/:emp_id', PrincipalController.getPrincipalByEmpId);

// Update a principal by emp_id
router.put('/update/:emp_id', PrincipalController.updatePrincipalByEmpId);

// Delete a principal by emp_id
router.delete('/delete/:emp_id', PrincipalController.deletePrincipalByEmpId);

module.exports = router;
