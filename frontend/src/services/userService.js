import api from "./api";
import { toast } from "react-toastify";

export const fetchUserProfile = async (year) => {
  try {
    const endpoint = year ? `/users/activity/${year}` : "/users/profile";
    const res = await api.get(endpoint);
    if (year && (!res.data.activity || !Array.isArray(res.data.activity))) {
      return { activity: [], total: 0 };
    }
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
    } else {
      toast.error(err.response?.data?.message || "Không thể tải dữ liệu hồ sơ!");
    }
    throw err;
  }
};

export const updateUserProfile = async (data) => {
  try {
    const res = await api.put("/users/profile", data);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
    } else {
      toast.error(err.response?.data?.message || "Không thể cập nhật hồ sơ!");
    }
    throw err;
  }
};

// Lấy danh sách followers
export const fetchFollowers = async (page, limit) => {
  try {
    const res = await api.get("/users/followers", {
      params: { page, limit },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => window.location.href = "/auth/login", 2000);
      return;
    }
    toast.error(err.response?.data?.message || "Không thể tải danh sách followers!");
    throw err;
  }
};

// Lấy danh sách following
export const fetchFollowing = async (page, limit) => {
  try {
    const res = await api.get("/users/friends", {
      params: { page, limit },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => window.location.href = "/auth/login", 2000);
      return;
    }
    toast.error(err.response?.data?.message || "Không thể tải danh sách following!");
    throw err;
  }
};

// Theo dõi người dùng
export const followUser = async (targetUserId) => {
  try {
    const res = await api.post(`/users/follow/${targetUserId}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => window.location.href = "/auth/login", 2000);
      return;
    }
    toast.error(err.response?.data?.message || "Không thể theo dõi người dùng!");
    throw err;
  }
};

// Bỏ theo dõi người dùng
export const unfollowUser = async (targetUserId) => {
  try {
    const res = await api.post(`/users/unfollow/${targetUserId}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => window.location.href = "/auth/login", 2000);
      return;
    }
    toast.error(err.response?.data?.message || "Không thể bỏ theo dõi người dùng!");
    throw err;
  }
};

// Lấy thống kê cho student
export const fetchStudentStats = async () => {
  try {
    const res = await api.get("/stats/student");
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => window.location.href = "/auth/login", 2000);
      return;
    }
    toast.error(err.response?.data?.message || "Không thể tải thống kê!");
    throw err;
  }
};

// Lấy thống kê cho teacher
export const fetchTeacherStats = async () => {
  try {
    const res = await api.get("/stats/teacher");
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => window.location.href = "/auth/login", 2000);
      return;
    }
    toast.error(err.response?.data?.message || "Không thể tải thống kê!");
    throw err;
  }
};

// Lấy thống kê cho admin
export const fetchSystemStats = async () => {
  try {
    const res = await api.get("/stats/system");
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => window.location.href = "/auth/login", 2000);
      return;
    }
    toast.error(err.response?.data?.message || "Không thể tải thống kê hệ thống!");
    throw err;
  }
};

// Lấy danh sách tất cả người dùng (cho admin)
export const fetchAllUsers = async (page, limit) => {
  try {
    const res = await api.get("/users/all", {
      params: { page, limit },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => window.location.href = "/auth/login", 2000);
      return;
    }
    toast.error(err.response?.data?.message || "Không thể tải danh sách người dùng!");
    throw err;
  }
};

// Xóa người dùng (cho admin)
export const deleteUser = async (userId) => {
  try {
    const res = await api.delete(`/users/${userId}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => window.location.href = "/auth/login", 2000);
      return;
    }
    toast.error(err.response?.data?.message || "Không thể xóa người dùng!");
    throw err;
  }
};


// Cập nhật ảnh avatar
export const updateAvatar = async (formData) => {
  try {
    const res = await api.post("/users/avatar", formData);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => window.location.href = "/auth/login", 2000);
      return;
    }
    toast.error(err.response?.data?.message || "Không thể cập nhật ảnh avatar!");
    throw err;
  }
};

// Lấy dữ liệu hoạt động của người dùng
export const fetchUserActivity = async (year) => {
  try {
    const res = await api.get(`/users/activity/${year}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => window.location.href = "/auth/login", 2000);
      return;
    }
    toast.error(err.response?.data?.message || "Không thể tải dữ liệu hoạt động!");
    throw err;
  }
};