// components/CreateResource.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Document.css';

const CreateDocument = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gradeLevel, setGradeLevel] = useState('grade1');
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  useEffect(() => {
    if (!user || !['admin', 'teacher'].includes(user.role)) {
      toast.error('You do not have permission to access this page');
      navigate('/exams');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/documents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          gradeLevel,
          content,
          fileUrl,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Document created successfully!');
        navigate(`/documents/${gradeLevel}`);
      } else {
        toast.error(data.message || 'Error creating resource');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  if (!user || !['admin', 'teacher'].includes(user.role)) {
    return null;
  }

  return (
    <div className="create-resource">
      <h1>Tạo tài liệu</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tiêu đề:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mô tả:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Cấp học:</label>
          <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
            <option value="grade1">Cấp 1</option>
            <option value="grade2">Cấp 2</option>
            <option value="grade3">Cấp 3</option>
            <option value="university">Đại học</option>
          </select>
        </div>
        <div>
          <label>Nội dung:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="10"
          />
        </div>
        <div>
          <label>Link tải file (nếu có):</label>
          <input
            type="text"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://example.com/file.pdf"
          />
        </div>
        <button type="submit">Tạo tài liệu</button>
      </form>
    </div>
  );
};

export default CreateDocument;