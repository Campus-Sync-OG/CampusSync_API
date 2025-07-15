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

    // Fetch component types from DB
    const allTypes = await component_type.findAll();
    const typeMap = new Map();
    allTypes.forEach(type => typeMap.set(type.name.trim().toLowerCase(), type.type));

    // Enrich the input with the correct type based on component name
    const enrichedComponents = component_values.map(comp => {
      const typeFromDB = typeMap.get(comp.name.trim().toLowerCase());
      return {
        name: comp.name.trim(),
        amount: comp.amount,
        is_percentage: comp.is_percentage,
        type: typeFromDB || 'earning' // default to 'earning' if not found
      };
    });

    // Overwrite existing components
    await salary_component.destroy({ where: { structure_id } });

    // Save new set
    const result = await salary_component.create({
      structure_id,
      component_values: enrichedComponents
    });

    return res.status(201).json({
      message: '✅ Component values saved successfully.',
      result
    });

  } catch (err) {
    console.error('❌ Component creation failed:', err);
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





exports.generatePayrollForAllTeachers = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).json({ error: 'Month is required in the request body' });
    }

    // Ensure correct format for DB comparison
    const parsedMonth = `${month}`; // Convert "2025-07" to "2025-07-01"

    // Step 1: Get all active teachers with valid salary structure
    const teachers = await teacher.findAll({
      where: {
        status: 'active',
        salary_structure_id: { [Op.ne]: null },
        emp_id: { [Op.ne]: null }
      },
      attributes: ['emp_id', 'salary_structure_id']
    });

    // Step 2: Fetch all salary structures and their components
    const structures = await salary_structure.findAll();
    const components = await salary_component.findAll();

    // Step 3: Create lookup maps
    const structureMap = new Map();
    structures.forEach(s => structureMap.set(s.id, parseFloat(s.base_salary)));

    const componentMap = new Map();
    components.forEach(c => {
      componentMap.set(c.structure_id, c.component_values); // Array of component objects
    });

    let generated = 0;
    const failed = [];

    // Step 4: Generate payroll per teacher
    for (const t of teachers) {
      const empId = t.emp_id;
      const structureId = t.salary_structure_id;
      const baseSalary = structureMap.get(structureId);
      const componentValues = componentMap.get(structureId);

      if (!baseSalary || !componentValues) {
        failed.push({ emp_id: empId, reason: 'Missing base salary or components' });
        continue;
      }

      let totalEarnings = 0;
      let totalDeductions = 0;
      const earningsBreakdown = [];
      const deductionsBreakdown = [];

      for (const comp of componentValues) {
        const isPercentage = comp.is_percentage === true || comp.is_percentage === 'true';
        const rawAmount = parseFloat(comp.amount);

        if (isNaN(rawAmount)) {
          failed.push({ emp_id: empId, reason: `Invalid amount for component "${comp.name}"` });
          continue;
        }

        const amount = comp.is_percentage == true 
          ? (baseSalary * (rawAmount/ 100)) 
          : rawAmount;


        const roundedAmount = parseFloat(amount.toFixed(2));

        const entry = {
          name: comp.name,
          amount: roundedAmount
        };

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

      // Step 5: Remove previous payroll if exists
      await payroll_record.destroy({
        where: {
          employee_id: empId,
          month: parsedMonth
        }
      });

      // Step 6: Save payroll record
      await payroll_record.create({
        employee_id: empId,
        salary_structure_id: structureId,
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

exports.getTeacherPayrollById = async (req, res) => {
  try {
    const { emp_id } = req.params;

    if (!emp_id) {
      return res.status(400).json({ error: 'emp_id is required' });
    }

    const records = await payroll_record.findAll({
      where: { employee_id: emp_id },
      
      order: [['month', 'DESC']],
    });

    return res.status(200).json(records);
  } catch (error) {
    console.error('Error in getTeacherPayrollById:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getAllPayrolls = async (req, res) => {
  try {
    const records = await payroll_record.findAll();
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payrolls' });
  }
};