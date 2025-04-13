// Hiển thị danh sách đề thi
// components/ExamList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Exam.css';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3000/api/exams/list', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setExams(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load exams');
        setLoading(false);
      });
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="exam-list">
      <h1>Thi Đấu</h1>
      {(user.role === 'admin' || user.role === 'teacher') && (
        <Link to="/create-exam" className="create-exam-btn">
          Create Exam
        </Link>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="exam-grid">
          {exams.map((exam) => (
            <div key={exam.id} className="exam-card">
              <h3>{exam.title}</h3>
              <p>{exam.description || 'No description'}</p>
              <p>Created: {new Date(exam.created_at).toLocaleDateString()}</p>
              {user.role === 'student' && (
                <button
                  onClick={() => navigate(`/exam/${exam.id}`)}
                  className="take-exam-btn"
                >
                  Take Exam
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamList;