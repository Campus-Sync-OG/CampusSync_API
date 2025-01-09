require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
//const UserRoutes = require("./routes/userRoutes");
const studentRoutes = require('./routes/StudentRoute'); 
const teacherRoutes = require('./routes/TeacherRoute');
const principalRoutes = require('./routes/PrincipalRoute');


app.use(express.json());
//routes needs to be defined 
app.use(cors());
PORT = process.env.PORT||3000;
app.get("/", (req, res) => {
  res.send("Welcome to admin panel");
});
//app.use("/api", UserRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api', principalRoutes);

app.listen(PORT, () => {
  console.log(`Server is up and running on Port: ${PORT}`);
});