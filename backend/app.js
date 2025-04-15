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
const courseRoutes = require("./routes/courseRoutes");
const studyRoomRoutes = require("./routes/studyRoomRoutes");

// // Kiểm tra handler trước khi dùng
// console.log("authRoutes:", typeof authRoutes);
// // console.log("searchRoutes:", typeof searchRoutes);
// console.log("newsRoutes:", typeof newsRoutes);
// console.log("examRoutes:", typeof examRoutes);
// console.log("documentRoutes:", typeof documentRoutes);
// console.log("courseRoutes details:", courseRoutes);
// console.log("studyRoomRoutes:", typeof studyRoomRoutes);

// Routes
app.use("/auth", authRoutes);
// app.use("/api/search", searchRoutes);
app.use("/news", newsRoutes);
app.use("/exams", examRoutes);
app.use("/documents", documentRoutes);
app.use("/courses", courseRoutes);
app.use("/study-room", studyRoomRoutes);

// Xử lý tất cả các route để trả về index.html (cho React Router)
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "public", "index.html"));
});


// app.js (thêm trước module.exports)
console.log("Registered routes:");
app._router.stack.forEach((layer) => {
  if (layer.route) {
    console.log(`${layer.route.path} => [${Object.keys(layer.route.methods).join(", ")}]`);
  } else if (layer.name === "router" && layer.handle.stack) {
    layer.handle.stack.forEach((nested) => {
      if (nested.route) {
        console.log(`(nested) ${nested.route.path} => [${Object.keys(nested.route.methods).join(", ")}]`);
      }
    });
  }
});


module.exports = app;