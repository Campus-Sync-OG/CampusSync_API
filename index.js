require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const UserRoutes = require("./routes/userRoutes");
const studentRoutes = require('./routes/studentRoutes'); 
const AttendanceRoutes=require("./routes/AttendanceRoutes");
const AcademicRoutes=require("./routes/academicRoutes");

app.use(express.json());
//routes needs to be defined 
app.use(cors());
PORT = process.env.PORT||3000;
app.get("/", (req, res) => {
  res.send("Welcome to admin panel");
});
app.use("/api", UserRoutes);
app.use('/api/students', studentRoutes);
app.use("/api/attendance",AttendanceRoutes);
app.use("/api/academic", AcademicRoutes);

app.listen(PORT, () => {
  console.log(`Server is up and running on Port: ${PORT}`);
});