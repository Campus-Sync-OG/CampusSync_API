const {
  teacher,
  salary_structure,
  salary_component,
  payroll_record,component_type
} = require('../models');
const { Op } = require('sequelize');
const cron = require('node-cron');

exports.createComponents = async (req, res) => {
  try {
    const { structure_id, component_values } = req.body;

    if (!structure_id || !Array.isArray(component_values)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Delete existing components for the structure (overwrite logic)
    await salary_component.destroy({ where: { structure_id } });

    // Create new entry
    const result = await salary_component.create({
      structure_id,
      component_values
    });

    return res.status(201).json({ message: 'Components saved (overwritten if existed)', result });
  } catch (err) {
    console.error('Component creation failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createSalaryStructure = async (req, res) => {
  try {
    const { name, base_salary, is_default} = req.body;

    const structure = await salary_structure.create({
      name,
      base_salary,
      is_default,
      
    });

    res.status(201).json({
      message: 'Salary structure created successfully',
      structure
    });
  } catch (err) {
    console.error('Error creating salary structure:', err);
    res.status(500).json({ error: 'Structure creation failed' });
  }
};

exports.getSalaryComponents = async (req, res) => {
  try {
    const { structure_id } = req.query;

    const whereClause = structure_id ? { structure_id } : {};

    const components = await salary_component.findAll({
      where: whereClause,
      order: [['id', 'ASC']]
    });

    res.status(200).json(components);
  } catch (error) {
    console.error('Error fetching salary components:', error);
    res.status(500).json({ error: 'Failed to fetch salary components' });
  }
};

exports.getAllSalaryStructures = async (req, res) => {
  try {
    const structures = await salary_structure.findAll({
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(structures);
  } catch (error) {
    console.error('Error fetching salary structures:', error);
    res.status(500).json({ error: 'Failed to fetch salary structures' });
  }
};

exports.generatePayroll = async (req, res) => {
  try {
    const { employee_id, month } = req.body;

    // Step 1: Fetch teacher and their salary structure
    const teacherData = await teacher.findOne({ where: { emp_id: employee_id } });
    if (!teacherData || !teacherData.salary_structure_id) {
      return res.status(404).json({ error: 'Teacher or salary structure not found' });
    }

    const structure = await salary_structure.findByPk(teacherData.salary_structure_id);
    if (!structure) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }

    const components = await salary_component.findAll({
      where: { structure_id: structure.id },
    });

    const base_salary = structure.base_salary;
    let totalEarnings = 0;
    let totalDeductions = 0;

    const earnings = [];
    const deductions = [];

    for (const comp of components) {
      const calculatedAmount = comp.is_percentage
        ? (base_salary * comp.amount) / 100
        : comp.amount;

      const componentData = {
        name: comp.name,
        amount: calculatedAmount
      };

      if (comp.type === 'earning') {
        earnings.push(componentData);
        totalEarnings += calculatedAmount;
      } else if (comp.type === 'deduction') {
        deductions.push(componentData);
        totalDeductions += calculatedAmount;
      }
    }

    const net_pay = totalEarnings - totalDeductions;

    // Step 2: Check if payroll already exists for same month
    const existingRecord = await payroll_record.findOne({
      where: { employee_id, month }
    });

    if (existingRecord) {
      return res.status(409).json({ error: 'Payroll already generated for this month' });
    }

    // Step 3: Create payroll record
    await payroll_record.create({
      employee_id,
      salary_structure_id: structure.id,
      base_salary,
      earnings,
      deductions,
      net_pay,
      month,
      status: 'processed'
    });

    res.status(201).json({
      message: 'Payroll generated successfully',
      employee_id,
      month,
      base_salary,
      totalEarnings,
      totalDeductions,
      net_pay,
      earnings,
      deductions
    });

  } catch (err) {
    console.error('Payroll generation error:', err);
    res.status(500).json({ error: 'Payroll generation failed' });
  }
};


exports.generatePayrollForAllTeachers = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).json({ error: 'Month is required in the request body' });
    }

    const parsedMonth = month.slice(0, 7); // keep YYYY-MM format

    const teachers = await teacher.findAll({
      where: {
        status: 'active',
        salary_structure_id: { [Op.ne]: null },
        emp_id: { [Op.ne]: null },
      },
      attributes: ['emp_id', 'salary_structure_id']
    });

    const structures = await salary_structure.findAll(); // includes base_salary
    const components = await salary_component.findAll(); // includes component_values as JSON string

    // Map structure_id → base_salary
    const structureMap = new Map();
    structures.forEach(s => structureMap.set(s.id, Number(s.base_salary)));

    // Map structure_id → [components...]
    const componentMap = new Map();
    components.forEach(c => {
      try {
        const parsed = typeof c.component_values === 'string'
          ? JSON.parse(c.component_values)
          : c.component_values;

        if (!componentMap.has(c.structure_id)) {
          componentMap.set(c.structure_id, []);
        }
        componentMap.get(c.structure_id).push(parsed);
      } catch (err) {
        console.error(`Invalid component JSON for structure_id ${c.structure_id}:`, err);
      }
    });

    let generated = 0;
    const failed = [];

    for (const t of teachers) {
      const empId = t.emp_id;
      const structureId = t.salary_structure_id;

      const baseSalary = structureMap.get(structureId);
      const componentsList = componentMap.get(structureId);

      if (!baseSalary || !componentsList) {
        failed.push({ emp_id: empId, reason: 'Missing salary structure or components' });
        continue;
      }

      let totalEarnings = 0;
      let totalDeductions = 0;
      const earnings = [];
      const deductions = [];

      for (const component of componentsList) {
        const name = component.name;
        const type = component.type;
        const isPercentage = component.is_percentage;
        const amountValue = parseFloat(component.amount);

        if (isNaN(amountValue)) continue;

        const calculatedAmount = isPercentage
          ? (baseSalary * amountValue) / 100
          : amountValue;

        const breakdownItem = { name, amount: Math.round(calculatedAmount) };

        if (type === 'earning') {
          earnings.push(breakdownItem);
          totalEarnings += calculatedAmount;
        } else if (type === 'deduction') {
          deductions.push(breakdownItem);
          totalDeductions += calculatedAmount;
        }
      }

      const netPay = Math.round(totalEarnings - totalDeductions);

      // Remove old record
      await payroll_record.destroy({
        where: {
          employee_id: empId,
          month: parsedMonth,
        }
      });

      // Create new payroll
      await payroll_record.create({
        employee_id: empId,
        salary_structure_id: structureId,
        base_salary: baseSalary,
        earnings: Math.round(totalEarnings),
        deductions: Math.round(totalDeductions),
        net_pay: netPay,
        earnings_breakdown: earnings,
        deductions_breakdown: deductions,
        month: parsedMonth,
        status: 'processed'
      });

      generated++;
    }

    return res.status(200).json({
      message: `✅ Payroll generated for ${generated} teacher(s)`,
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

    await generatePayrollForAllTeachers(req, res);
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
      include: [{ model: teacher }]
    });

    res.status(200).json(payrolls);
  } catch (err) {
    console.error('Error fetching payrolls:', err);
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