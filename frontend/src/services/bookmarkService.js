import api from "./api";
import { toast } from "react-toastify";

export const getBookmarks = async () => {
  try {
    const res = await api.get("/bookmarks");
    return res.data;
  } catch (err) {
    toast.error("Không thể tải bài đã lưu!");
    throw err;
  }
};

export const createBookmark = async (postId) => {
  try {
    const res = await api.post(`/bookmarks/${postId}`);
    return res.data;
  } catch (err) {
    toast.error("Không thể lưu bài!");
    throw err;
  }
};