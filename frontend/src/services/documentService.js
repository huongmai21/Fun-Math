// src/services/documentService.js
import axios from "axios";

const API_URL = "http://localhost:3000";

export const fetchDocuments = async (filters) => {
  const query = new URLSearchParams();
  if (filters.educationLevel) query.append("educationLevel", filters.educationLevel);
  if (filters.grade) query.append("grade", filters.grade);
  if (filters.subject) query.append("subject", filters.subject);
  if (filters.documentType) query.append("documentType", filters.documentType);

  const response = await axios.get(`${API_URL}/documents?${query.toString()}`);
  return response.data.documents || [];
};

export const fetchDocumentById = async (id) => {
  const response = await axios.get(`${API_URL}/documents/${id}`);
  return response.data.document;
};

export const createDocument = async (documentData) => {
  const response = await axios.post(`${API_URL}/documents`, documentData, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchRelatedDocuments = async (educationLevel, subject, currentDocId) => {
  const query = new URLSearchParams();
  query.append("educationLevel", educationLevel);
  if (subject) query.append("subject", subject);

  const response = await axios.get(`${API_URL}/documents?${query.toString()}`);
  const filtered = response.data.documents.filter((doc) => doc._id !== currentDocId);
  return filtered.slice(0, 4);
};