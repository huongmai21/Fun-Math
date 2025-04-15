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
// const searchRoutes = require("./routes/searchRoutes");
const newsRoutes = require("./routes/newsRoutes");
const examRoutes = require("./routes/examRoutes");
const documentRoutes = require("./routes/documentRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const studyRoomRoutes = require("./routes/studyRoomRoutes");

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/search", searchRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/study-room", studyRoomRoutes);

// Xử lý tất cả các route để trả về index.html (cho React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "public", "index.html"));
});


// app.js (thêm trước module.exports)
console.log("Registered routes:");
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${r.route.path} [${Object.keys(r.route.methods).join(", ")}]`);
  } else if (r.handle && r.handle.stack) {
    r.handle.stack.forEach((subRoute) => {
      if (subRoute.route && subRoute.route.path) {
        console.log(`${r.regexp} -> ${subRoute.route.path} [${Object.keys(subRoute.route.methods).join(", ")}]`);
      }
    });
  }
});

module.exports = app;