require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const userRoutes = require("./routes/UserRoute");
const studentRoutes = require('./routes/StudentRoute');
const teacherRoutes = require('./routes/TeacherRoute');
const principalRoutes = require('./routes/PrincipalRoute');
const assignmentRoutes = require('./routes/AssignmentRoutes');
const examformatRoutes=require('./routes/ExamformatRoute');
const feeRoutes = require("./routes/FeeRoutes");
const { setupNotificationSocket } = require("./controllers/NotificationController");
const notificationRoutes = require("./routes/NotificationRoute");

const server = http.createServer(app);
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
app.use("/api/notification", notificationRoutes);

setupNotificationSocket(server);
app.listen(PORT, () => {
  console.log(`Server is up and running on Port: ${PORT}`);
});