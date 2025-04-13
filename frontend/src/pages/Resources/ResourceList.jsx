// src/components/Resource/ResourceList.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Resource.css';

const ResourceList = () => {
  const { grade } = useParams(); // grade: grade1, grade2, grade3, university
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login'); // Sử dụng navigate
      return;
    }

    fetch(`http://localhost:3000/api/resources/${grade}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load resources');
        setLoading(false);
      });
  }, [grade, navigate]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="resource-list">
      <h1>Tài liệu {grade === 'grade1' ? 'Cấp 1' : grade === 'grade2' ? 'Cấp 2' : grade === 'grade3' ? 'Cấp 3' : 'Đại học'}</h1>
      {(user.role === 'admin' || user.role === 'teacher') && (
        <Link to="/resources/create" className="create-resource-btn">
          Tạo tài liệu
        </Link>
      )}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="resource-grid">
          {resources.length === 0 ? (
            <p>Chưa có tài liệu nào cho cấp học này.</p>
          ) : (
            resources.map((resource) => (
              <div key={resource.id} className="resource-card">
                <h3>{resource.title}</h3>
                <p>{resource.description || 'Không có mô tả'}</p>
                <p>Ngày tạo: {new Date(resource.createdAt).toLocaleDateString()}</p>
                <Link to={`/resources/detail/${resource.id}`} className="view-btn">
                  Xem chi tiết
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceList;