import api from "./api";

export const getUsers = () => api.get("/admin/users");
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

export const getExams = () => api.get("/admin/exams");
export const approveExam = (examId) =>
  api.put(`/admin/exams/${examId}/approve`);
export const rejectExam = (examId) => api.put(`/admin/exams/${examId}/reject`);
export const deleteExam = (examId) => api.delete(`/admin/exams/${examId}`);

export const getStats = () => api.get("/admin/stats");

export const getLibraryItems = () => api.get("/admin/library");
export const deleteLibraryItem = (itemId) =>
  api.delete(`/admin/library/${itemId}`);
