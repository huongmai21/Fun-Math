import api from './api';

// Các hàm hiện có (giữ nguyên)
export const fetchUserProfile = async (year) => {
  const response = await api.get(`/users/profile${year ? `?year=${year}` : ''}`);
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

export const followUser = async (userId) => {
  const response = await api.post(`/users/follow/${userId}`);
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await api.post(`/users/unfollow/${userId}`);
  return response.data;
};

export const fetchFollowers = async () => {
  const response = await api.get('/users/followers');
  return response.data;
};

export const fetchFollowing = async () => {
  const response = await api.get('/users/following');
  return response.data;
};

export const getUserSuggestions = async () => {
  const response = await api.get('/users/suggestions');
  return response.data;
};

// Các hàm mới (thêm vào để hỗ trợ trang Profile)
export const getProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải dữ liệu người dùng!");
  }
};

export const getContributions = async (year) => {
  try {
    const response = await api.get(`/users/contributions?year=${year}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải dữ liệu hoạt động!");
  }
};

export const getContributionActivity = async () => {
  try {
    const response = await api.get('/users/contribution-activity');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải dữ liệu hoạt động chi tiết!");
  }
};

export const getScores = async () => {
  try {
    const response = await api.get('/users/scores');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải dữ liệu điểm số!");
  }
};

export const getLibrary = async () => {
  try {
    const response = await api.get('/users/library');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải dữ liệu thư viện!");
  }
};

export const getPosts = async () => {
  try {
    const response = await api.get('/users/posts');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải dữ liệu bài đăng!");
  }
};

export const getCourses = async () => {
  try {
    const response = await api.get('/users/courses');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải dữ liệu khóa học!");
  }
};