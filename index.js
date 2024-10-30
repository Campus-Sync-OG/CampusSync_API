require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

app.use(express.json());
//routes needs to be defined 
app.use(cors());
PORT = process.env.PORT||3000;
app.get("/", (req, res) => {
  res.send("Welcome to admin panel");
});
app.use("/api/", userRoutes);
app.listen(PORT, () => {
  console.log(`Server is up and running on Port: ${PORT}`);
});