require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const templateRoutes = require("./routes/templateRoutes");
const formRoutes = require("./routes/formRoutes")

const app = express();

// ✅ Middleware order matters!
app.use(cors({
    origin: 'http://localhost:5173',  // your frontend URL
    credentials: true
}));
app.use(express.json()); // 👈 Ensure JSON body parsing
app.use(express.urlencoded({ extended: true })); // 👈 Ensure form parsing

// ✅ Authentication routes
app.use("/auth", authRoutes);


// ✅ Template routes
app.use("/auth", templateRoutes);  // <-- Register the template routes with the `/templates` prefix

app.use("/auth", formRoutes);


app.get("/", (req, res) => {
    res.send("Hello, World! 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
