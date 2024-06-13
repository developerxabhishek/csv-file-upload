const express = require("express");
const csvController = require("../controllers/csvController");

const router = express.Router();

// Post request to upload CSV file and save data
// router.post("/create", csvController.create);
router.get("/get", csvController.exportToCsv);

module.exports = router;
