require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/UserRoute");
const studentRoutes = require('./routes/StudentRoute');
const teacherRoutes = require('./routes/TeacherRoute');
const principalRoutes = require('./routes/PrincipalRoute');
const assignmentRoutes = require('./routes/AssignmentRoutes');
const examformatRoutes=require('./routes/ExamformatRoute');
const feeRoutes = require("./routes/FeeRoutes");
const FormRoutes = require("./routes/FormRoutes");
const galleryRoutes = require("./routes/GalleryRoute");


const academicRoutes=require('./routes/AcademicsRoute');
const  attendanceRoutes=require('./routes/AttendanceRoute');

app.use(express.json());
//routes needs to be defined 
app.use(cors());
PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("Welcome to admin panel");
});

//Routes 
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/principal', principalRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/exam',examformatRoutes);
app.use('/api/fee', feeRoutes);
app.use('/api/forms', FormRoutes);
app.use('/api/academics', academicRoutes);
app.use('/api/attendance',attendanceRoutes);
app.use('/api/image', galleryRoutes);


app.listen(PORT, () => {
  console.log(`Server is up and running on Port: ${PORT}`);
});