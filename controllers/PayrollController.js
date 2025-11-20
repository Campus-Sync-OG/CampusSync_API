const {
 
  user,
  salary_component,
  payroll_record,component_type
} = require('../models');
const { Op } = require('sequelize');
const cron = require('node-cron');


exports.createComponents = async (req, res) => {
  try {
    const { role, component_values } = req.body;

    if (!role || !Array.isArray(component_values)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Fetch component types from DB
    const allTypes = await component_type.findAll();
    const typeMap = new Map();
    allTypes.forEach(type => {
      typeMap.set(type.name.trim().toLowerCase(), type.type);
    });

    // Enrich component values with type
    const enrichedComponents = component_values.map(comp => {
      const typeFromDB = typeMap.get(comp.name.trim().toLowerCase());
      return {
        name: comp.name.trim(),
        amount: comp.amount,
        is_percentage: comp.is_percentage,
        type: typeFromDB || 'earning', // default fallback
      };
    });

    // Delete existing component values for the role
    await salary_component.destroy({ where: { role } });

    // Save new set
    const result = await salary_component.create({
      role,
      component_values: enrichedComponents,
    });

    return res.status(201).json({
      message: '✅ Component values saved successfully for role.',
      result,
    });
  } catch (err) {
    console.error('❌ Component creation failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSalaryComponents = async (req, res) => {
 try {
    const components = await salary_component.findAll({
      order: [['role', 'ASC'], ['id', 'ASC']],
    });

    if (!components || components.length === 0) {
      return res.status(404).json({ error: 'No salary components found' });
    }

    res.status(200).json(components);
  } catch (error) {
    console.error('Error fetching salary components:', error);
    res.status(500).json({ error: 'Failed to fetch salary components' });
  }
};

exports.generatePayrollForAllUsers = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).json({ error: 'Month is required in the request body' });
    }

    const parsedMonth = `${month}`; // e.g., "2025-07"

    // 1. Get all active users excluding students and with base_salary defined
    const users = await user.findAll({
      where: {
        status: 'active',
        role: { [Op.not]: 'student' },
        base_salary: { [Op.ne]: null },
      },
      attributes: ['unique_id', 'role', 'base_salary']
    });

    // 2. Get all role-based salary components
    const roleComponents = await salary_component.findAll(); // each contains `role`, `component_values`
    const componentMap = new Map();
    roleComponents.forEach(c => {
      componentMap.set(c.role, c.component_values);
    });

    let generated = 0;
    const failed = [];

    for (const u of users) {
      const empId = u.unique_id;
      const role = u.role;
      const baseSalary = parseFloat(u.base_salary);
      const components = componentMap.get(role);

      if (!components || isNaN(baseSalary)) {
        failed.push({ emp_id: empId, reason: 'Missing base salary or components' });
        continue;
      }

      let totalEarnings = 0;
      let totalDeductions = 0;
      const earningsBreakdown = [];
      const deductionsBreakdown = [];

      for (const comp of components) {
        const isPercentage = comp.is_percentage === true || comp.is_percentage === 'true';
        const rawAmount = parseFloat(comp.amount);

        if (isNaN(rawAmount)) {
          failed.push({ emp_id: empId, reason: `Invalid amount for component "${comp.name}"` });
          continue;
        }

        const amount = isPercentage
          ? (baseSalary * rawAmount / 100)
          : rawAmount;

        const roundedAmount = parseFloat(amount.toFixed(2));
        const entry = { name: comp.name, amount: roundedAmount };

        if (comp.type === 'earning') {
          totalEarnings += roundedAmount;
          earningsBreakdown.push(entry);
        } else if (comp.type === 'deduction') {
          totalDeductions += roundedAmount;
          deductionsBreakdown.push(entry);
        } else {
          failed.push({ emp_id: empId, reason: `Invalid component type "${comp.type}"` });
        }
      }

      const netPay = parseFloat((totalEarnings - totalDeductions).toFixed(2));

      // Remove old payroll record if exists
      await payroll_record.destroy({
        where: { employee_id: empId, month: parsedMonth }
      });

      // Save new payroll record
      await payroll_record.create({
        employee_id: empId,
        salary_structure_id: null, // No longer relevant
        base_salary: baseSalary,
        earnings: parseFloat(totalEarnings.toFixed(2)),
        deductions: parseFloat(totalDeductions.toFixed(2)),
        net_pay: netPay,
        earnings_breakdown: earningsBreakdown,
        deductions_breakdown: deductionsBreakdown,
        month: parsedMonth,
        status: 'processed'
      });

      generated++;
    }

    return res.status(200).json({
      message: `✅ Payroll generated for ${generated} user(s)`,
      skipped: failed.length > 0 ? failed : undefined
    });

  } catch (err) {
    console.error('❌ Payroll generation error:', err);
    return res.status(500).json({ error: 'Payroll generation failed' });
  }
};




exports.runPayrollCron = async (req, res) => {
  // At 00:00 on day 1 of every month
  cron.schedule('0 0 1 * *', async () => {
    const month = new Date().toISOString().slice(0, 7); // e.g., '2025-07'
    console.log(`🕐 Running payroll cron for month: ${month}`);

    const req = { body: { month } };
    const res = {
      status: (code) => ({
        json: (data) => console.log(`[${code}] Cron Response:`, data),
      }),
    };

    await generatePayrollForAllUsers(req, res);
  });
};

exports.getPayrollsForMonth = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ error: 'Query param "month" is required (e.g., ?month=2025-07)' });
    }

    const payrolls = await payroll_record.findAll({
      where: { month },
      include: [
        {
          model: user,
          as: 'user', // ensure alias matches association
          attributes: ['unique_id', 'role', 'name'],
          where: {
            role: {
              [Op.in]: ['teacher', 'admin', 'principal', 'operator'] // exclude students
            }
          },
          required: true
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(payrolls);
  } catch (err) {
    console.error('❌ Error fetching payrolls:', err);
    res.status(500).json({ error: 'Failed to fetch payrolls' });
  }
};

exports.createComponentType = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Component name and type are required' });
    }

    if (!['earning', 'deduction'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "earning" or "deduction"' });
    }

    const existing = await component_type.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: 'Component type already exists' });
    }

    const newComponentType = await component_type.create({ name, type });

    res.status(201).json({
      message: 'Component type created successfully',
      data: newComponentType,
    });
  } catch (error) {
    console.error('Error creating component type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getAllComponentTypes = async (req, res) => {
  try {
    const types = await component_type.findAll({
      order: [['id', 'ASC']],
    });

    res.status(200).json(types);
  } catch (error) {
    console.error('Error fetching component types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserPayrollById = async (req, res) => {
  try {
    const { emp_id } = req.params;

    if (!emp_id) {
      return res.status(400).json({ error: 'emp_id is required' });
    }

    const records = await payroll_record.findAll({
      where: { employee_id: emp_id },
      include: [
        {
          model: user,
          as: 'user', // this alias must match the one used in your model association
          attributes: ['name', 'role'],
          required: true
        }
      ],
      order: [['month', 'DESC']]
    });

    return res.status(200).json(records);
  } catch (error) {
    console.error('❌ Error in getUserPayrollById:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getAllPayrolls = async (req, res) => {
  try {
    const records = await payroll_record.findAll();
     
    res.status(200).json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payrolls' });
  }
};