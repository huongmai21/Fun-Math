// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { refreshUser, logout } from "./redux/authSlice.js"; // Import logout
import { store } from "./redux/store.js";

import Navbar from "./components/layout/Navbar/Navbar.jsx";
import HomePage from "./pages/Home/Home.jsx";
// import StudyCorner from "./pages/StudyCorner";
import StudyRoom from "./pages/StudyRoom/StudyRoom.jsx";
import AuthForm from "./pages/Auth/AuthForm.jsx";
import ExamList from "./pages/Exams/ExamList.jsx";
import CreateExam from "./pages/Exams/CreateExam.jsx";
import TakeExam from "./pages/Exams/TakeExam.jsx";
import DocumentList from "./pages/Document/DocumentList.jsx";
import DocumentDetail from "./pages/Document/DocumentDetail.jsx";
import CreateDocument from "./pages/Document/CreateDocument.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import NewsEducation from "./pages/News/NewsEducation.jsx";
import NewsMagazine from "./pages/News/NewsMagazine.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (token && user) {
        try {
          await dispatch(refreshUser()).unwrap();
        } catch (err) {
          dispatch(logout()); // Sử dụng logout đã import
        }
      }
    };

    if (!loading && user) {
      validateToken();
    }
  }, [user, loading, dispatch, navigate]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/exams" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch]);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <ErrorBoundary>
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthForm />}>
            <Route path="login" element={<AuthForm isLogin={true} />} />
            <Route path="register" element={<AuthForm isLogin={false} />} />
          </Route>
          <Route path="/documents/" element={<DocumentList />} />
          <Route path="/documents/detail/:id" element={<DocumentDetail />} />
          <Route
            path="/documents/create"
            element={
              <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                <CreateDocument />
              </ProtectedRoute>
            }
          />
          <Route path="/news/education" element={<NewsEducation />} />
          <Route path="/news/magazine" element={<NewsMagazine />} />
          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <ExamList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-exam"
            element={
              <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                <CreateExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/:id"
            element={
              <ProtectedRoute>
                <TakeExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-room"
            element={
              <ProtectedRoute>
                <StudyRoom />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}