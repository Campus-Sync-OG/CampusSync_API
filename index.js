require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const UserRoutes = require("./routes/UserRoutes");
const studentRoutes = require('./routes/StudentRoutes'); 
const AttendanceRoutes=require("./routes/AttendanceRoutes");


app.use(express.json());
//routes needs to be defined 
app.use(cors());
PORT = process.env.PORT||3000;
app.get("/", (req, res) => {
  res.send("Welcome to admin panel");
});
app.use("/api", UserRoutes);
app.use('/api', studentRoutes);
app.use("/api/attendance",AttendanceRoutes);
app.listen(PORT, () => {
  console.log(`Server is up and running on Port: ${PORT}`);
});