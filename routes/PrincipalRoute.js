const express = require('express');
const router = express.Router();
const principalController = require('../controllers/PrincipalController');

router.post('/create', principalController.createPrincipal); // Create a principal
router.get('/', principalController.getAllPrincipals); // Get all principals
router.get('/:id', principalController.getPrincipalById); // Get a principal by ID
router.put('/:id', principalController.updatePrincipal); // Update a principal
router.delete('/:id', principalController.deletePrincipal); // Delete a principal

module.exports = router;
