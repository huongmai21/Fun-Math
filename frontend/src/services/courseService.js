import api from "./api";
import { toast } from "react-toastify";

export const fetchCourses = async (type, page, limit) => {
  try {
    const res = await api.get(`/courses/${type}`, {
      params: { page, limit },
    });
    return res.data;
  } catch (err) {
    console.error(`Error fetching courses (type: ${type}, page: ${page}, limit: ${limit}):`, {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
    } else if (err.response?.status === 403) {
      toast.error("Bạn không có quyền truy cập danh sách khóa học!");
    } else if (err.response?.status === 500) {
      toast.error("Lỗi server khi tải danh sách khóa học, vui lòng thử lại sau!");
    } else if (err.response?.status === 400) {
      toast.error("Yêu cầu không hợp lệ, vui lòng kiểm tra lại!");
    } else {
      toast.error(err.response?.data?.message || "Không thể tải danh sách khóa học!");
    }
    throw err;
  }
};