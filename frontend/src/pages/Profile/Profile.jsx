import React, { useState, useEffect} from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để chuyển hướng
// import { ThemeContext } from "../../context/ThemeContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import CommentSection from "../../components/common/Comment/CommentSection";
import "./Profile.css";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate(); // Hook để chuyển hướng
  // const { /* theme */ } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData, setProfileData] = useState(null);
  const [followers, setFollowers] = useState({ data: [], total: 0, page: 1 });
  const [following, setFollowing] = useState({ data: [], total: 0, page: 1 });
  const [posts, setPosts] = useState({ data: [], total: 0, page: 1 });
  const [courses, setCourses] = useState({ data: [], total: 0, page: 1 });
  const [library, setLibrary] = useState({ data: [], total: 0, page: 1 });
  const [stats, setStats] = useState(null);
  const [allCourses, setAllCourses] = useState({ data: [], total: 0, page: 1 });
  const [allUsers, setAllUsers] = useState({ data: [], total: 0, page: 1 });
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const itemsPerPage = 10;

  const commonTabs = [
    { id: "overview", label: "Tổng quan", icon: "fa-house" },
    { id: "stats", label: "Thống kê", icon: "fa-chart-line" },
    { id: "library", label: "Thư viện", icon: "fa-book" },
    { id: "followers", label: "Người theo dõi", icon: "fa-users" },
    { id: "following", label: "Đang theo dõi", icon: "fa-users" },
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

  // Kiểm tra user trước khi truy cập role
  const sidebarTabs = user
    ? [...commonTabs, ...(roleTabs[user.role] || [])]
    : commonTabs; // Nếu user là null, chỉ hiển thị commonTabs

  // Chuyển hướng nếu user chưa đăng nhập
  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để xem hồ sơ!");
      navigate("/auth/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Thoát nếu user là null

      try {
        setLoading(true);

        const profileRes = await api.get("/users/profile");
        setProfileData(profileRes.data);

        if (user.role === "student") {
          const statsRes = await api.get("/stats/student");
          setStats(statsRes.data);
        } else if (user.role === "teacher") {
          const statsRes = await api.get("/stats/teacher");
          setStats(statsRes.data);
        } else if (user.role === "admin") {
          const statsRes = await api.get("/stats/system");
          setStats(statsRes.data);
        }

        await fetchFollowers(1);
        await fetchFollowing(1);
        await fetchPosts(1);
        await fetchLibrary(1);
        if (user.role === "student") {
          await fetchCourses(1, "enrolled");
        } else if (user.role === "teacher") {
          await fetchCourses(1, "created");
        }
        if (user.role === "admin") {
          await fetchAllCourses(1);
          await fetchAllUsers(1);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Thêm user vào dependency array

  const fetchFollowers = async (page) => {
    try {
      const res = await api.get("/users/followers", {
        params: { page, limit: itemsPerPage },
      });
      setFollowers({ data: res.data.data, total: res.data.total, page });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchFollowing = async (page) => {
    try {
      const res = await api.get("/users/friends", {
        params: { page, limit: itemsPerPage },
      });
      setFollowing({ data: res.data.data, total: res.data.total, page });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchPosts = async (page) => {
    try {
      const res = await api.get("/posts", {
        params: { page, limit: itemsPerPage },
      });
      setPosts({ data: res.data.data, total: res.data.total, page });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchLibrary = async (page) => {
    try {
      const res = await api.get("/library", {
        params: { page, limit: itemsPerPage },
      });
      setLibrary({ data: res.data.data, total: res.data.total, page });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchCourses = async (page, type) => {
    try {
      const res = await api.get(`/courses/${type}`, {
        params: { page, limit: itemsPerPage },
      });
      setCourses({ data: res.data.data, total: res.data.total, page });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchAllCourses = async (page) => {
    try {
      const res = await api.get("/courses/all", {
        params: { page, limit: itemsPerPage },
      });
      setAllCourses({ data: res.data.data, total: res.data.total, page });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchAllUsers = async (page) => {
    try {
      const res = await api.get("/users/all", {
        params: { page, limit: itemsPerPage },
      });
      setAllUsers({ data: res.data.data, total: res.data.total, page });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleFollow = async (targetUserId) => {
    try {
      await api.post(`/users/follow/${targetUserId}`);
      toast.success("Theo dõi thành công!");
      const profileRes = await api.get("/users/profile");
      setProfileData(profileRes.data);
      await fetchFollowing(following.page);
      await fetchFollowers(followers.page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      await api.post(`/users/unfollow/${targetUserId}`);
      toast.success("Bỏ theo dõi thành công!");
      const profileRes = await api.get("/users/profile");
      setProfileData(profileRes.data);
      await fetchFollowing(following.page);
      await fetchFollowers(followers.page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreateExam = async (examData) => {
    try {
      await api.post("/exams", examData);
      toast.success("Tạo đề thi thành công!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUploadDoc = async (docData) => {
    try {
      await api.post("/library", docData);
      toast.success("Tải tài liệu thành công!");
      await fetchLibrary(1);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePostNews = async (newsData) => {
    try {
      await api.post("/news", newsData);
      toast.success("Đăng tin tức thành công!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (type, id, fetchFunction, page) => {
    try {
      await api.delete(`/${type}/${id}`);
      toast.success("Xóa thành công!");
      await fetchFunction(page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = async (type, id, data, fetchFunction, page) => {
    try {
      await api.put(`/${type}/${id}`, data);
      toast.success("Chỉnh sửa thành công!");
      setEditingItem(null);
      await fetchFunction(page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="tab-content">Đang tải...</div>;

    switch (activeTab) {
      case "overview":
        return (
          <div className="profile-overview">
            <div className="user-info">
              <img
                src={profileData?.avatar || "/assets/images/default-avatar.png"}
                alt="Avatar"
                className="user-avatar"
              />
              <div className="user-details">
                <h2>{profileData?.username || "Người dùng"}</h2>
                <p>{profileData?.email}</p>
                <p>
                  <strong>Người theo dõi:</strong> {profileData?.followers || 0}
                </p>
                <p>
                  <strong>Đang theo dõi:</strong> {profileData?.following || 0}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <span className={`status ${profileData?.isActive ? "active" : "inactive"}`}>
                    {profileData?.isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        );
      case "stats":
        return (
          <div className="tab-content">
            {user.role === "student" && stats && (
              <div>
                <h3>Thống kê học tập</h3>
                <p>Khóa học đã hoàn thành: {stats.completedCourses}</p>
                <p>Điểm trung bình: {stats.averageScore}</p>
                <p>Tổng số bài đăng: {stats.totalPosts}</p>
              </div>
            )}
            {user.role === "teacher" && stats && (
              <div>
                <h3>Thống kê giảng dạy</h3>
                <p>Tổng số khóa học: {stats.totalCourses}</p>
                <p>Tổng số học sinh: {stats.totalStudents}</p>
                <p>Tỷ lệ hoàn thành trung bình: {stats.averageCompletion}%</p>
              </div>
            )}
            {user.role === "admin" && stats && (
              <div>
                <h3>Thống kê hệ thống</h3>
                <p>Tổng số người dùng: {stats.totalUsers}</p>
                <p>Tổng số khóa học: {stats.totalCourses}</p>
                <p>Tổng số đề thi: {stats.totalExams}</p>
              </div>
            )}
          </div>
        );
      case "library":
        return (
          <div className="tab-content">
            <h3>Thư viện tài liệu</h3>
            {library.data.length > 0 ? (
              <>
                <ul>
                  {library.data.map((doc) => (
                    <li key={doc.id}>
                      {editingItem?.type === "library" && editingItem?.id === doc.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const title = e.target.title.value;
                            handleEdit("library", doc.id, { title }, fetchLibrary, library.page);
                          }}
                        >
                          <input
                            type="text"
                            name="title"
                            defaultValue={doc.title}
                            required
                          />
                          <button type="submit">Lưu</button>
                          <button type="button" onClick={() => setEditingItem(null)}>
                            Hủy
                          </button>
                        </form>
                      ) : (
                        <>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            {doc.title}
                          </a>{" "}
                          - {new Date(doc.createdAt).toLocaleDateString()}
                          <button
                            className="action-btn edit"
                            onClick={() => setEditingItem({ type: "library", id: doc.id })}
                          >
                            Sửa
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete("library", doc.id, fetchLibrary, library.page)}
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Tiếp >"
                  onPageChange={(event) => fetchLibrary(event.selected + 1)}
                  pageRangeDisplayed={5}
                  pageCount={Math.ceil(library.total / itemsPerPage)}
                  previousLabel="< Trước"
                  renderOnZeroPageCount={null}
                  containerClassName="pagination"
                  activeClassName="active"
                />
              </>
            ) : (
              <p>Chưa có tài liệu nào.</p>
            )}
          </div>
        );
      case "followers":
        return (
          <div className="tab-content">
            <h3>Danh sách người theo dõi</h3>
            {followers.data.length > 0 ? (
              <>
                <ul>
                  {followers.data.map((follower) => (
                    <li key={follower._id}>
                      <img
                        src={follower.avatar || "/assets/images/default-avatar.png"}
                        alt="Avatar"
                        className="friend-avatar"
                      />
                      {follower.username}
                      {following.data.some((f) => f._id === follower._id) ? (
                        <button
                          className="action-btn unfollow"
                          onClick={() => handleUnfollow(follower._id)}
                        >
                          Bỏ theo dõi
                        </button>
                      ) : (
                        <button
                          className="action-btn follow"
                          onClick={() => handleFollow(follower._id)}
                        >
                          Theo dõi
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Tiếp >"
                  onPageChange={(event) => fetchFollowers(event.selected + 1)}
                  pageRangeDisplayed={5}
                  pageCount={Math.ceil(followers.total / itemsPerPage)}
                  previousLabel="< Trước"
                  renderOnZeroPageCount={null}
                  containerClassName="pagination"
                  activeClassName="active"
                />
              </>
            ) : (
              <p>Chưa có người theo dõi nào.</p>
            )}
          </div>
        );
      case "following":
        return (
          <div className="tab-content">
            <h3>Danh sách đang theo dõi</h3>
            {following.data.length > 0 ? (
              <>
                <ul>
                  {following.data.map((follow) => (
                    <li key={follow._id}>
                      <img
                        src={follow.avatar || "/assets/images/default-avatar.png"}
                        alt="Avatar"
                        className="friend-avatar"
                      />
                      {follow.username}
                      <button
                        className="action-btn unfollow"
                        onClick={() => handleUnfollow(follow._id)}
                      >
                        Bỏ theo dõi
                      </button>
                    </li>
                  ))}
                </ul>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Tiếp >"
                  onPageChange={(event) => fetchFollowing(event.selected + 1)}
                  pageRangeDisplayed={5}
                  pageCount={Math.ceil(following.total / itemsPerPage)}
                  previousLabel="< Trước"
                  renderOnZeroPageCount={null}
                  containerClassName="pagination"
                  activeClassName="active"
                />
              </>
            ) : (
              <p>Chưa theo dõi ai.</p>
            )}
          </div>
        );
      case "posts":
        return (
          <div className="tab-content">
            <h3>Bài đăng trên góc học tập</h3>
            {posts.data.length > 0 ? (
              <>
                <ul>
                  {posts.data.map((post) => (
                    <li key={post.id}>
                      {editingItem?.type === "posts" && editingItem?.id === post.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const title = e.target.title.value;
                            const content = e.target.content.value;
                            handleEdit("posts", post.id, { title, content }, fetchPosts, posts.page);
                          }}
                        >
                          <input
                            type="text"
                            name="title"
                            defaultValue={post.title}
                            required
                          />
                          <textarea
                            name="content"
                            defaultValue={post.content}
                            rows="3"
                            required
                          ></textarea>
                          <button type="submit">Lưu</button>
                          <button type="button" onClick={() => setEditingItem(null)}>
                            Hủy
                          </button>
                        </form>
                      ) : (
                        <>
                          <h4>{post.title}</h4>
                          <p>{post.content}</p>
                          <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                          <button
                            className="action-btn edit"
                            onClick={() => setEditingItem({ type: "posts", id: post.id })}
                          >
                            Sửa
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete("posts", post.id, fetchPosts, posts.page)}
                          >
                            Xóa
                          </button>
                          <CommentSection referenceId={post.id} referenceType="post" />
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Tiếp >"
                  onPageChange={(event) => fetchPosts(event.selected + 1)}
                  pageRangeDisplayed={5}
                  pageCount={Math.ceil(posts.total / itemsPerPage)}
                  previousLabel="< Trước"
                  renderOnZeroPageCount={null}
                  containerClassName="pagination"
                  activeClassName="active"
                />
              </>
            ) : (
              <p>Chưa có bài đăng nào.</p>
            )}
          </div>
        );
      case "courses":
        return (
          <div className="tab-content">
            <h3>{user.role === "student" ? "Khóa học đã tham gia" : "Khóa học đã tạo"}</h3>
            {courses.data.length > 0 ? (
              <>
                <ul>
                  {courses.data.map((course) => (
                    <li key={course.id}>
                      <h4>{course.title}</h4>
                      <p>{course.description}</p>
                      {user.role === "student" && (
                        <p>Tiến độ: {course.progress}%</p>
                      )}
                      {user.role === "teacher" && (
                        <p>Trạng thái: {course.status}</p>
                      )}
                    </li>
                  ))}
                </ul>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Tiếp >"
                  onPageChange={(event) =>
                    fetchCourses(event.selected + 1, user.role === "student" ? "enrolled" : "created")
                  }
                  pageRangeDisplayed={5}
                  pageCount={Math.ceil(courses.total / itemsPerPage)}
                  previousLabel="< Trước"
                  renderOnZeroPageCount={null}
                  containerClassName="pagination"
                  activeClassName="active"
                />
              </>
            ) : (
              <p>Chưa có khóa học nào.</p>
            )}
          </div>
        );
      case "create-exam":
        return (
          <div className="tab-content">
            <h3>Tạo đề thi mới</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const title = e.target.title.value;
                const questions = e.target.questions.value.split("\n");
                handleCreateExam({ title, questions });
              }}
            >
              <div className="form-group">
                <label>Tiêu đề đề thi:</label>
                <input type="text" name="title" required />
              </div>
              <div className="form-group">
                <label>Câu hỏi (mỗi câu một dòng):</label>
                <textarea name="questions" rows="5" required></textarea>
              </div>
              <button type="submit">Tạo đề thi</button>
            </form>
          </div>
        );
      case "upload-docs":
        return (
          <div className="tab-content">
            <h3>Tải lên tài liệu</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const title = e.target.title.value;
                const file = e.target.file.files[0];
                const formData = new FormData();
                formData.append("title", title);
                formData.append("file", file);
                handleUploadDoc(formData);
              }}
            >
              <div className="form-group">
                <label>Tiêu đề tài liệu:</label>
                <input type="text" name="title" required />
              </div>
              <div className="form-group">
                <label>Chọn file:</label>
                <input type="file" name="file" required />
              </div>
              <button type="submit">Tải lên</button>
            </form>
          </div>
        );
      case "manage-courses":
        return (
          <div className="tab-content">
            <h3>Quản lý khóa học</h3>
            {allCourses.data.length > 0 ? (
              <>
                <ul>
                  {allCourses.data.map((course) => (
                    <li key={course.id}>
                      <h4>{course.title}</h4>
                      <p>{course.description}</p>
                      <p>Trạng thái: {course.status}</p>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete("courses", course.id, fetchAllCourses, allCourses.page)}
                      >
                        Xóa
                      </button>
                    </li>
                  ))}
                </ul>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Tiếp >"
                  onPageChange={(event) => fetchAllCourses(event.selected + 1)}
                  pageRangeDisplayed={5}
                  pageCount={Math.ceil(allCourses.total / itemsPerPage)}
                  previousLabel="< Trước"
                  renderOnZeroPageCount={null}
                  containerClassName="pagination"
                  activeClassName="active"
                />
              </>
            ) : (
              <p>Chưa có khóa học nào.</p>
            )}
          </div>
        );
      case "post-news":
        return (
          <div className="tab-content">
            <h3>Đăng tin tức</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const title = e.target.title.value;
                const content = e.target.content.value;
                handlePostNews({ title, content });
              }}
            >
              <div className="form-group">
                <label>Tiêu đề:</label>
                <input type="text" name="title" required />
              </div>
              <div className="form-group">
                <label>Nội dung:</label>
                <textarea name="content" rows="5" required></textarea>
              </div>
              <button type="submit">Đăng tin tức</button>
            </form>
          </div>
        );
      case "system-stats":
        return (
          <div className="tab-content">
            <h3>Thống kê hệ thống</h3>
            {stats && (
              <div>
                <p>Tổng số người dùng: {stats.totalUsers}</p>
                <p>Tổng số khóa học: {stats.totalCourses}</p>
                <p>Tổng số đề thi: {stats.totalExams}</p>
              </div>
            )}
          </div>
        );
      case "manage-users":
        return (
          <div className="tab-content">
            <h3>Quản lý người dùng</h3>
            {allUsers.data.length > 0 ? (
              <>
                <ul>
                  {allUsers.data.map((user) => (
                    <li key={user._id}>
                      <p>{user.username} ({user.email}) - Vai trò: {user.role}</p>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete("users", user._id, fetchAllUsers, allUsers.page)}
                      >
                        Xóa
                      </button>
                    </li>
                  ))}
                </ul>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Tiếp >"
                  onPageChange={(event) => fetchAllUsers(event.selected + 1)}
                  pageRangeDisplayed={5}
                  pageCount={Math.ceil(allUsers.total / itemsPerPage)}
                  previousLabel="< Trước"
                  renderOnZeroPageCount={null}
                  containerClassName="pagination"
                  activeClassName="active"
                />
              </>
            ) : (
              <p>Chưa có người dùng nào.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Nếu user là null, không render gì cả (navigate sẽ xử lý)
  if (!user) {
    return null;
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
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="main-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Profile;