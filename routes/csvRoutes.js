const express = require("express");
const csvController = require("../controllers/csvController");

const router = express.Router();

// Post request to upload CSV file and save data
router.post("/create", csvController.create);

module.exports = router;
