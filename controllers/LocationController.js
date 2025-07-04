const { location } = require('../models');

exports.updateLocation = async (req, res) => {
  try {
    const { bus_id, latitude, longitude } = req.body;

    if (!bus_id || !latitude || !longitude) {
      return res.status(400).json({ error: 'All fields required' });
    }

    await location.upsert({
      bus_id,
      latitude,
      longitude,
      updated_at: new Date()
    });

    res.status(200).json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getLocation = async (req, res) => {
  try {
    const { bus_id } = req.params;
    const Location = await location.findOne({ where: { bus_id } });

    if (!Location) return res.status(404).json({ error: 'Location not found' });

    res.json(Location);
  } catch (err) {
    console.error('Error fetching location:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
