const {
  teacher,
  salary_structure,
  salary_component,
  payroll_record
} = require('../models');
const { Op } = require('sequelize');
const cron = require('node-cron');

exports.processPayroll = async (req, res) => {
  const { employee_id, month } = req.body;

  try {
    // 1. Load Teacher and Salary Structure + Components
    const emp = await teacher.findOne({
      where: { emp_id: employee_id },
      include: {
        model: salary_structure,
        include: salary_component
      }
    });

    if (!emp) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const baseSalary = emp.salary_structure.base_salary;
    const components = emp.salary_structure.salary_components;

    let earnings = 0;
    let deductions = 0;
    const breakdown = {};

    // 2. Calculate components
    components.forEach(comp => {
      const value = comp.is_percentage
        ? (baseSalary * comp.amount) / 100
        : comp.amount;

      breakdown[comp.name] = value;

      if (comp.type === 'earning') earnings += value;
      else if (comp.type === 'deduction') deductions += value;
    });

    const net_pay = earnings - deductions;

    // 3. Save in payroll_record
    const record = await payroll_record.create({
      employee_id: emp.emp_id,
      month,
      earnings,
      deductions,
      net_pay,
      components_breakdown: breakdown,
      status: 'processed'
    });

    res.status(201).json({
      message: 'Payroll processed successfully',
      data: record
    });
  } catch (err) {
    console.error('Payroll Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.addComponentsToStructure = async (req, res) => {
  try {
    const { structure_id, components } = req.body;

    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ error: 'components array is required' });
    }

    const componentData = components.map(comp => ({
      structure_id,
      name: comp.name,
      type: comp.type,
      amount: comp.amount,
      is_percentage: comp.is_percentage
    }));

    await salary_component.bulkCreate(componentData);

    res.status(201).json({
      message: 'Salary components added successfully'
    });
  } catch (err) {
    console.error('Error adding components:', err);
    res.status(500).json({ error: 'Component insertion failed' });
  }
};


exports.createSalaryStructure = async (req, res) => {
  try {
    const { name, base_salary, is_default, school_id } = req.body;

    const structure = await salary_structure.create({
      name,
      base_salary,
      is_default,
      school_id
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
    if (!month) return res.status(400).json({ error: 'Month is required' });

    const teachers = await teacher.findAll({
      where: {
        status: 'active',
        salary_structure_id: { [Op.ne]: null }
      }
    });

    // Cache all structures and components to avoid repeated DB calls
    const structures = await salary_structure.findAll();
    const components = await salary_component.findAll();

    const structureMap = new Map();
    structures.forEach(s => structureMap.set(s.id, s));

    const componentMap = new Map();
    components.forEach(c => {
      if (!componentMap.has(c.structure_id)) {
        componentMap.set(c.structure_id, []);
      }
      componentMap.get(c.structure_id).push(c);
    });

    let skipped = [];
    let generated = 0;

    await Promise.all(teachers.map(async (t) => {
      const existing = await payroll_record.findOne({
        where: { employee_id: t.emp_id, month }
      });

      if (existing) {
        skipped.push(t.emp_id);
        return;
      }

      const structure = structureMap.get(t.salary_structure_id);
      if (!structure) {
        skipped.push(t.emp_id);
        return;
      }

      const comps = componentMap.get(structure.id) || [];
      const base_salary = structure.base_salary;

      let totalEarnings = 0;
      let totalDeductions = 0;
      const earnings = [], deductions = [];

      for (const comp of comps) {
        const amount = comp.is_percentage ? (base_salary * comp.amount) / 100 : comp.amount;
        const row = { name: comp.name, amount };

        if (comp.type === 'earning') {
          earnings.push(row);
          totalEarnings += amount;
        } else if (comp.type === 'deduction') {
          deductions.push(row);
          totalDeductions += amount;
        }
       
      }

      const net_pay = totalEarnings - totalDeductions;

      await payroll_record.create({
        employee_id: t.emp_id,
        salary_structure_id: structure.id,
        base_salary,
        earnings,
        deductions,
        net_pay,
        month,
        status: 'processed'
      });

      generated++;
    }));

    res.status(200).json({
      message: `✅ Payroll generated for ${generated} teacher(s)`,
      skipped: skipped.length > 0 ? skipped : undefined
    });

  } catch (err) {
    console.error('❌ Payroll generation error:', err);
    res.status(500).json({ error: 'Payroll generation failed' });
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

    res.status(200).json({ month, count: payrolls.length, payrolls });
  } catch (err) {
    console.error('Error fetching payrolls:', err);
    res.status(500).json({ error: 'Failed to fetch payrolls' });
  }
};
