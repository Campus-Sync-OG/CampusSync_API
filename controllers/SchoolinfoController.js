const { schoolinfo } = require('../models');

// Retrieve all school records
exports.getAll = async (req, res) => {
  try {
    const schools = await schoolinfo.findAll();
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Retrieve a single school record by ID
exports.getById = async (req, res) => {
  try {
    const school = await schoolinfo.findByPk(req.params.id);
    if (!school) return res.status(404).json({ error: 'School not found' });
    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a school record
exports.delete = async (req, res) => {
  try {
    const deleted = await schoolinfo.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'School not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
