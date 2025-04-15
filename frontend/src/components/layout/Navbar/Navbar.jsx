// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../../features/auth/authSlice";
import { toast } from "react-toastify";
import "./Navbar.css";

const Navbar = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const documentsRef = useRef(null);
  const newsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (documentsRef.current && !documentsRef.current.contains(event.target)) {
        setIsDocumentsOpen(false);
      }
      if (newsRef.current && !newsRef.current.contains(event.target)) {
        setIsNewsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Đăng xuất thành công!", {
      position: "top-right",
      autoClose: 3000,
    });
    navigate("/auth/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <i className="fa-solid fa-bahai"></i> FunMath
        </Link>
        <button className="hamburger" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? "✖" : "☰"}
        </button>
        <nav className={`navbar ${isMobileMenuOpen ? "active" : ""}`}>
          <div
            className={`dropdown menu-item ${isDocumentsOpen ? "active" : ""}`}
            ref={documentsRef}
            onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
          >
            <span className="dropdown-title">Tài liệu</span>
            <span className="left-icon"></span>
            <span className="right-icon"></span>
            {isDocumentsOpen && (
              <div className="items">
                <Link to="/documents/grade1" style={{ "--i": 1 }}>
                  <span></span>Cấp 1
                </Link>
                <Link to="/documents/grade2" style={{ "--i": 2 }}>
                  <span></span>Cấp 2
                </Link>
                <Link to="/documents/grade3" style={{ "--i": 3 }}>
                  <span></span>Cấp 3
                </Link>
                <Link to="/documents/university" style={{ "--i": 4 }}>
                  <span></span>Đại học
                </Link>
              </div>
            )}
          </div>
          <div
            className={`dropdown menu-item ${isNewsOpen ? "active" : ""}`}
            ref={newsRef}
            onClick={() => setIsNewsOpen(!isNewsOpen)}
          >
            <span className="dropdown-title">Tin tức</span>
            <span className="left-icon"></span>
            <span className="right-icon"></span>
            {isNewsOpen && (
              <div className="items">
                <Link to="/news/education" style={{ "--i": 1 }}>
                  <span></span>Thông tin giáo dục
                </Link>
                <Link to="/news/magazine" style={{ "--i": 2 }}>
                  <span></span>Tạp chí Toán
                </Link>
              </div>
            )}
          </div>
          {user && (
            <>
              <Link to="/exams" className="menu-item">
                Thi đấu
              </Link>
              <Link to="/study-corner" className="menu-item">
                Góc học tập
              </Link>
            </>
          )}
        </nav>
      </div>
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : user ? (
        <div
          className="profile-container"
          ref={profileRef}
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <div className="profile-info">
            <img
              src={user.avatar || "/assets/images/default-avatar.png"}
              alt="Avatar"
              className="profile-avatar"
            />
            <span className="profile-username">{user.username}</span>
          </div>
          {isProfileOpen && (
            <div className="profile-dropdown">
              <Link to="/profile" className="dropdown-item">
                Hồ sơ
              </Link>
              <Link to="/settings" className="dropdown-item">
                Cài đặt
              </Link>
              {(user.role === "student" || user.role === "teacher") && (
                <Link to="/exam-history" className="dropdown-item">
                  Đề thi đã tham gia
                </Link>
              )}
              {user.role === "teacher" && (
                <Link to="/create-exam" className="dropdown-item">
                  Tạo đề thi
                </Link>
              )}
              {user.role === "admin" && (
                <>
                  <Link to="/create-exam" className="dropdown-item">
                    Tạo đề thi
                  </Link>
                  <Link to="/create-course" className="dropdown-item">
                    Tạo khóa học
                  </Link>
                  <Link to="/admin" className="dropdown-item">
                    Quản lý hệ thống
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="dropdown-item logout">
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="auth-links">
          <Link to="/auth/login" className="auth-link">
            Đăng nhập
          </Link>
          <Link to="/auth/register" className="auth-link">
            Đăng ký
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;