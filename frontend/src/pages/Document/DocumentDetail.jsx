// components/ResourceDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Document.css';

const DocumentDetail = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3000/documents/detail/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setResource(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load resource');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (!resource) return <p>Tài liệu không tồn tại</p>;

  return (
    <div className="resource-detail">
      <h1>{resource.title}</h1>
      <p>{resource.description}</p>
      <div className="content" dangerouslySetInnerHTML={{ __html: resource.content }} />
      {resource.fileUrl && (
        <a href={resource.fileUrl} className="download-btn" target="_blank" rel="noopener noreferrer">
          Tải tài liệu
        </a>
      )}
      <button onClick={() => navigate(`/documents/${resource.gradeLevel}`)} className="back-btn">
        Quay lại
      </button>
    </div>
  );
};

export default DocumentDetail;