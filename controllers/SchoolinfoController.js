const SchoolInfo = require('../models/schoolinfo');

// Create a new school record
exports.create = async (req, res) => {
  try {
    const school = await SchoolInfo.create(req.body);
    res.status(201).json(school);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Retrieve all school records
exports.getAll = async (req, res) => {
  try {
    const schools = await SchoolInfo.findAll();
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Retrieve a single school record by ID
exports.getById = async (req, res) => {
  try {
    const school = await SchoolInfo.findByPk(req.params.id);
    if (!school) return res.status(404).json({ error: 'School not found' });
    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a school record
exports.update = async (req, res) => {
  try {
    const [updated] = await SchoolInfo.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) return res.status(404).json({ error: 'School not found' });
    const updatedSchool = await SchoolInfo.findByPk(req.params.id);
    res.status(200).json(updatedSchool);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a school record
exports.delete = async (req, res) => {
  try {
    const deleted = await SchoolInfo.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'School not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
