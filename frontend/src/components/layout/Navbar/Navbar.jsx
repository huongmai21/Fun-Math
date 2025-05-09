import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/authSlice";
import { toast } from "react-toastify";
import { ThemeContext } from "../../../context/ThemeContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const documentsRef = useRef(null);
  const newsRef = useRef(null);
  const notificationsRef = useRef(null);

  const [notifications, setNotifications] = useState([
    { id: 1, message: "Bài đăng mới từ bạn bè!", time: "5 phút trước" },
    { id: 2, message: "Đề thi mới đã có!", time: "1 giờ trước" },
  ]);

  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        documentsRef.current &&
        !documentsRef.current.contains(event.target)
      ) {
        setIsDocumentsOpen(false);
      }
      if (newsRef.current && !newsRef.current.contains(event.target)) {
        setIsNewsOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
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

  const defaultAvatar =
    "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png";

  return (
    <header className="header">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
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
          <Link to="/courses" className="menu-item">
            Khóa học
          </Link>
          {user && (
            <>
              <Link to="/exams" className="menu-item">
                Thi đấu
              </Link>
              <Link to="/study-corner" className="menu-item">
                Góc học tập
              </Link>
              <Link to="/study-room" className="menu-item">
                Phòng học nhóm
              </Link>
            </>
          )}
        </nav>
      </div>
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : user ? (
        <div className="user-actions">
          <div
            className="user-info"
            ref={profileRef}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            onMouseEnter={() => setIsProfileOpen(true)}
            onMouseLeave={() => setIsProfileOpen(false)}
          >
            <div className="avatar">
              <img
                src={user.avatar || defaultAvatar}
                alt="Avatar"
                onError={(e) => (e.target.src = defaultAvatar)}
              />
            </div>
            <span className="profile-username">{user.username}</span>
            {isProfileOpen && (
              <div className="profile-dropdown">
                <Link to="/users/profile" className="dropdown-item">
                  Hồ sơ
                </Link>
                {(user?.role === "student" || user?.role === "teacher") && (
                  <Link to="/courses/my-courses" className="dropdown-item">
                    Khóa học của tôi
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link to="/admin" className="dropdown-item">
                    Quản lý hệ thống
                  </Link>
                )}
                <button onClick={handleLogout} className="dropdown-item logout">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
          <div
            className="notification-container"
            ref={notificationsRef}
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <i className="fa-solid fa-bell notification-icon"></i>
            {notifications.length > 0 && (
              <span className="notification-count">{notifications.length}</span>
            )}
            {isNotificationsOpen && (
              <div className="notification-dropdown">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="notification-item">
                      <span>{notif.message}</span>
                      <span className="notification-time">{notif.time}</span>
                      <button
                        className="delete-notification"
                        onClick={() => handleDeleteNotification(notif.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="notification-item">Không có thông báo</div>
                )}
              </div>
            )}
          </div>
          <div className="settings-container">
            <i
              className="fa-solid fa-gear settings-icon"
              onClick={() => setIsSettingsOpen(true)}
            ></i>
            {isSettingsOpen && (
              <div className="settings-modal">
                <div className="settings-content">
                  <h3>Cài đặt</h3>
                  <div className="settings-option">
                    <label>Thông báo</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="settings-option">
                    <label>Chế độ hiển thị</label>
                    <button className="theme-toggle" onClick={toggleTheme}>
                      <i
                        className={
                          theme === "light"
                            ? "fa-solid fa-sun"
                            : "fa-solid fa-moon"
                        }
                      ></i>
                      {theme === "light" ? "Sáng" : "Tối"}
                    </button>
                  </div>
                  <button
                    className="close-settings"
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
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
