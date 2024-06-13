const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());

const csvRoutes = require("./routes/csvRoutes");

app.use("/api/uploadCsv", csvRoutes);

const mongodbUri = "mongodb://127.0.0.1:27017/readCsvProject";

mongoose
  .connect(mongodbUri)
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(4001, () => {
  console.log("App is running on PORT 4001");
});
