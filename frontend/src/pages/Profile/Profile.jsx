import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { fetchUserProfile, updateUserProfile } from "../../services/userService";
import { fetchCourses } from "../../services/courseService";
import { fetchLibrary } from "../../services/libraryService";
import { fetchPosts, deletePost } from "../../services/postService";
import "./Profile.css";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [activityData, setActivityData] = useState({ activity: [], total: 0 });
  const [courses, setCourses] = useState([]);
  const [library, setLibrary] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const commonTabs = [
    { id: "overview", label: "Tổng quan", icon: "fa-house" },
    { id: "stats", label: "Thống kê", icon: "fa-chart-line" },
    { id: "library", label: "Thư viện", icon: "fa-book" },
    { id: "followers", label: "Người theo dõi", icon: "fa-users" },
    { id: "following", label: "Đang theo dõi", icon: "fa-user-plus" },
    { id: "posts", label: "Bài đăng", icon: "fa-newspaper" },
  ];

  const roleTabs = {
    student: [
      { id: "courses", label: "Khóa học của tôi", icon: "fa-graduation-cap" },
    ],
    teacher: [
      { id: "courses", label: "Khóa học của tôi", icon: "fa-graduation-cap" },
      { id: "create-exam", label: "Tạo đề thi", icon: "fa-pen" },
    ],
    admin: [
      { id: "create-exam", label: "Tạo đề thi", icon: "fa-pen" },
      { id: "upload-docs", label: "Tải tài liệu", icon: "fa-upload" },
      { id: "manage-courses", label: "Quản lý khóa học", icon: "fa-book-open" },
      { id: "post-news", label: "Đăng tin tức", icon: "fa-bullhorn" },
      { id: "system-stats", label: "Thống kê hệ thống", icon: "fa-chart-bar" },
      { id: "manage-users", label: "Quản lý người dùng", icon: "fa-user-cog" },
    ],
  };

  const sidebarTabs = user
    ? [...commonTabs, ...(roleTabs[user.role] || [])]
    : commonTabs;

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await fetchUserProfile();
        setUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email,
          bio: userData.bio || "",
          socialLink: userData.socialLink || "", // Thêm trường socialLink
        });

        const activityRes = await fetchUserProfile(selectedYear);
        setActivityData(activityRes.activity || { activity: [], total: 0 });

        try {
          const coursesData = await fetchCourses("enrolled", 1, 10);
          setCourses(coursesData.data || []);
        } catch (courseErr) {
          console.warn("Failed to load courses:", courseErr);
          setCourses([]);
          toast.warn("Không thể tải danh sách khóa học, bạn chưa đăng ký khóa nào hoặc có lỗi server!");
        }

        const libraryData = await fetchLibrary(1, 10);
        setLibrary(libraryData.data || []);

        const postsData = await fetchPosts(1, 10);
        setPosts(postsData.data || []);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(
          err.response?.status === 500
            ? "Lỗi server nghiêm trọng, không thể tải dữ liệu hồ sơ. Vui lòng thử lại sau!"
            : err.response?.data?.message || "Không thể tải dữ liệu hồ sơ!"
        );
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [selectedYear]);

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile(formData);
      setUser({ ...user, ...formData });
      setIsEditing(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      toast.error("Không thể cập nhật hồ sơ!");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter((post) => post._id !== postId));
      toast.success("Xóa bài viết thành công!");
    } catch (err) {
      toast.error("Không thể xóa bài viết!");
    }
  };

  const renderActivityGraph = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const days = ["", "Mon", "", "Wed", "", "Fri", ""];
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    const daysInYear = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.ceil(daysInYear / 7);
    const activityMap = {};

    // Nếu không có hoạt động, chỉ hiển thị màu xám
    const hasActivity = activityData.activity && Array.isArray(activityData.activity) && activityData.activity.length > 0;

    if (hasActivity) {
      activityData.activity.forEach(({ date, count, details }) => {
        activityMap[date] = { count, details };
      });
    }

    const squares = [];
    let currentDate = new Date(startDate);
    const monthPositions = [];

    for (let week = 0; week < weeks; week++) {
      const weekSquares = [];
      if (!(currentDate instanceof Date) || isNaN(currentDate.getTime())) {
        console.error("Invalid currentDate:", currentDate);
        break;
      }

      const currentMonth = currentDate.getMonth();
      if (
        week === 0 ||
        (currentDate.getDate() <= 7 &&
          currentMonth !==
            new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).getMonth())
      ) {
        monthPositions.push({ week, month: months[currentMonth] });
      }

      for (let day = 0; day < 7; day++) {
        if (currentDate.getFullYear() !== selectedYear) break;
        const dateStr = currentDate.toISOString().split("T")[0];
        const activity = hasActivity ? (activityMap[dateStr] || { count: 0, details: [] }) : { count: 0, details: [] };
        const count = activity.count || 0;
        let colorClass = "activity-square level-0"; // Mặc định là màu xám
        if (hasActivity) {
          if (count > 0 && count <= 2) colorClass = "activity-square level-1";
          else if (count > 2 && count <= 5) colorClass = "activity-square level-2";
          else if (count > 5) colorClass = "activity-square level-3";
        }

        weekSquares.push(
          <div
            key={dateStr}
            className={colorClass}
            data-tooltip-id={`tooltip-${dateStr}`}
            data-tooltip-content={
              count > 0
                ? `${dateStr}: ${count} hoạt động\n${(activity.details || [])
                    .map((d) => d.description)
                    .join("\n")}`
                : `${dateStr}: Không có hoạt động`
            }
          ></div>
        );

        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }
      squares.push(
        <div key={week} className="activity-week">
          {weekSquares}
        </div>
      );
    }

    return (
      <div className="activity-graph">
        <div className="activity-header">
          <h3>{activityData.total || 0} hoạt động trong năm {selectedYear}</h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
        <div className="activity-labels">
          {monthPositions.map((pos) => (
            <span
              key={pos.week}
              className="month-label"
              style={{ position: "absolute", left: `${pos.week * 14}px` }}
            >
              {pos.month}
            </span>
          ))}
        </div>
        <div className="activity-days">
          {days.map((day, index) => (
            <span key={index}>{day}</span>
          ))}
        </div>
        <div className="activity-grid">{squares}</div>
        <div className="activity-legend">
          <span>Ít</span>
          <div className="activity-square level-0"></div>
          {hasActivity && (
            <>
              <div className="activity-square level-1"></div>
              <div className="activity-square level-2"></div>
              <div className="activity-square level-3"></div>
            </>
          )}
          <span>Nhiều</span>
        </div>
        <Tooltip id="activity-tooltip" place="top" style={{ whiteSpace: "pre-line", zIndex: 1000 }} />
      </div>
    );
  };

  const renderRecentActivity = () => {
    if (!activityData.activity || !Array.isArray(activityData.activity)) {
      return <div>Không có hoạt động gần đây!</div>;
    }

    const recentActivities = activityData.activity
      .filter((activity) => activity.details && activity.details.length > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const getActivityIcon = (type) => {
      switch (type) {
        case "post":
          return "fa-newspaper";
        case "comment":
          return "fa-comment";
        case "follow":
          return "fa-users";
        case "exam":
          return "fa-pen";
        case "document":
          return "fa-book";
        case "course":
          return "fa-graduation-cap";
        default:
          return "fa-circle";
      }
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`;
    };

    return (
      <div className="recent-activity">
        <h3>Hoạt động gần đây</h3>
        {recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-date">
                {formatDate(activity.date)}
              </div>
              <div className="activity-details">
                {activity.details.map((detail, idx) => (
                  <div key={idx} className="activity-entry">
                    <i className={`fa-solid ${getActivityIcon(detail.type)} activity-icon`}></i>
                    <span>{detail.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>Không có hoạt động nào để hiển thị.</p>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="profile-overview">
            <div className="user-info">
              <div className="avatar-section">
                {/* <i class="fa-regular fa-face-smile"></i> */}
                <img
                  src={user?.avatar || "/default-avatar.png"}
                  alt="Avatar"
                  className="user-avatar"
                />
                
                <div className="follow-stats">
                <i class="fa-solid fa-user-tag"></i>
                  <span
                    className="follow-link"
                    onClick={() => setActiveTab("followers")}
                  >
                    {user?.followers?.length || 0} người theo dõi
                  </span>
                  <span
                    className="follow-link"
                    onClick={() => setActiveTab("following")}
                  >
                    {user?.following?.length || 0} đang theo dõi
                  </span>
                </div>
              </div>
              <div className="user-details">
                {isEditing ? (
                  <div>
                    <div className="form-group">
                      <label>Tên người dùng</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Tiểu sử</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Link social</label>
                      <input
                        type="text"
                        value={formData.socialLink}
                        onChange={(e) =>
                          setFormData({ ...formData, socialLink: e.target.value })
                        }
                        placeholder="Nhập link mạng xã hội"
                      />
                    </div>
                    <button type="submit" onClick={handleUpdateProfile}>
                      Lưu
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)}>
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div>
                    <h2>{user?.username}</h2>
                    <p>{user?.email}</p>
                    <p>{user?.bio || "Chưa có tiểu sử."}</p>
                    {user?.socialLink && (
                      <p>
                        <a href={user.socialLink} target="_blank" rel="noopener noreferrer">
                          Link social
                        </a>
                      </p>
                    )}
                    <p>
                      Trạng thái: <span className="status active">Hoạt động</span>
                    </p>
                    <button
                      className="action-btn edit"
                      onClick={() => setIsEditing(true)}
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                )}
              </div>
            </div>
            {renderActivityGraph()}
            {renderRecentActivity()}
          </div>
        );
      case "stats":
        return <div>Thống kê (Chưa triển khai)</div>;
      case "library":
        return (
          <ul>
            {library.map((doc) => (
              <li key={doc._id}>{doc.title}</li>
            ))}
          </ul>
        );
      case "followers":
        return <div>Danh sách người theo dõi (Chưa triển khai)</div>;
      case "following":
        return <div>Danh sách đang theo dõi (Chưa triển khai)</div>;
      case "posts":
        return (
          <ul>
            {posts.map((post) => (
              <li key={post._id}>
                {post.title}
                <button
                  className="action-btn delete"
                  onClick={() => handleDeletePost(post._id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        );
      case "news":
        return <div>Đăng tin tức (Chưa triển khai)</div>;
      case "exams":
        return <div>Tạo đề thi (Chưa triển khai)</div>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="profile-page">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="sidebar">
          <ul>
            {sidebarTabs.map((tab) => (
              <li
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
                data-tooltip-id={`sidebar-tooltip-${tab.id}`}
                data-tooltip-content={tab.label}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
              </li>
            ))}
          </ul>
        </div>
        <div className="main-content">{renderContent()}</div>
      </div>
      {sidebarTabs.map((tab) => (
        <Tooltip
          key={tab.id}
          id={`sidebar-tooltip-${tab.id}`}
          place="right"
          style={{ zIndex: 1000 }}
        />
      ))}
    </div>
  );
};

export default Profile;