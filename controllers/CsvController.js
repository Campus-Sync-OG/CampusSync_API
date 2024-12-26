const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const multer = require('multer');
const User = require('../models/users');
const Student = require('../models/student');

const upload = multer({ dest: 'uploads/' });

module.exports = {
  uploadStudentCSV: [
    upload.single('file'),
    async (req, res) => {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

      const filePath = path.join(__dirname, '..', req.file.path);

      try {
        const rows = await new Promise((resolve, reject) => {
          const data = [];
          fs.createReadStream(filePath)
            .pipe(csvParser({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
            .on('data', (row) => {
              const { uname, name, username, password, roll_no, class: classNumber, section } = row;
              const parsedRow = {
                uname: String(uname || '').trim(),
                name: String(name || '').trim(),
                username: String(username || '').trim(),
                password: String(password || '').trim(),
                roll_no: parseInt((roll_no || '').trim(), 10),
                class: parseInt((classNumber || '').trim(), 10),
                section: String(section || '').trim(),
              };
              if (parsedRow.uname && parsedRow.name && parsedRow.username && parsedRow.password && !isNaN(parsedRow.roll_no) && !isNaN(parsedRow.class) && parsedRow.section) {
                data.push(parsedRow);
              } else {
                console.warn('Invalid row (missing required fields or invalid data):', parsedRow);
              }
            })
            .on('end', () => resolve(data))
            .on('error', reject);
        });

        await Promise.all(rows.map(async ({ uname, name, username, password, roll_no, class: classNumber, section }) => {
          try {
            const user = await User.findOne({ where: { uname } });
            if (user) {
              await Student.upsert({ name, username, password, roll_no, class: classNumber, section, user_class_teacher_id: user.id });
              console.log(`Successfully upserted student record for ${name}`);
            } else {
              console.warn(`User not found for uname: ${uname}`);
            }
          } catch (error) {
            console.error('Error inserting/updating student data:', error);
          }
        }));

        fs.unlinkSync(filePath);
        res.status(200).json({ message: 'CSV processed successfully and data updated.' });
      } catch (error) {
        console.error('Error during CSV processing:', error);
        res.status(500).json({ message: 'Error processing the file.' });
      }
    },
  ],
};
