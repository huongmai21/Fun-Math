import api from './api';

export const getCourses = async ({ page = 1, limit = 5 }) => {
  const response = await api.get('/courses', { params: { page, limit } });
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

export const enrollCourse = async (courseId) => {
  const response = await api.post(`/courses/enroll/${courseId}`);
  return response.data;
};