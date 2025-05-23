import api from "./api";
import { toast } from "react-toastify";

const itemsPerPage = 5;

export const fetchNews = async (page, searchQuery, category) => {
  try {
    const res = await api.get("/news", {
      params: { page, limit: itemsPerPage, search: searchQuery, category },
    });
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Không thể tải tin tức!");
    return { success: false, news: [], total: 0, totalPages: 0, currentPage: 1 };
  }
};

export const fetchNewsById = async (id) => {
  try {
    const res = await api.get(`/news/${id}`);
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Không thể tải chi tiết tin tức!");
    return { success: false, news: null };
  }
};

// Đăng tin tức (cho admin)
export const postNews = async (newsData) => {
  try {
    const res = await api.post("/news", newsData);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
      return;
    }
    if (err.response?.status === 403) {
      toast.error("Bạn không có quyền đăng tin tức!");
    } else if (err.response?.status === 400) {
      toast.error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại!");
    } else {
      toast.error(err.response?.data?.message || "Không thể đăng tin tức!");
    }
    throw err;
  }
};
