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
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      const filePath = path.join(__dirname, '..', req.file.path);

      try {
        const rows = await new Promise((resolve, reject) => {
          const data = [];
          fs.createReadStream(filePath)
            .pipe(
              csvParser({
                mapHeaders: ({ header }) => header.trim().toLowerCase(),
              })
            )
            .on('data', (row) => {
              const uname = String(row.uname || '').trim();
              const name = String(row.name || '').trim();
              const username = String(row.username || '').trim();
              const password = String(row.password || '').trim();
              const roll_no = parseInt((row.roll_no || '').trim(), 10);
              const classNumber = parseInt((row.class || '').trim(), 10);
              const section = String(row.section || '').trim();

              console.log('Parsed Row from CSV:', {
                uname,
                name,
                username,
                password,
                roll_no,
                class: classNumber,
                section,
              });

              if (
                uname &&
                name &&
                username &&
                password &&
                !isNaN(roll_no) &&
                !isNaN(classNumber) &&
                section
              ) {
                data.push({
                  uname,
                  name,
                  username,
                  password,
                  roll_no,
                  classNumber,
                  section,
                });
              } else {
                console.warn('Invalid row (missing required fields or invalid data):', {
                  uname,
                  name,
                  username,
                  password,
                  roll_no,
                  class: classNumber,
                  section,
                });
              }
            })
            .on('end', () => resolve(data))
            .on('error', (err) => reject(err));
        });

        for (const update of rows) {
          const { uname, name, username, password, roll_no, classNumber, section } = update;

          try {
            const user = await User.findOne({ where: { uname } });
            if (!user) {
              console.warn(`User not found for uname: ${uname}`);
              continue;
            }

            console.log('Upserting student data:', {
              name,
              username,
              password,
              roll_no,
              class: classNumber,
              section,
              user_class_teacher_id: user.id,
            });

            await Student.upsert({
              name,
              username,
              password,
              roll_no,
              class: classNumber,
              section,
              user_class_teacher_id: user.id,
            });

            console.log(`Successfully upserted student record for ${name}`);
          } catch (error) {
            console.error('Error inserting/updating student data:', error);
          }
        }

        fs.unlinkSync(filePath);
        res.status(200).json({ message: 'CSV processed successfully and data updated.' });
      } catch (error) {
        console.error('Error during CSV processing:', error);
        res.status(500).json({ message: 'Error processing the file.' });
      }
    },
  ],
};
