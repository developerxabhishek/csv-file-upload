const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const multer = require("multer");
const User = require("../Models/User");

// Define the destination directory for storing CSV files
const uploadDir = path.join(__dirname, "csv");
// Ensure the directory exists, if not create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    var ext = path.extname(file.originalname);

    if (ext !== ".csv") {
      return cb(new Error("Only csvs are allowed!"));
    }

    cb(null, true);
  },
}).single("csvFile");

exports.create = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error" });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const totalRecords = [];
    try {
      fs.createReadStream(req.file.path)
        .pipe(csv.parse({ headers: true }))
        .on("error", (error) => console.error(error))
        .on("data", (row) => totalRecords.push(row))
        .on("end", async (rowCount) => {
          try {
            const users = await User.insertMany(totalRecords);
            res.json(users);
          } catch (err) {
            res.status(400).json(err);
          }
        });
    } catch (error) {
      res.status(400).json(error);
    }
  });
};
