import News from '../models/News.js';

exports.getNews = async (req, res) => {
  try {
    const news = await News.find();
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy tin tức', error: err.message });
  }
};