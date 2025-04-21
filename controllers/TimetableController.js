const { timetable ,class_section} = require("../models");

exports.updateTimetable = async (req, res) => {
    try {
      const { className, section_name, updates } = req.body;
      // updates = [{ day: 'Monday', time: '09:00', subject: 'Math' }, ...]
  
      const classSection = await class_section.findOne({
        where: { className, section_name }
      });
  
      if (!classSection) {
        return res.status(404).json({ error: 'Class and Section not found' });
      }
  
      const classSectionId = classSection.id;
  
      // Loop through each update
      for (const item of updates) {
        const { day, time, subject } = item;
  
        // Check if slot exists
        const existing = await timetable.findOne({
          where: { classSectionId, day, time }
        });
  
        if (existing) {
          // Update existing slot
          await existing.update({ subject });
        } else {
          // Create new slot if not found
          await timetable.create({ classSectionId, day, time, subject });
        }
      }
  
      res.status(200).json({ message: 'Timetable updated successfully' });
  
    } catch (error) {
      console.error('Error updating timetable:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  exports.getTimetable = async (req, res) => {
    try {
      const { className, section_name } = req.params;
  
      // 1. Find the class-section
      const classSection = await class_section.findOne({
        where: { className, section_name }
      });
  
      if (!classSection) {
        return res.status(404).json({ error: 'Class and Section not found' });
      }
  
      // 2. Get all timetable records for that class-section
      const records = await timetable.findAll({
        where: { classSectionId: classSection.id },
        order: [['day', 'ASC'], ['time', 'ASC']]
      });
  
      // 3. Format response as a schedule object grouped by day
      const schedule = {};
      records.forEach(record => {
        if (!schedule[record.day]) {
          schedule[record.day] = [];
        }
        schedule[record.day].push({
          time: record.time,
          subject: record.subject
        });
      });
  
      res.status(200).json({ className, section_name, schedule });
  
    } catch (error) {
      console.error('Error fetching timetable:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  