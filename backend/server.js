require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const authRoutes = require("./routes/authRoutes"); // Import auth routes

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Use the authentication routes
app.use("/auth", authRoutes);





app.get("/", (req, res) => {
    res.send("Hello, World! 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
