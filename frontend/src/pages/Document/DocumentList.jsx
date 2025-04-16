import React, { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { fetchDocuments } from "../../services/documentService";
import "./Document.css";

const educationLevelMap = {
  grade1: "primary",
  grade2: "secondary",
  grade3: "highschool",
  university: "university",
};

const gradeMap = {
  grade1: ["1", "2", "3", "4", "5"],
  grade2: ["6", "7", "8", "9"],
  grade3: ["10", "11", "12"],
};

const universitySubjects = [
  { value: "advanced_math", label: "Toán cao cấp" },
  { value: "calculus", label: "Giải tích" },
  { value: "algebra", label: "Đại số" },
  { value: "probability_statistics", label: "Xác suất thống kê" },
  { value: "differential_equations", label: "Phương trình vi phân" },
];

const DocumentList = () => {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  const [documents, setDocuments] = useState([]);
  const [filters, setFilters] = useState({ grade: "", subject: "", documentType: "" });

  const fetchDocs = useCallback(async () => {
    const level = educationLevelMap[path];
    const queryFilters = {
      educationLevel: level,
      documentType: filters.documentType,
    };

    if (path === "university") {
      queryFilters.subject = filters.subject;
    } else {
      queryFilters.grade = filters.grade;
    }

    try {
      const docs = await fetchDocuments(queryFilters);
      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    }
  }, [path, filters]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]); // fetchDocs đã được bọc trong useCallback, không cần thêm path và filters

  useEffect(() => {
    setFilters({ grade: "", subject: "", documentType: "" });
  }, [path]);

  return (
    <div className="doclist-container">
      <h2>📚 Danh sách tài liệu - {path?.toUpperCase()}</h2>

      <div className="filters">
        {path === "university" ? (
          <select
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value, grade: "" })}
          >
            <option value="">-- Chọn môn học --</option>
            {universitySubjects.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={filters.grade}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value, subject: "" })}
          >
            <option value="">-- Chọn lớp --</option>
            {gradeMap[path]?.map((grade) => (
              <option key={grade} value={grade}>
                Lớp {grade}
              </option>
            ))}
          </select>
        )}

        <select
          value={filters.documentType}
          onChange={(e) => setFilters({ ...filters, documentType: e.target.value })}
        >
          <option value="">-- Loại tài liệu --</option>
          <option value="textbook">Giáo trình</option>
          <option value="exercise">Bài tập</option>
          <option value="reference">Tham khảo</option>
        </select>
      </div>

      <div className="doc-grid">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc._id} className="doc-card">
              <img src={doc.thumbnail || "/assets/images/default-doc.png"} alt="thumbnail" />
              <h4>{doc.title}</h4>
              <p>{doc.description?.slice(0, 80)}...</p>
              <Link to={`/documents/detail/${doc._id}`} className="view-link">
                Xem chi tiết →
              </Link>
            </div>
          ))
        ) : (
          <p>Không có tài liệu nào phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default DocumentList;