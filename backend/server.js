require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

// Routes
const authRoutes = require("./routes/authRoutes");
const templateRoutes = require('./routes/templates');
const formRoutes = require("./routes/formRoutes");
const questionRoutes = require("./routes/questionRoutes");
const promoteUsers = require("./routes/promoteUsers");

const app = express();

// ====================== MIDDLEWARE ======================
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration (Updated for production)
app.use(cors({
  origin: [
    process.env.FRONTEND_URL, // Netlify URL will go here
    "http://localhost:5173" // Keep for local development
  ],
  credentials: true
}));

// ====================== ROUTES ======================
app.use("/auth", authRoutes);
app.use("/auth", templateRoutes);
app.use("/auth", formRoutes);
app.use("/auth", questionRoutes);
app.use("/auth", promoteUsers);

// ====================== STATIC FILES ======================
// (Warning: Render's filesystem is temporary)
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// ====================== ERROR HANDLING ======================
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// 500 Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// ====================== START SERVER ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode`);
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});