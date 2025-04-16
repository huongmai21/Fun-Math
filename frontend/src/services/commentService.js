import axios from "axios";

const API_URL = "http://localhost:3000";

export const fetchComments = async (referenceId, referenceType) => {
  const response = await axios.get(`${API_URL}/comments/${referenceId}?type=${referenceType}`);
  return response.data.comments;
};

export const postComment = async (referenceId, referenceType, content) => {
  await axios.post(
    `${API_URL}/comments`,
    { referenceId, referenceType, content },
    { withCredentials: true }
  );
};

export const updateComment = async (id, content) => {
  await axios.put(
    `${API_URL}/comments/${id}`,
    { content },
    { withCredentials: true }
  );
};

export const deleteComment = async (id) => {
  await axios.delete(`${API_URL}/comments/${id}`, { withCredentials: true });
};