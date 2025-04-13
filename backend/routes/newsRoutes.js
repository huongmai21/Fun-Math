// routes/newsRoutes.js
const express = require("express");
const router = express.Router();

const mockNews = [
  {
    id: 1,
    title: "Cải cách giáo dục 2025",
    description: "Thông tin về cải cách giáo dục mới nhất.",
    image: "../../frontend/public/assets/images/news1.jpg", // Hình ảnh thực tế
  },
  {
    id: 2,
    title: "Tạp chí Toán số 10",
    description: "Tạp chí Toán học số mới nhất.",
    image: "../../frontend/public/assets/images/news2.jpg", // Hình ảnh thực tế
  },
  {
    id: 3,
    title: "Hội thảo Toán học quốc tế",
    description: "Hội thảo Toán học quốc tế diễn ra tại Hà Nội.",
    image: "/assets/images/news3.jpg", // Hình ảnh thực tế
  },
];

router.get("/news", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.json(mockNews.slice(0, limit));
});

router.get("/news/:id", (req, res) => {
  const newsItem = mockNews.find((item) => item.id === parseInt(req.params.id));
  if (newsItem) {
    res.json(newsItem);
  } else {
    res.status(404).json({ message: "Không tìm thấy tin tức" });
  }
});

module.exports = router;