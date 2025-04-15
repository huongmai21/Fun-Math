// routes/coursesRoutes.js
const express = require("express");
const router = express.Router();
const mockCourses = [
  {
    id: 1,
    title: "Khóa học Toán lớp 10",
    description: "Khóa học Toán lớp 10 online.",
    image: "../../frontend/public/assets/images/course1.png", // Hình ảnh thực tế
  },
  {
    id: 2,
    title: "Khóa học Đại số tuyến tính",
    description: "Khóa học Đại số tuyến tính cho sinh viên đại học.",
    image: "../../frontend/public/assets/images/course2.jpg", // Hình ảnh thực tế
  },
  {
    id: 3,
    title: "Khóa học Hình học lớp 8",
    description: "Khóa học Hình học lớp 8 cơ bản.",
    image: "../../frontend/public/assets/images/course3.jpg", // Hình ảnh thực tế
  },
];

router.get("/courses", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.json(mockCourses.slice(0, limit));
});

router.get("/courses/:id", (req, res) => {
  const course = mockCourses.find((item) => item.id === parseInt(req.params.id));
  if (course) {
    res.json(course);
  } else {
    res.status(404).json({ message: "Không tìm thấy khóa học" });
  }
});

module.exports = router;