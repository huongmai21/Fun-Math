import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchDocumentById } from "../../services/documentService";
import CommentSection from "../../components/common/Comment/CommentSection";
import RelatedDocuments from "./RelatedDocuments";
import "./Document.css";

const DocumentDetail = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const doc = await fetchDocumentById(id);
        setDocument(doc);
      } catch (err) {
        setError("Không thể tải tài liệu. Vui lòng thử lại sau.");
      }
    };
    fetchDoc();
  }, [id]);

  if (error) return <div className="error">{error}</div>;
  if (!document) return <div>Đang tải tài liệu...</div>;

  return (
    <div className="document-detail container">
      <h2>{document.title}</h2>

      <div className="document-meta">
        <p><strong>Cấp học:</strong> {translateLevel(document.educationLevel)}</p>
        {document.educationLevel === "university" ? (
          <p><strong>Môn học:</strong> {translateSubject(document.subject)}</p>
        ) : (
          <p><strong>Lớp:</strong> Lớp {document.grade}</p>
        )}
        <p><strong>Loại tài liệu:</strong> {translateType(document.documentType)}</p>
        <p><strong>Tác giả:</strong> {document.author?.fullName || "Không rõ"}</p>
        <p><strong>Ngày tải lên:</strong> {new Date(document.uploadedAt).toLocaleDateString()}</p>
        <p><strong>Lượt tải:</strong> {document.downloads}</p>
      </div>

      {document.thumbnail && (
        <img src={document.thumbnail} alt="Ảnh minh họa" className="document-thumbnail" />
      )}

      <p className="document-description">{document.description}</p>

      <a
        href={document.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="download-button"
      >
        📥 Xem / Tải tài liệu
      </a>
      <CommentSection referenceId={id} referenceType="document" />
      <RelatedDocuments currentDoc={document} />

      <br />
      <Link to="/resources/grade1">← Quay lại danh sách tài liệu</Link>
    </div>
  );
};

const translateLevel = (level) => {
  switch (level) {
    case "primary": return "Cấp 1";
    case "secondary": return "Cấp 2";
    case "highschool": return "Cấp 3";
    case "university": return "Đại học";
    default: return "Không rõ";
  }
};

const translateType = (type) => {
  switch (type) {
    case "textbook": return "Giáo trình";
    case "exercise": return "Bài tập";
    case "reference": return "Tài liệu tham khảo";
    default: return "Khác";
  }
};

const translateSubject = (subject) => {
  const subjects = {
    advanced_math: "Toán cao cấp",
    calculus: "Giải tích",
    algebra: "Đại số",
    probability_statistics: "Xác suất thống kê",
    differential_equations: "Phương trình vi phân",
  };
  return subjects[subject] || "Không rõ";
};

export default DocumentDetail;