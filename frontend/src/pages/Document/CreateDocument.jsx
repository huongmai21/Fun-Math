import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDocument } from "../../services/documentService";
import "./Document.css";

const gradeMap = {
  primary: ["1", "2", "3", "4", "5"],
  secondary: ["6", "7", "8", "9"],
  highschool: ["10", "11", "12"],
};

const universitySubjects = [
  { value: "advanced_math", label: "Toán cao cấp" },
  { value: "calculus", label: "Giải tích" },
  { value: "algebra", label: "Đại số" },
  { value: "probability_statistics", label: "Xác suất thống kê" },
  { value: "differential_equations", label: "Phương trình vi phân" },
];

const CreateDocument = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    thumbnail: "",
    educationLevel: "primary",
    grade: "",
    subject: "",
    documentType: "textbook",
    tags: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      if (name === "educationLevel") {
        updatedForm.grade = "";
        updatedForm.subject = "";
      }
      return updatedForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagArray = form.tags.split(",").map((tag) => tag.trim());
      const payload = {
        ...form,
        tags: tagArray,
        grade: form.educationLevel !== "university" ? form.grade : undefined,
        subject: form.educationLevel === "university" ? form.subject : "math",
      };
      await createDocument(payload);
      alert("Tạo tài liệu thành công!");
      navigate("/resources/grade1");
    } catch (error) {
      console.error(error);
      alert("Tạo thất bại!");
    }
  };

  return (
    <div className="create-doc container">
      <h2>Tạo Tài Liệu Mới</h2>
      <form onSubmit={handleSubmit} className="doc-form">
        <input
          type="text"
          name="title"
          placeholder="Tiêu đề"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Mô tả"
          value={form.description}
          onChange={handleChange}
        />

        <input
          type="text"
          name="fileUrl"
          placeholder="Link tài liệu (fileUrl)"
          value={form.fileUrl}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="thumbnail"
          placeholder="Link ảnh thumbnail"
          value={form.thumbnail}
          onChange={handleChange}
        />

        <select
          name="educationLevel"
          value={form.educationLevel}
          onChange={handleChange}
        >
          <option value="primary">Cấp 1</option>
          <option value="secondary">Cấp 2</option>
          <option value="highschool">Cấp 3</option>
          <option value="university">Đại học</option>
        </select>

        {form.educationLevel === "university" ? (
          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn môn học --</option>
            {universitySubjects.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        ) : (
          <select name="grade" value={form.grade} onChange={handleChange} required>
            <option value="">-- Chọn lớp --</option>
            {gradeMap[form.educationLevel]?.map((grade) => (
              <option key={grade} value={grade}>
                Lớp {grade}
              </option>
            ))}
          </select>
        )}

        <select
          name="documentType"
          value={form.documentType}
          onChange={handleChange}
        >
          <option value="textbook">Giáo trình</option>
          <option value="exercise">Bài tập</option>
          <option value="reference">Tham khảo</option>
          <option value="other">Khác</option>
        </select>

        <input
          type="text"
          name="tags"
          placeholder="Tags (cách nhau bởi dấu phẩy)"
          value={form.tags}
          onChange={handleChange}
        />

        <button type="submit">Tạo tài liệu</button>
      </form>
    </div>
  );
};

export default CreateDocument;