// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { refreshUser, logout } from "./features/auth/authSlice"; // Import logout
import { store } from "./store";

import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/Home";
import StudyCorner from "./pages/StudyCorner";
import StudyRoom from "./pages/StudyRoom";
import AuthForm from "./components/AuthForm/AuthForm";
import ExamList from "./components/Exam/ExamList";
import CreateExam from "./components/Exam/CreateExam";
import TakeExam from "./components/Exam/TakeExam";
import ResourceList from "./components/Resource/ResourceList";
import ResourceDetail from "./components/Resource/ResourceDetail";
import CreateResource from "./components/Resource/CreateResource";
import ErrorBoundary from "./components/ErrorBoundary";
import NewsEducation from "./pages/NewsEducation";
import NewsMagazine from "./pages/NewsMagazine";

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
          <Route path="/resources/:grade" element={<ResourceList />} />
          <Route path="/resources/detail/:id" element={<ResourceDetail />} />
          <Route
            path="/resources/create"
            element={
              <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                <CreateResource />
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
            path="/study-corner"
            element={
              <ProtectedRoute>
                <StudyCorner />
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