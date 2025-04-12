// app.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// Load env vars
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// Create Express app
const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ các file tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));

const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");
const newsRoutes = require("./routes/newsRoutes");
const examRoutes = require("./routes/examRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const questionRoutes = require("./routes/questionsRoutes");
const chatRoomRoutes = require("./routes/chatRoomsRoutes");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/chat-rooms", chatRoomRoutes);

// Xử lý tất cả các route để trả về index.html (cho React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "public", "index.html"));
});


module.exports = app;