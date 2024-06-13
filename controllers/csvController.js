const fs = require("fs").promises;
const path = require("path");
const csvWriter = require("csv-writer").createObjectCsvWriter;
const User = require("../Models/User");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const schedule = require("node-schedule");

exports.exportToCsv = async (req, res) => {
  try {
    let users;

    // Check if ids is undefined or empty in req.body
    if (!req.body.ids || req.body.ids.length === 0) {
      // Fetch all users if no IDs are provided
      const usersCount = await User.countDocuments();
      const chunkSize = 200;
      users = [];
      let skip = 0;

      while (skip < usersCount) {
        const chunk = await User.find().skip(skip).limit(chunkSize);
        users = users.concat(chunk);
        skip += chunkSize;
      }
    } else {
      // Fetch users based on provided IDs
      users = await User.find({ _id: { $in: req.body.ids } });
    }

    const uploadsDir = path.join(__dirname, "../uploads");
    const fileName = `users_${uuidv4()}.csv`;
    const filePath = path.join(uploadsDir, fileName);

    // Ensure the uploads directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    const csvWriterInstance = csvWriter({
      path: filePath,
      header: [
        { id: "_id", title: "ID" },
        { id: "name", title: "Name" },
        { id: "email", title: "Email" },
        // Add other headers based on your User model
      ],
    });

    await csvWriterInstance.writeRecords(users);

    const transporter = nodemailer.createTransport({
      service: "Gmail", // Replace with your email service provider
      auth: {
        user: "your_email@gmail.com", // Replace with your email address
        pass: "your_password", // Replace with your email password
      },
    });

    const mailOptions = {
      from: "your_email@gmail.com", // Replace with your email address
      to: "recipient_email@example.com", // Replace with recipient's email address
      subject: "CSV File Link",
      text: `You can download the file from the following link: http://localhost:4001/uploads/${fileName}`,
    };

    const info = await transporter.sendMail(mailOptions);

    // Schedule file deletion after 24 hours
    schedule.scheduleJob(
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      async () => {
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
    );

    res.json({ message: "Email sent", info });
  } catch (err) {
    console.error("Error exporting to CSV:", err);
    res
      .status(500)
      .json({ message: "Error exporting to CSV", error: err.message });
  }
};
