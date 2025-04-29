require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("@prisma/client"); // Added Prisma import

// Initialize Prisma
const prisma = new PrismaClient();

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
    "https://course-project-quizapp.netlify.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Database connection health check (MOVED BEFORE ROUTES)
app.use(async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    next();
  } catch (err) {
    console.error("Database connection failed:", err);
    return res.status(503).json({ 
      error: "Service unavailable",
      details: "Database connection failed"
    });
  }
});

// ====================== ROUTES ======================
app.use("/auth", authRoutes);
app.use("/auth", templateRoutes);
app.use("/auth", formRoutes);
app.use("/auth", questionRoutes);
app.use("/auth", promoteUsers);



// Add this new route 👇
app.get("/", (req, res) => {
    res.send("Backend is working! ✅");
  });





// ====================== STATIC FILES ======================
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
} else {
  app.use("/uploads", (req, res) => {
    res.status(403).json({ 
      error: "Forbidden",
      message: "File uploads are disabled in production"
    });
  });
}

// ====================== ERROR HANDLING ======================
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    availableEndpoints: ["/auth"]
  });
});

// 500 Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ 
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ====================== START SERVER ======================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode`);
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});

// Prisma shutdown hook
process.on("SIGTERM", async () => {
  console.log("Shutting down server...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server terminated");
  });
});

