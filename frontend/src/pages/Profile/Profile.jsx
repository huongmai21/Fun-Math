import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { Tooltip } from "react-tooltip"; // Import Tooltip
import CommentSection from "../../components/common/Comment/CommentSection";
import {
  fetchProfile,
  fetchFollowers,
  fetchFollowing,
  followUser,
  unfollowUser,
  fetchStudentStats,
  fetchTeacherStats,
  fetchSystemStats,
  fetchAllUsers,
  deleteUser,
  updateProfile,
  updateAvatar,
  fetchUserActivity,
} from "../../services/userService";
import { fetchPosts, deletePost, editPost } from "../../services/postService";
import { fetchCourses, fetchAllCourses, deleteCourse } from "../../services/courseService";
import { fetchLibrary, uploadDocument, deleteDocument, editDocument } from "../../services/libraryService";
import { createExam } from "../../services/examService";
import { postNews } from "../../services/newsService";
import { toast } from "react-toastify";
import "./Profile.css";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
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
  const [activityData, setActivityData] = useState({ activity: [], total: 0 });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
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

  const sidebarTabs = user
    ? [...commonTabs, ...(roleTabs[user.role] || [])]
    : commonTabs;

  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để xem hồ sơ!");
      navigate("/auth/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const profile = await fetchProfile();
        setProfileData(profile);

        if (user.role === "student") {
          const stats = await fetchStudentStats();
          setStats(stats);
        } else if (user.role === "teacher") {
          const stats = await fetchTeacherStats();
          setStats(stats);
        } else if (user.role === "admin") {
          const stats = await fetchSystemStats();
          setStats(stats);
        }

        await fetchFollowersData(1);
        await fetchFollowingData(1);
        await fetchPostsData(1);
        await fetchLibraryData(1);
        if (user.role === "student") {
          await fetchCoursesData(1, "enrolled");
        } else if (user.role === "teacher") {
          await fetchCoursesData(1, "created");
        }
        if (user.role === "admin") {
          await fetchAllCoursesData(1);
          await fetchAllUsersData(1);
        }

        const activity = await fetchUserActivity(selectedYear);
        setActivityData(activity);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, selectedYear]);

  const fetchFollowersData = async (page) => {
    const data = await fetchFollowers(page, itemsPerPage);
    setFollowers({ data: data.data, total: data.total, page });
  };

  const fetchFollowingData = async (page) => {
    const data = await fetchFollowing(page, itemsPerPage);
    setFollowing({ data: data.data, total: data.total, page });
  };

  const fetchPostsData = async (page) => {
    const data = await fetchPosts(page, itemsPerPage);
    setPosts({ data: data.data, total: data.total, page });
  };

  const fetchLibraryData = async (page) => {
    const data = await fetchLibrary(page, itemsPerPage);
    setLibrary({ data: data.data, total: data.total, page });
  };

  const fetchCoursesData = async (page, type) => {
    const data = await fetchCourses(type, page, itemsPerPage);
    setCourses({ data: data.data, total: data.total, page });
  };

  const fetchAllCoursesData = async (page) => {
    const data = await fetchAllCourses(page, itemsPerPage);
    setAllCourses({ data: data.data, total: data.total, page });
  };

  const fetchAllUsersData = async (page) => {
    const data = await fetchAllUsers(page, itemsPerPage);
    setAllUsers({ data: data.data, total: data.total, page });
  };

  const handleFollow = async (targetUserId) => {
    await followUser(targetUserId);
    toast.success("Theo dõi thành công!");
    const profile = await fetchProfile();
    setProfileData(profile);
    await fetchFollowingData(following.page);
    await fetchFollowersData(followers.page);
  };

  const handleUnfollow = async (targetUserId) => {
    await unfollowUser(targetUserId);
    toast.success("Bỏ theo dõi thành công!");
    const profile = await fetchProfile();
    setProfileData(profile);
    await fetchFollowingData(following.page);
    await fetchFollowersData(followers.page);
  };

  const handleCreateExam = async (examData) => {
    await createExam(examData);
    toast.success("Tạo đề thi thành công!");
  };

  const handleUploadDoc = async (formData) => {
    await uploadDocument(formData);
    toast.success("Tải tài liệu thành công!");
    await fetchLibraryData(1);
  };

  const handlePostNews = async (newsData) => {
    await postNews(newsData);
    toast.success("Đăng tin tức thành công!");
  };

  const handleDelete = async (type, id, fetchFunction, page) => {
    if (type === "posts") {
      await deletePost(id);
    } else if (type === "courses") {
      await deleteCourse(id);
    } else if (type === "library") {
      await deleteDocument(id);
    } else if (type === "users") {
      await deleteUser(id);
    }
    toast.success("Xóa thành công!");
    await fetchFunction(page);
  };

  const handleEdit = async (type, id, data, fetchFunction, page) => {
    if (type === "posts") {
      await editPost(id, data);
    } else if (type === "library") {
      await editDocument(id, data);
    }
    toast.success("Chỉnh sửa thành công!");
    setEditingItem(null);
    await fetchFunction(page);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const bio = e.target.bio.value;
    const data = { username, email, bio };
    await updateProfile(data);
    toast.success("Cập nhật thông tin thành công!");
    const profile = await fetchProfile();
    setProfileData(profile);
    setIsEditingProfile(false);
  };

  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    const file = e.target.avatar.files[0];
    const formData = new FormData();
    formData.append("avatar", file);
    await updateAvatar(formData);
    toast.success("Cập nhật ảnh avatar thành công!");
    const profile = await fetchProfile();
    setProfileData(profile);
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
    const daysInYear = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
    const weeks = Math.ceil(daysInYear / 7);
    const activityMap = {};

    activityData.activity.forEach(({ date, count, details }) => {
      activityMap[date] = { count, details };
    });

    const squares = [];
    let currentDate = new Date(startDate);
    const monthPositions = [];

    for (let week = 0; week < weeks; week++) {
      const weekSquares = [];
      const currentMonth = currentDate.getMonth();
      if (
        week === 0 ||
        (currentDate.getDate() <= 7 && currentMonth !== new Date(currentDate).setDate(currentDate.getDate() - 7).getMonth())
      ) {
        monthPositions.push({ week, month: months[currentMonth] });
      }

      for (let day = 0; day < 7; day++) {
        if (currentDate.getFullYear() !== selectedYear) break;
        const dateStr = currentDate.toISOString().split("T")[0];
        const activity = activityMap[dateStr] || { count: 0, details: [] };
        const count = activity.count;
        let colorClass = "activity-square level-0";
        if (count > 0 && count <= 2) colorClass = "activity-square level-1";
        else if (count > 2 && count <= 5) colorClass = "activity-square level-2";
        else if (count > 5) colorClass = "activity-square level-3";

        weekSquares.push(
          <div
            key={dateStr}
            className={colorClass}
            data-tooltip-id={`tooltip-${dateStr}`}
            data-tooltip-content={
              count > 0
                ? `${dateStr}: ${count} hoạt động\n${activity.details
                    .map((d) => d.description)
                    .join("\n")}`
                : `${dateStr}: Không có hoạt động`
            }
          ></div>
        );
        currentDate.setDate(currentDate.getDate() + 1);
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
          <h3>{activityData.total} hoạt động trong năm {selectedYear}</h3>
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
          <div className="activity-square level-1"></div>
          <div className="activity-square level-2"></div>
          <div className="activity-square level-3"></div>
          <span>Nhiêu</span>
        </div>
        <Tooltip
          id="activity-tooltip"
          place="top"
          style={{ whiteSpace: "pre-line", zIndex: 1000 }}
        />
      </div>
    );
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
                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                      <label>Tên người dùng:</label>
                      <input
                        type="text"
                        name="username"
                        defaultValue={profileData?.username}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email:</label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={profileData?.email}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Tiểu sử:</label>
                      <textarea
                        name="bio"
                        defaultValue={profileData?.bio || ""}
                        rows="3"
                      ></textarea>
                    </div>
                    <button type="submit">Lưu</button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Hủy
                    </button>
                  </form>
                ) : (
                  <>
                    <h2>{profileData?.username || "Người dùng"}</h2>
                    <p>{profileData?.email}</p>
                    <p>{profileData?.bio || "Chưa có tiểu sử"}</p>
                    <p>
                      <strong>Người theo dõi:</strong>{" "}
                      {profileData?.followers || 0}
                    </p>
                    <p>
                      <strong>Đang theo dõi:</strong>{" "}
                      {profileData?.following || 0}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      <span
                        className={`status ${
                          profileData?.isActive ? "active" : "inactive"
                        }`}
                      >
                        {profileData?.isActive
                          ? "Đang hoạt động"
                          : "Không hoạt động"}
                      </span>
                    </p>
                    <button
                      className="action-btn edit"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Chỉnh sửa thông tin
                    </button>
                  </>
                )}
                <form onSubmit={handleUpdateAvatar}>
                  <div className="form-group">
                    <label>Thay đổi ảnh avatar:</label>
                    <input type="file" name="avatar" accept="image/*" required />
                  </div>
                  <button type="submit">Cập nhật avatar</button>
                </form>
              </div>
            </div>
            {renderActivityGraph()}
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
                      {editingItem?.type === "library" &&
                      editingItem?.id === doc.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const title = e.target.title.value;
                            handleEdit(
                              "library",
                              doc.id,
                              { title },
                              fetchLibraryData,
                              library.page
                            );
                          }}
                        >
                          <input
                            type="text"
                            name="title"
                            defaultValue={doc.title}
                            required
                          />
                          <button type="submit">Lưu</button>
                          <button
                            type="button"
                            onClick={() => setEditingItem(null)}
                          >
                            Hủy
                          </button>
                        </form>
                      ) : (
                        <>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {doc.title}
                          </a>{" "}
                          - {new Date(doc.createdAt).toLocaleDateString()}
                          <button
                            className="action-btn edit"
                            onClick={() =>
                              setEditingItem({ type: "library", id: doc.id })
                            }
                          >
                            Sửa
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() =>
                              handleDelete(
                                "library",
                                doc.id,
                                fetchLibraryData,
                                library.page
                              )
                            }
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
                  onPageChange={(event) => fetchLibraryData(event.selected + 1)}
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
                        src={
                          follower.avatar || "/assets/images/default-avatar.png"
                        }
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
                  onPageChange={(event) => fetchFollowersData(event.selected + 1)}
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
                  onPageChange={(event) => fetchFollowingData(event.selected + 1)}
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
                      {editingItem?.type === "posts" &&
                      editingItem?.id === post.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const title = e.target.title.value;
                            const content = e.target.content.value;
                            handleEdit(
                              "posts",
                              post.id,
                              { title, content },
                              fetchPostsData,
                              posts.page
                            );
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
                          <button
                            type="button"
                            onClick={() => setEditingItem(null)}
                          >
                            Hủy
                          </button>
                        </form>
                      ) : (
                        <>
                          <h4>{post.title}</h4>
                          <p>{post.content}</p>
                          <small>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </small>
                          <button
                            className="action-btn edit"
                            onClick={() =>
                              setEditingItem({ type: "posts", id: post.id })
                            }
                          >
                            Sửa
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() =>
                              handleDelete(
                                "posts",
                                post.id,
                                fetchPostsData,
                                posts.page
                              )
                            }
                          >
                            Xóa
                          </button>
                          <CommentSection
                            referenceId={post.id}
                            referenceType="post"
                          />
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Tiếp >"
                  onPageChange={(event) => fetchPostsData(event.selected + 1)}
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
            <h3>
              {user.role === "student" ? "Khóa học đã tham gia" : "Khóa học đã tạo"}
            </h3>
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
                    fetchCoursesData(
                      event.selected + 1,
                      user.role === "student" ? "enrolled" : "created"
                    )
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
                        onClick={() =>
                          handleDelete(
                            "courses",
                            course.id,
                            fetchAllCoursesData,
                            allCourses.page
                          )
                        }
                      >
                        Xóa
                      </button>
                    </li>
                  ))}
                </ul>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Tiếp >"
                  onPageChange={(event) => fetchAllCoursesData(event.selected + 1)}
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
                      <p>
                        {user.username} ({user.email}) - Vai trò: {user.role}
                      </p>
                      <button
                        className="action-btn delete"
                        onClick={() =>
                          handleDelete(
                            "users",
                            user._id,
                            fetchAllUsersData,
                            allUsers.page
                          )
                        }
                      >
                        Xóa
                      </button>
                    </li>
                  ))}
                </ul>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Tiếp >"
                  onPageChange={(event) => fetchAllUsersData(event.selected + 1)}
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