import api from './api';

export const getPosts = async ({ category, category_ne, page = 1, limit = 5 }) => {
  const response = await api.get('/posts', { params: { category, category_ne, page, limit } });
  return response.data;
};

export const createPost = async (postData) => {
  const response = await api.post('/posts', postData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await api.post(`/posts/like/${postId}`);
  return response.data;
};

export const sharePost = async (postId) => {
  const response = await api.post(`/posts/share/${postId}`);
  return response.data;
};

export const addComment = async (postId, content) => {
  const response = await api.post(`/posts/comment/${postId}`, { content });
  return response.data;
};