import api from "./api";
import { toast } from "react-toastify";

export const fetchPosts = async (page, limit) => {
  try {
    const res = await api.get("/posts", {
      params: { page, limit },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
    } else if (err.response?.status === 403) {
      toast.error("Bạn không có quyền truy cập danh sách bài đăng!");
    } else if (err.response?.status === 500) {
      toast.error("Lỗi server, vui lòng thử lại sau!");
    } else if (err.response?.status === 400) {
      toast.error("Yêu cầu không hợp lệ, vui lòng kiểm tra lại!");
    } else {
      toast.error(err.response?.data?.message || "Không thể tải danh sách bài đăng!");
    }
    throw err;
  }
};

export const deletePost = async (postId) => {
  try {
    const res = await api.delete(`/posts/${postId}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
    } else if (err.response?.status === 403) {
      toast.error("Bạn không có quyền xóa bài đăng này!");
    } else if (err.response?.status === 404) {
      toast.error("Bài đăng không tồn tại!");
    } else if (err.response?.status === 500) {
      toast.error("Lỗi server, vui lòng thử lại sau!");
    } else {
      toast.error(err.response?.data?.message || "Không thể xóa bài đăng!");
    }
    throw err;
  }
};

// Chỉnh sửa bài đăng
export const editPost = async (postId, data) => {
  try {
    const res = await api.put(`/posts/${postId}`, data);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
      return;
    }
    if (err.response?.status === 403) {
      toast.error("Bạn không có quyền chỉnh sửa bài đăng này!");
    } else if (err.response?.status === 404) {
      toast.error("Bài đăng không tồn tại!");
    } else if (err.response?.status === 400) {
      toast.error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại!");
    } else {
      toast.error(err.response?.data?.message || "Không thể chỉnh sửa bài đăng!");
    }
    throw err;
  }
};