const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const { errorHandler } = require("./middlewares/errorMiddleware");
const path = require("path");

dotenv.config();

connectDB();

const app = express();
const buildPath = path.join(__dirname, "..", "..", "intern-stack", "dist");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(buildPath));
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

app.get("*", (req, res) => {
  console.log("Route :->>> ", req.url);
  res.sendFile(path.join(buildPath, "index.html"));
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
