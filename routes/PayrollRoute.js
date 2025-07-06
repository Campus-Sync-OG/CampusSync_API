const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/PayrollController');


router.post('/generatepayroll', payrollController.generatePayroll);
router.post('/addstructure', payrollController.createSalaryStructure);
router.post('/addcomponents', payrollController.createComponents);
router.get('/getstructure', payrollController.getAllSalaryStructures);
router.get('/getcomponents', payrollController.getSalaryComponents);
router.post('/generateall', payrollController.generatePayrollForAllTeachers);
router.post('/auto', payrollController.generatePayroll);
router.get('/getall', payrollController.getPayrollsForMonth);
router.post('/component_types', payrollController.createComponentType);
router.get('/allcomp', payrollController.getAllComponentTypes);
module.exports = router;
