import api from "./api";
import { toast } from "react-toastify";

// Tạo đề thi
export const createExam = async (examData) => {
  try {
    const res = await api.post("/exams", examData);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
      return;
    }
    if (err.response?.status === 403) {
      toast.error("Bạn không có quyền tạo đề thi!");
    } else if (err.response?.status === 400) {
      toast.error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại!");
    } else {
      toast.error(err.response?.data?.message || "Không thể tạo đề thi!");
    }
    throw err;
  }
};