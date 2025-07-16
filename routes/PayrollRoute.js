const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/PayrollController');


router.post('/addstructure', payrollController.createSalaryStructure);
router.post('/addcomponents', payrollController.createComponents);
router.get('/getstructure', payrollController.getAllSalaryStructures);
router.get('/getcomponents', payrollController.getSalaryComponents);
router.post('/generateall', payrollController.generatePayrollForAllTeachers);
router.get('/getall', payrollController.getPayrollsForMonth);
router.post('/component_types', payrollController.createComponentType);
router.get('/allcomp', payrollController.getAllComponentTypes);
router.get('/getbyid/:emp_id', payrollController.getTeacherPayrollById);
router.get('/all', payrollController.getAllPayrolls);
module.exports = router;
