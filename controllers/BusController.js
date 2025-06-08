const { bus, driver, location } = require('../models');

exports.getAllBuses = async (req, res) => {
  try {
    const Bus = await bus.findAll();
    res.json(Bus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch buses' });
  }
};

exports.getBusDetails = async (req, res) => {
  try {
    const Bus = await bus.findOne({
      where: { id: req.params.id },
      include: ['driver', 'location'] // match aliases
    });

    if (!Bus) return res.status(404).json({ error: 'Bus not found' });

    res.json(Bus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bus details' });
  }
};
exports.createBus = async (req, res) => {
  try {
    const { id, bus_number, capacity, route_name } = req.body;

    if (!id || !bus_number || !capacity || !route_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newBus = await bus.create({
      id,
      bus_number,
      capacity,
      route_name
    });

    res.status(201).json({ message: 'Bus created successfully', bus: newBus });
  } catch (err) {
    console.error('Error creating bus:', err);
    res.status(500).json({ error: 'Failed to create bus' });
  }
};