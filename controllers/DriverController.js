const { driver, bus } = require('../models');

exports.getAllDrivers = async (req, res) => {
  try {
    const Driver = await driver.findAll({
      include: ['bus'] // optional, if you want to show associated bus info
    });
    res.json(Driver);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
};

 // Adjust path as needed

exports.createDriver = async (req, res) => {
  try {
    const { id, name, phone, license_no, bus_id } = req.body;

    if (!id || !name || !phone || !license_no || !bus_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if bus exists
    const foundBus = await bus.findByPk(bus_id);
    if (!foundBus) {
      return res.status(404).json({ error: 'Bus ID not found' });
    }

    const newDriver = await driver.create({
      id,
      name,
      phone,
      license_no,
      bus_id
    });

    res.status(201).json({ message: 'Driver created successfully', driver: newDriver });
  } catch (err) {
    console.error('Error creating driver:', err);
    res.status(500).json({ error: 'Failed to create driver' });
  }
};
