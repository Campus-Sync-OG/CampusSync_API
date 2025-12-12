require('dotenv').config();
const express = require("express"); 
const app = express();
const cors = require("cors");
const http = require("http");
const { initSocket } = require('./services/cloudSocket'); // <- already present

// const { connectRedis } = require('./config/redisClient'); // adjust path
// (async () => {
//  await connectRedis();
// })();

const path = require("path");

// --- routes (yours) ---
const userRoutes = require("./routes/UserRoute");
const studentRoutes = require('./routes/StudentRoute');
const teacherRoutes = require('./routes/TeacherRoute');
const principalRoutes = require('./routes/PrincipalRoute');
const assignmentRoutes = require('./routes/AssignmentRoutes');
const examformatRoutes = require('./routes/ExamformatRoute');
const feeRoutes = require("./routes/FeeRoutes");
const FormRoutes = require("./routes/FormRoutes");
const parentRoutes = require("./routes/ParentRoute");
const galleryRoutes = require("./routes/GalleryRoute");
const academicRoutes=require('./routes/AcademicsRoute');
const attendanceRoutes=require('./routes/AttendanceRoute');
const schoolInfoRoutes = require('./routes/SchoolRoute');
const notificationRoutes = require("./routes/NotificationRoute");
const AnnouncementRoutes = require("./routes/AnnouncementRoute");
const subjectRoutes = require("./routes/SubjectRoute");
const classsectionRoutes=require('./routes/ClassSectionRoutes');
const timetableRoutes=require('./routes/TimetableRoute');
const leavesRoutes = require('./routes/LeavesRoutes');
const studymodulesRoutes = require('./routes/StudymoduleRoute');
const chatRoutes = require('./routes/ChatRoute');
const promotionRoutes = require('./routes/PromotionRoute');
const studentDocumentRoutes = require('./routes/StudentDocumentsRoute');
const calendarRoutes = require('./routes/CalendarRoute');
const circularRoutes = require('./routes/CircularRoute');
const locationRoutes = require('./routes/LocationRoutes');
const busRoutes = require('./routes/BusRoutes');
const driverRoutes = require('./routes/DriverRoutes');
const payrollRoutes = require('./routes/PayrollRoute');
const marksRoutes = require('./routes/MarksRoute');
const tallyRoutes = require('./routes/tally');

// you created a server variable earlier; it's okay to keep it (unused) or remove it.
// const server = http.createServer(app);

app.use("/receipts", express.static(path.join(__dirname, "receipts")));
app.use("/marksheets", express.static(path.join(__dirname, "marksheets")));

app.use(express.json());
app.use(cors({}));

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
app.use('/api/school', schoolInfoRoutes);
app.use("/api/notification", notificationRoutes);
app.use('/api/image', galleryRoutes);
app.use('/api/announcement', AnnouncementRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classsection', classsectionRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/studymodules', studymodulesRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/promotion', promotionRoutes);
app.use('/api/studentdocuments', studentDocumentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/circulars', circularRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/tally', tallyRoutes);
app.use('/api/payroll', payrollRoutes);

// ----------------- NEW: initialize socket server for Tally-agent real-time push -----------------
// This will start a separate Socket.IO server (default port = SOCKET_PORT or 3001).
// It will not replace or interfere with your existing Express HTTP server.
initSocket({ app, port: Number(process.env.SOCKET_PORT || 3001) });
// ---------------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server is up and running on Port: ${PORT}`);
});
