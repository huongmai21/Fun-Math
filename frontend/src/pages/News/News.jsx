// frontend/src/pages/News.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNews, setNewNews] = useState({ title: '', content: '', tags: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/news', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Không thể lấy tin tức');
        }

        const data = await response.json();
        setNews(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        toast.error('Lỗi khi lấy tin tức');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleInputChange = (e) => {
    setNewNews({ ...newNews, [e.target.name]: e.target.value });
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const tagsArray = newNews.tags ? newNews.tags.split(',').map(tag => tag.trim()) : [];
      const response = await fetch('http://localhost:3000/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newNews.title,
          content: newNews.content,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo tin tức');
      }

      const createdNews = await response.json();
      setNews([createdNews, ...news]);
      setNewNews({ title: '', content: '', tags: '' });
      toast.success('Tạo tin tức thành công!');
    } catch (err) {
      console.error('Error creating news:', err);
      toast.error('Lỗi khi tạo tin tức');
    }
  };

  return (
    <div className="news-container">
      <h1>Tin tức</h1>

      {/* Form tạo tin tức (chỉ hiển thị cho admin) */}
      {user.role === 'admin' && (
        <form onSubmit={handleCreateNews} className="news-form">
          <h2>Tạo tin tức mới</h2>
          <div className="form-group">
            <label>Tiêu đề:</label>
            <input
              type="text"
              name="title"
              value={newNews.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Nội dung:</label>
            <textarea
              name="content"
              value={newNews.content}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Tags (cách nhau bằng dấu phẩy):</label>
            <input
              type="text"
              name="tags"
              value={newNews.tags}
              onChange={handleInputChange}
              placeholder="VD: toán học, thi đấu"
            />
          </div>
          <button type="submit">Tạo tin tức</button>
        </form>
      )}

      {/* Danh sách tin tức */}
      {loading ? (
        <p>Đang tải tin tức...</p>
      ) : news.length === 0 ? (
        <p>Chưa có tin tức nào.</p>
      ) : (
        <div className="news-list">
          {news.map((item) => (
            <div key={item._id} className="news-item">
              <h2>{item.title}</h2>
              <p className="news-meta">
                Đăng bởi: User ID {item.userId} | Ngày đăng:{' '}
                {new Date(item.created_at).toLocaleDateString()}
              </p>
              <div className="news-content">{item.content}</div>
              {item.tags && item.tags.length > 0 && (
                <div className="news-tags">
                  Tags: {item.tags.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;