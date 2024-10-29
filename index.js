require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
//routes needs to be defined 
app.use(cors());
PORT = process.env.PORT||3001;
app.get("/", (req, res) => {
  res.send("Welcome to admin panel");
});

app.listen(PORT, () => {
  console.log(`Server is up and running on Port: ${PORT}`);
});