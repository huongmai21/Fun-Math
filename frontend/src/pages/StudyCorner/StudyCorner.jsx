import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import "./StudyCorner.css";

const StudyCorner = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("study");
  const [posts, setPosts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [solvedExercises, setSolvedExercises] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAttachments, setNewPostAttachments] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [whoToFollow, setWhoToFollow] = useState([]);

  useEffect(() => {
    axios.get("/api/posts?category=question")
      .then((response) => setExercises(response.data))
      .catch((error) => toast.error("Lỗi khi lấy bài tập: " + error.message));

    axios.get("/api/posts?category_ne=question")
      .then((response) => setPosts(response.data))
      .catch((error) => toast.error("Lỗi khi lấy bài đăng: " + error.message));

    axios.get("/api/users/suggestions")
      .then((response) => setWhoToFollow(response.data))
      .catch((error) => toast.error("Lỗi khi lấy gợi ý theo dõi: " + error.message));

    axios.get("/api/bookmarks")
      .then((response) => setBookmarkedPosts(response.data))
      .catch((error) => toast.error("Lỗi khi lấy bài đã lưu: " + error.message));

    axios.get("/api/posts?category=question&isSolved=true")
      .then((response) => setSolvedExercises(response.data))
      .catch((error) => toast.error("Lỗi khi lấy bài đã giải: " + error.message));

    axios.get("/api/notifications")
      .then((response) => setNotifications(response.data))
      .catch((error) => toast.error("Lỗi khi lấy thông báo: " + error.message));

    setTrendingTopics(["JavaScript", "TechTalk"]);
  }, []);

  const handlePostSubmit = async () => {
    if (!newPostContent) {
      toast.error("Nội dung bài đăng không được để trống!");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("content", newPostContent);
      formData.append("category", "discussion");
      newPostAttachments.forEach((file) => formData.append("attachments", file));

      const response = await axios.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPosts([response.data, ...posts]);
      setNewPostContent("");
      setNewPostAttachments([]);
      toast.success("Đăng bài thành công!");
    } catch (error) {
      toast.error("Lỗi khi đăng bài: " + error.message);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewPostAttachments([...newPostAttachments, ...files]);
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`/api/posts/${postId}/like`);
      setPosts(posts.map((post) => post._id === postId ? { ...post, likes: [...post.likes, user._id] } : post));
    } catch (error) {
      toast.error("Lỗi khi thích bài đăng: " + error.message);
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const response = await axios.post("/api/bookmarks", { postId });
      setBookmarkedPosts([...bookmarkedPosts, response.data]);
      toast.success("Đã lưu bài đăng!");
    } catch (error) {
      toast.error("Lỗi khi lưu bài: " + error.message);
    }
  };

  const handleComment = (postId) => {
    toast.info("Chức năng bình luận đang được phát triển!");
  };

  const handleShare = async (postId) => {
    try {
      await axios.post(`/api/posts/${postId}/share`);
      setPosts(posts.map((post) => post._id === postId ? { ...post, shares: (post.shares || 0) + 1 } : post));
    } catch (error) {
      toast.error("Lỗi khi chia sẻ: " + error.message);
    }
  };

  const handleAISolve = async (exerciseId, image) => {
    try {
      const ocrResponse = await axios.post("https://vision.googleapis.com/v1/images:annotate", {
        requests: [
          {
            image: { content: image.split(",")[1] },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }, {
        headers: { Authorization: `Bearer YOUR_GOOGLE_VISION_API_KEY` },
      });
      const problemText = ocrResponse.data.responses[0].fullTextAnnotation.text;

      const wolframResponse = await axios.get("https://api.wolframalpha.com/v2/query", {
        params: {
          input: problemText,
          appid: "YOUR_WOLFRAM_ALPHA_APP_ID",
          output: "json",
        },
      });
      const solution = wolframResponse.data.queryresult.pods.find((pod) => pod.title === "Solution")?.subpods[0]?.plaintext;

      toast.success("Kết quả: " + (solution || "Không tìm thấy kết quả"));
    } catch (error) {
      toast.error("Lỗi khi giải bài: " + error.message);
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) || exercise.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter ? exercise.grade === gradeFilter : true;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="study-corner-page">
      <div className="sidebar-left">
        <ul>
          <li className={activeTab === "study" ? "active" : ""} onClick={() => setActiveTab("study")} title="Góc học tập">
            <i className="fa-solid fa-book"></i>
          </li>
          <li className={activeTab === "share" ? "active" : ""} onClick={() => setActiveTab("share")} title="Góc chia sẻ">
            <i className="fa-solid fa-share"></i>
          </li>
          <li className={activeTab === "saved" ? "active" : ""} onClick={() => setActiveTab("saved")} title="Bài đã lưu">
            <i className="fa-solid fa-bookmark"></i>
          </li>
          <li className={activeTab === "solved" ? "active" : ""} onClick={() => setActiveTab("solved")} title="Bài đã giải">
            <i className="fa-solid fa-check"></i>
          </li>
          <li className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")} title="Thông báo">
            <i className="fa-solid fa-bell"></i>
          </li>
        </ul>
        <div className="user-info">
          <img src={user?.avatar || "/default-avatar.png"} alt="Avatar" className="sidebar-avatar" />
        </div>
      </div>
      <div className="main-content">
        {activeTab === "study" && (
          <div className="study-tab">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm bài tập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <label htmlFor="ai-solve">
                <i className="fa-solid fa-camera"></i> Giải bằng AI
              </label>
              <input
                id="ai-solve"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => handleAISolve(null, reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ display: "none" }}
              />
            </div>
            <div className="grade-filter">
              <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
                <option value="">Tất cả lớp</option>
                <option value="8">Lớp 8</option>
                <option value="9">Lớp 9</option>
                <option value="10">Lớp 10</option>
                <option value="11">Lớp 11</option>
                <option value="12">Lớp 12</option>
              </select>
            </div>
            <div className="exercise-list">
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => (
                  <div key={exercise._id} className="exercise-item">
                    <h3>{exercise.title}</h3>
                    <p>Lớp: {exercise.grade}</p>
                    <p>{exercise.content}</p>
                    <p>Đăng bởi: {exercise.author.username}</p>
                    <button onClick={() => handleAISolve(exercise._id)}>Giải bài</button>
                  </div>
                ))
              ) : (
                <p>Không tìm thấy bài tập nào.</p>
              )}
            </div>
          </div>
        )}
        {activeTab === "share" && (
          <div className="share-tab">
            <div className="share-header">
              <button className="share-tab-btn active">For you</button>
              <button className="share-tab-btn">Following</button>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="new-post">
              <textarea
                placeholder="Start a post..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <div className="post-actions">
                <label htmlFor="file-upload">
                  <i className="fa-solid fa-paperclip"></i>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <button onClick={handlePostSubmit}>Đăng</button>
              </div>
              {newPostAttachments.length > 0 && (
                <div className="post-attachments">
                  {newPostAttachments.map((attachment, index) => (
                    <img key={index} src={URL.createObjectURL(attachment)} alt="Attachment" />
                  ))}
                </div>
              )}
            </div>
            <div className="post-list">
              {posts.map((post) => (
                <div key={post._id} className="post-item">
                  <div className="post-header">
                    <img src={post.author.avatar || "/default-avatar.png"} alt="Avatar" className="post-avatar" />
                    <div>
                      <span className="post-author">{post.author.username}</span>
                      <span className="post-time">
                        {Math.floor((Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60))} giờ trước
                      </span>
                    </div>
                  </div>
                  <p>{post.content}</p>
                  {post.attachments.length > 0 && (
                    <img src={post.attachments[0]} alt="Post attachment" className="post-image" />
                  )}
                  <div className="post-actions">
                    <button onClick={() => handleLike(post._id)}>
                      <i className="fa-solid fa-heart"></i> {post.likes.length}
                    </button>
                    <button onClick={() => handleComment(post._id)}>
                      <i className="fa-solid fa-comment"></i> {post.comments || 0}
                    </button>
                    <button onClick={() => handleShare(post._id)}>
                      <i className="fa-solid fa-share"></i> {post.shares || 0}
                    </button>
                    <button onClick={() => handleBookmark(post._id)}>
                      <i className="fa-solid fa-bookmark"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "saved" && (
          <div className="saved-tab">
            <h2>Bài đã lưu</h2>
            <div className="post-list">
              {bookmarkedPosts.length > 0 ? (
                bookmarkedPosts.map((bookmark) => (
                  <div key={bookmark._id} className="post-item">
                    <div className="post-header">
                      <img src={bookmark.post.author.avatar || "/default-avatar.png"} alt="Avatar" className="post-avatar" />
                      <div>
                        <span className="post-author">{bookmark.post.author.username}</span>
                        <span className="post-time">
                          {Math.floor((Date.now() - new Date(bookmark.createdAt)) / (1000 * 60 * 60))} giờ trước
                        </span>
                      </div>
                    </div>
                    <p>{bookmark.post.content}</p>
                    {bookmark.post.attachments.length > 0 && (
                      <img src={bookmark.post.attachments[0]} alt="Post attachment" className="post-image" />
                    )}
                  </div>
                ))
              ) : (
                <p>Chưa có bài đăng nào được lưu.</p>
              )}
            </div>
          </div>
        )}
        {activeTab === "solved" && (
          <div className="solved-tab">
            <h2>Bài đã giải</h2>
            <div className="exercise-list">
              {solvedExercises.length > 0 ? (
                solvedExercises.map((exercise) => (
                  <div key={exercise._id} className="exercise-item">
                    <h3>{exercise.title}</h3>
                    <p>Lớp: {exercise.grade}</p>
                    <p>{exercise.content}</p>
                    <p>Đăng bởi: {exercise.author.username}</p>
                  </div>
                ))
              ) : (
                <p>Chưa có bài tập nào được giải.</p>
              )}
            </div>
          </div>
        )}
        {activeTab === "notifications" && (
          <div className="notifications-tab">
            <h2>Thông báo</h2>
            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification._id} className="notification-item">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {Math.floor((Date.now() - new Date(notification.createdAt)) / (1000 * 60 * 60))} giờ trước
                    </span>
                  </div>
                ))
              ) : (
                <p>Không có thông báo nào.</p>
              )}
            </div>
          </div>
        )}
      </div>
      {(activeTab === "share" || activeTab === "saved") && (
        <div className="sidebar-right">
          <div className="who-to-follow">
            <h3>Who to follow</h3>
            {whoToFollow.map((person) => (
              <div key={person._id} className="follow-item">
                <img src={person.avatar || "/default-avatar.png"} alt="Avatar" className="follow-avatar" />
                <div>
                  <span className="follow-name">{person.username}</span>
                  <span className="follow-bio">{person.bio}</span>
                </div>
                <button>Follow</button>
              </div>
            ))}
          </div>
          <div className="trending-topics">
            <h3>Trending topics</h3>
            {trendingTopics.map((topic, index) => (
              <div key={index} className="topic-item">
                #{topic}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyCorner;