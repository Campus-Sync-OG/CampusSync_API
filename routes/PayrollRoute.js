const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/PayrollController');



router.post('/addcomponents', payrollController.createComponents);

router.get('/getcomponents', payrollController.getSalaryComponents);
router.post('/generateall', payrollController.generatePayrollForAllUsers);
router.get('/getall', payrollController.getPayrollsForMonth);
router.post('/component_types', payrollController.createComponentType);
router.get('/allcomp', payrollController.getAllComponentTypes);
router.get('/getbyid/:emp_id', payrollController.getUserPayrollById);
router.get('/all', payrollController.getAllPayrolls);
module.exports = router;
