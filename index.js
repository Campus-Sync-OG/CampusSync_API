require('dotenv').config();
const express = require("express"); 
const app = express();
const cors = require("cors");
const http = require("http");

//const { connectRedis } = require('./config/redisClient'); // adjust path
//(async () => {
 //await connectRedis(); // 🧠 important: make sure to call before using the client
//})();

const path = require("path");



const userRoutes = require("./routes/UserRoute");
const studentRoutes = require('./routes/StudentRoute');
const teacherRoutes = require('./routes/TeacherRoute');
const principalRoutes = require('./routes/PrincipalRoute');
const assignmentRoutes = require('./routes/AssignmentRoutes');
const examformatRoutes=require('./routes/ExamformatRoute');
const feeRoutes = require("./routes/FeeRoutes");
const FormRoutes = require("./routes/FormRoutes");
const parentRoutes = require("./routes/ParentRoute");
const galleryRoutes = require("./routes/GalleryRoute");
const academicRoutes=require('./routes/AcademicsRoute');
const attendanceRoutes=require('./routes/AttendanceRoute');
const schoolInfoRoutes = require('./routes/SchoolRoute');
const notificationRoutes = require("./routes/NotificationRoute");
const AnnouncementRoutes = require("./routes/AnnouncementRoute");
const subjectRoutes = require('./routes/SubjectRoute');
const classsectionRoutes=require('./routes/ClassSectionRoutes');
const timetableRoutes=require('./routes/TimetableRoute');
const leavesRoutes = require('./routes/LeavesRoutes');
const studymodulesRoutes = require('./routes/StudymoduleRoute');
const chatRoutes = require('./routes/ChatRoute');
const promotionRoutes = require('./routes/PromotionRoute');
const studentDocumentRoutes = require('./routes/StudentDocumentsRoute');
const calendarRoutes = require('./routes/CalendarRoute');
const circularRoutes = require('./routes/CircularRoute');

const payrollRoutes = require('./routes/PayrollRoute');


const server = http.createServer(app);


app.use("/receipts", express.static(path.join(__dirname, "receipts")));
app.use("/marksheets", express.static(path.join(__dirname, "marksheets")));

app.use(express.json());
//routes needs to be defined 
app.use(
  cors({
    origin: [
      "https://blue-mud-05f8b9e00.7.azurestaticapps.net",
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://campus-synergy.in",
     "https://www.campus-synergy.in"
    ],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true
  })
);

app.options("*", cors());

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
app.use('/api/parents',parentRoutes);
app.use('/api/academics', academicRoutes);
app.use('/api/attendance',attendanceRoutes);
app.use('/api/school', schoolInfoRoutes); // Prefix routes with /api
app.use("/api/notification", notificationRoutes);
app.use('/api/image', galleryRoutes);
app.use('/api/announcement', AnnouncementRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classsection', classsectionRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/studymodules', studymodulesRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/promotion', promotionRoutes);
app.use('/api/studentdocuments', studentDocumentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/circulars', circularRoutes);

app.use('/api/payroll', payrollRoutes);
app.listen(PORT, () => {
  console.log(`Server is up and running on Port: ${PORT}`);
});
