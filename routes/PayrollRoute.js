const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/PayrollController');

router.post('/addprocess', payrollController.processPayroll);
router.post('/generatepayroll', payrollController.generatePayroll);
router.post('/addstructure', payrollController.createSalaryStructure);
router.post('/addcomponents', payrollController.addComponentsToStructure);
router.get('/getstructure', payrollController.getAllSalaryStructures);
router.get('/getcomponents', payrollController.getSalaryComponents);
router.post('/generateall', payrollController.generatePayrollForAllTeachers);
router.post('/auto', payrollController.generatePayroll);
router.get('/getall', payrollController.getPayrollsForMonth);
module.exports = router;
