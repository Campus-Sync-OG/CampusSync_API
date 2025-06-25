const { timetable ,class_section,student} = require("../models");

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
  
  exports.getTimetableByAdmissionNo = async (req, res) => {
    try {
      const { admission_no } = req.params;
  
      // 1. Find any one record to get class/section info
      const classSectionRecord = await timetable.findOne({
        where: { admission_no }
      });
  
      if (!classSectionRecord) {
        return res.status(404).json({ error: 'Class and Section not found for this admission number' });
      }
  
      const className = classSectionRecord.class;
      const section_name = classSectionRecord.section;
  
      // 2. Fetch all timetable records for that class/section
      const records = await timetable.findAll({
        where: { class: className, section: section_name },
        order: [['day', 'ASC'], ['time', 'ASC']],
      });
  
      // 3. Group timetable by day
      const schedule = {};
      records.forEach(record => {
        if (!schedule[record.day]) {
          schedule[record.day] = [];
        }
        schedule[record.day].push({
          time: record.time,
          subject: record.subject,
        });
      });
  
      // 4. Send response
      res.status(200).json({
        admission_no,
        class: className,
        section: section_name,
        schedule,
      });
  
    } catch (error) {
      console.error('Error fetching timetable by admission number:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  exports.getTimetableByClassSection = async (req, res) => {
  try {
    const { class_name, section_name } = req.query;

    if (!class_name || !section_name) {
      return res.status(400).json({ error: 'class_name and section_name are required in query params' });
    }

    const records = await timetable.findAll({
      where: { class: class_name, section: section_name },
      order: [['day', 'ASC'], ['time', 'ASC']],
    });

    if (!records.length) {
      return res.status(404).json({ message: "No timetable found for the given class and section" });
    }

    // Group timetable by day
    const schedule = {};
    records.forEach(record => {
      if (!schedule[record.day]) {
        schedule[record.day] = [];
      }
      schedule[record.day].push({
        time: record.time,
        subject: record.subject,
      });
    });

    res.status(200).json({
      class: class_name,
      section: section_name,
      schedule,
    });

  } catch (error) {
    console.error('Error fetching timetable by class and section:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
