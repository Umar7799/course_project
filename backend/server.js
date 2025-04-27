require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const templateRoutes = require('./routes/templates');
const formRoutes = require("./routes/formRoutes")
const questionRoutes = require("./routes/questionRoutes")
const promoteUsers = require("./routes/promoteUsers")
const cookieParser = require('cookie-parser');

const path = require('path');

const app = express();


// Serve static files (images) from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cookieParser());

// ✅ Middleware order matters!
app.use(cors({
    origin: 'http://localhost:5173',  // your frontend URL
    credentials: true
}));
app.use(express.json()); // 👈 Ensure JSON body parsing
app.use(express.urlencoded({ extended: true })); // 👈 Ensure form parsing

// ✅ Authentication routes
app.use("/auth", authRoutes);

app.use("/auth", templateRoutes);


app.use("/auth", formRoutes);

app.use("/auth", questionRoutes);

app.use("/auth", promoteUsers);


app.get("/", (req, res) => {
    res.send("Hello, World! 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
