const csv = require("csv-parse");
const User = require("../Models/User");
const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    var ext = file.originalname.split(".").pop();
    if (ext !== "csv") {
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

    try {
      csv.parse(
        req.file.buffer.toString(),
        { columns: true },
        async (err, data) => {
          if (err) {
            return res.status(400).json({ message: "Error parsing CSV" });
          }
          try {
            const users = await User.insertMany(data);
            res.json(users);
          } catch (err) {
            res.status(400).json(err);
          }
        }
      );
    } catch (error) {
      res.status(400).json(error);
    }
  });
};
