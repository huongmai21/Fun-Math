import api from "./api";
import { toast } from "react-toastify";

// Lấy danh sách khóa học của người dùng
export const fetchCourses = async (type, page, limit) => {
  try {
    const res = await api.get(`/courses/${type}`, {
      params: { page, limit },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
      return;
    }
    if (err.response?.status === 403) {
      toast.error("Bạn không có quyền truy cập danh sách khóa học!");
    } else if (err.response?.status === 400) {
      toast.error("Yêu cầu không hợp lệ, vui lòng kiểm tra lại!");
    } else {
      toast.error(err.response?.data?.message || "Không thể tải danh sách khóa học!");
    }
    throw err;
  }
};

// Lấy tất cả khóa học (cho admin)
export const fetchAllCourses = async (page, limit) => {
  try {
    const res = await api.get("/courses/all", {
      params: { page, limit },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
      return;
    }
    if (err.response?.status === 403) {
      toast.error("Bạn không có quyền truy cập danh sách khóa học!");
    } else if (err.response?.status === 400) {
      toast.error("Yêu cầu không hợp lệ, vui lòng kiểm tra lại!");
    } else {
      toast.error(err.response?.data?.message || "Không thể tải danh sách khóa học!");
    }
    throw err;
  }
};

// Xóa khóa học
export const deleteCourse = async (courseId) => {
  try {
    const res = await api.delete(`/courses/${courseId}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
      return;
    }
    if (err.response?.status === 403) {
      toast.error("Bạn không có quyền xóa khóa học này!");
    } else if (err.response?.status === 404) {
      toast.error("Khóa học không tồn tại!");
    } else {
      toast.error(err.response?.data?.message || "Không thể xóa khóa học!");
    }
    throw err;
  }
};