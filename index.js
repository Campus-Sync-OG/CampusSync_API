require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/UserRoute");
const studentRoutes = require('./routes/StudentRoute'); 
const teacherRoutes = require('./routes/TeacherRoute');
const principalRoutes = require('./routes/PrincipalRoute');
const academicsRoutes = require('./routes/AcademicsRoute');

app.use(express.json());
//routes needs to be defined 
app.use(cors());
PORT = process.env.PORT||3000;
app.get("/", (req, res) => {
  res.send("Welcome to admin panel");
});

//Routes 
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api', principalRoutes);
app.use('/api/academics', academicsRoutes);

app.listen(PORT, () => {
  console.log(`Server is up and running on Port: ${PORT}`);
});