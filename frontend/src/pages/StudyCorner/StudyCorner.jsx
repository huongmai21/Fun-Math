import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import axios from "axios";
import { getPosts, createPost, likePost, sharePost, addComment } from "../../services/postService";
import { getUserSuggestions, followUser, unfollowUser } from "../../services/userService";
import "./StudyCorner.css";

const StudyCorner = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("exercise");
  const [posts, setPosts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageSearchFile, setImageSearchFile] = useState(null);
  const [gradeFilter, setGradeFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAttachments, setNewPostAttachments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [whoToFollow, setWhoToFollow] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const exercisesData = await getPosts({ category: "question", page, limit: postsPerPage });
        setExercises(Array.isArray(exercisesData.data) ? exercisesData.data : []);

        const postsData = await getPosts({ category_ne: "question", page, limit: postsPerPage });
        setPosts(Array.isArray(postsData.data) ? postsData.data : []);

        const suggestionsData = await getUserSuggestions();
        setWhoToFollow(Array.isArray(suggestionsData.data) ? suggestionsData.data : []);

        setTrendingTopics(["Toán học", "Lập trình"]);

        setNotifications([
          { id: 1, message: "Bài đăng của bạn đã được bình luận!", date: "2025-04-20" },
          { id: 2, message: "Câu hỏi của bạn đã được giải đáp!", date: "2025-04-19" },
        ]);
      } catch (err) {
        setError("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  const handlePostSubmit = async () => {
    if (!newPostContent && !newPostTitle) {
      toast.error("Vui lòng điền nội dung!");
      return;
    }
    try {
      const formData = new FormData();
      if (newPostTitle) formData.append("title", newPostTitle);
      formData.append("content", newPostContent);
      formData.append("category", activeTab === "exercise" ? "question" : "general");
      if (activeTab === "exercise") {
        formData.append("grade", gradeFilter || "N/A");
        formData.append("subject", subjectFilter || "N/A");
      }
      newPostAttachments.forEach((file) => formData.append("attachments", file));

      const response = await createPost(formData);
      if (activeTab === "exercise") {
        setExercises((prev) => [response, ...prev]);
        setNotifications((prev) => [
          ...prev,
          { id: Date.now(), message: `Câu hỏi "${newPostTitle || "Untitled"}" đã được đăng!`, date: new Date().toISOString().split("T")[0] },
        ]);
      } else {
        setPosts((prev) => [response, ...prev]);
        setNotifications((prev) => [
          ...prev,
          { id: Date.now(), message: `Bài đăng "${newPostContent.slice(0, 20)}..." đã được đăng!`, date: new Date().toISOString().split("T")[0] },
        ]);
      }
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostAttachments([]);
      setShowPostForm(false);
      toast.success("Đăng bài thành công!");
    } catch (error) {
      toast.error("Lỗi khi đăng bài!");
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewPostAttachments([...newPostAttachments, ...files]);
  };

  const handleImageSearchUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageSearchFile(file);
    }
  };

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      if (activeTab === "exercise") {
        setExercises((prev) =>
          prev.map((exercise) =>
            exercise._id === postId
              ? { ...exercise, likes: [...(exercise.likes || []), user?._id] }
              : exercise
          )
        );
      } else {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, likes: [...(post.likes || []), user?._id] }
              : post
          )
        );
      }
      toast.success("Đã thích bài đăng!");
    } catch (error) {
      toast.error("Lỗi khi thích bài đăng!");
    }
  };

  const handleComment = async (postId) => {
    if (!newComment) {
      toast.error("Vui lòng nhập bình luận!");
      return;
    }
    try {
      await addComment(postId, newComment);
      const updatedPosts = activeTab === "exercise"
        ? await getPosts({ category: "question", page, limit: postsPerPage })
        : await getPosts({ category_ne: "question", page, limit: postsPerPage });
      if (activeTab === "exercise") {
        setExercises(Array.isArray(updatedPosts.data) ? updatedPosts.data : []);
      } else {
        setPosts(Array.isArray(updatedPosts.data) ? updatedPosts.data : []);
      }
      setNotifications((prev) => [
        ...prev,
        { id: Date.now(), message: "Bạn đã bình luận một bài đăng!", date: new Date().toISOString().split("T")[0] },
      ]);
      setNewComment("");
      toast.success("Đã thêm bình luận!");
    } catch (error) {
      toast.error("Lỗi khi thêm bình luận!");
    }
  };

  const handleShare = async (postId) => {
    try {
      await sharePost(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, shares: (post.shares || 0) + 1 }
            : post
        )
      );
      toast.success("Đã chia sẻ bài đăng!");
    } catch (error) {
      toast.error("Lỗi khi chia sẻ!");
    }
  };

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      setWhoToFollow((prev) =>
        prev.map((person) =>
          person._id === userId
            ? { ...person, isFollowing: true }
            : person
        )
      );
      toast.success("Đã theo dõi!");
    } catch (err) {
      toast.error("Không thể theo dõi!");
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      setWhoToFollow((prev) =>
        prev.map((person) =>
          person._id === userId
            ? { ...person, isFollowing: false }
            : person
        )
      );
      toast.success("Đã bỏ theo dõi!");
    } catch (err) {
      toast.error("Không thể bỏ theo dõi!");
    }
  };

  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
    setAiSearchResult(null);
  };

  const handleAISearch = async (useImage = false) => {
    if (!searchQuery && !useImage) {
      toast.error("Vui lòng nhập câu hỏi hoặc chọn hình ảnh để tìm kiếm!");
      return;
    }

    setAiLoading(true);
    setAiSearchResult(null);
    setSelectedExercise(null);

    try {
      if (useImage && imageSearchFile) {
        const mockResult = {
          content: "Kết quả từ hình ảnh: Đây là bài toán tích phân.",
          steps: ["Bước 1: Xác định hàm số.", "Bước 2: Tính đạo hàm."],
        };
        setAiSearchResult(mockResult);
      } else {
        const response = await axios.get("http://api.wolframalpha.com/v2/query", {
          params: {
            input: searchQuery,
            appid: process.env.REACT_APP_WOLFRAM_ALPHA_APPID,
            format: "plaintext",
            output: "json",
          },
        });

        const pods = response.data.queryresult.pods;
        if (pods && pods.length > 0) {
          const result = pods
            .filter((pod) => pod.title === "Result" || pod.title.includes("Solution"))
            .map((pod) => ({
              title: pod.title,
              content: pod.subpods[0].plaintext,
            }));

          setAiSearchResult({
            content: result.length > 0 ? result[0].content : "Không tìm thấy kết quả phù hợp.",
            steps: result.map((r) => r.content),
          });
        } else {
          setAiSearchResult({
            content: "Không tìm thấy kết quả từ AI.",
            steps: [],
          });
        }
      }
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm bằng AI!");
      setAiSearchResult({
        content: "Đã có lỗi xảy ra khi gọi API AI.",
        steps: [],
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearch = async () => {
    setPage(1);
    setSelectedExercise(null);
    setAiSearchResult(null);

    try {
      if (activeTab === "study") {
        const response = await getPosts({ content: searchQuery, page, limit: postsPerPage });
        setSearchResults(Array.isArray(response.data) ? response.data : []);
      } else if (activeTab === "share") {
        const response = await getPosts({ category_ne: "question", content: searchQuery, page, limit: postsPerPage });
        setPosts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm!");
      if (activeTab === "study") setSearchResults([]);
      else setPosts([]);
    }
  };

  const handleImageSearch = async () => {
    if (!imageSearchFile) {
      toast.error("Vui lòng chọn hình ảnh để tìm kiếm!");
      return;
    }
    setPage(1);
    setSelectedExercise(null);
    setAiSearchResult(null);

    try {
      const mockResults = [
        { _id: "1", title: "Bài toán tích phân", content: "Tìm tích phân của hàm số...", author: { username: "User1" } },
        { _id: "2", title: "Phương trình vi phân", content: "Giải phương trình...", author: { username: "User2" } },
      ];
      setSearchResults(mockResults);
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm bằng hình ảnh!");
      setSearchResults([]);
    }
  };

  const handleBookmark = (item) => {
    if (bookmarks.some((bookmark) => bookmark._id === item._id)) {
      setBookmarks((prev) => prev.filter((bookmark) => bookmark._id !== item._id));
      toast.success("Đã xóa khỏi bookmark!");
    } else {
      setBookmarks((prev) => [...prev, item]);
      toast.success("Đã thêm vào bookmark!");
    }
  };

  const filteredExercises = Array.isArray(exercises)
    ? exercises.filter((exercise) => {
        const matchesGrade = gradeFilter ? exercise?.grade === gradeFilter : true;
        const matchesSubject = subjectFilter ? exercise?.subject === subjectFilter : true;
        const matchesStatus = statusFilter
          ? (statusFilter === "solved" ? exercise.solved : !exercise.solved)
          : true;
        const withinSixDays =
          (Date.now() - new Date(exercise.createdAt)) / (1000 * 60 * 60 * 24) <= 6;
        return matchesGrade && matchesSubject && matchesStatus && withinSixDays;
      })
    : [];

  const filteredPosts = Array.isArray(posts)
    ? posts.filter((post) =>
        post?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredSearchResults = Array.isArray(searchResults)
    ? searchResults.filter((result) =>
        result?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="study-corner-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!user) {
    return <div>Vui lòng đăng nhập để tiếp tục.</div>;
  }

  return (
    <div className="study-corner-page">
      <div className="sidebar-left">
        <ul>
          <li
            className={activeTab === "exercise" ? "active" : ""}
            onClick={() => setActiveTab("exercise")}
            data-tooltip-id="exercise-tab"
            data-tooltip-content="Góc giải bài tập"
          >
            <i className="fa-solid fa-pen"></i>
          </li>
          <li
            className={activeTab === "study" ? "active" : ""}
            onClick={() => setActiveTab("study")}
            data-tooltip-id="study-tab"
            data-tooltip-content="Góc học tập"
          >
            <i className="fa-solid fa-book"></i>
          </li>
          <li
            className={activeTab === "share" ? "active" : ""}
            onClick={() => setActiveTab("share")}
            data-tooltip-id="share-tab"
            data-tooltip-content="Góc chia sẻ"
          >
            <i className="fa-solid fa-share"></i>
          </li>
          <li
            className={activeTab === "bookmarks" ? "active" : ""}
            onClick={() => setActiveTab("bookmarks")}
            data-tooltip-id="bookmarks-tab"
            data-tooltip-content="Bookmarks"
          >
            <i className="fa-solid fa-bookmark"></i>
          </li>
          <li
            className={activeTab === "notifications" ? "active" : ""}
            onClick={() => setActiveTab("notifications")}
            data-tooltip-id="notifications-tab"
            data-tooltip-content="Thông báo"
          >
            <i className="fa-solid fa-bell"></i>
          </li>
        </ul>
        <Tooltip id="exercise-tab" place="right" style={{ zIndex: 1000 }} />
        <Tooltip id="study-tab" place="right" style={{ zIndex: 1000 }} />
        <Tooltip id="share-tab" place="right" style={{ zIndex: 1000 }} />
        <Tooltip id="bookmarks-tab" place="right" style={{ zIndex: 1000 }} />
        <Tooltip id="notifications-tab" place="right" style={{ zIndex: 1000 }} />
      </div>
      <div className="main-content">
        {activeTab === "exercise" && (
          <div className="exercise-tab">
            <div className="exercise-left">
              <div className="filters">
                <div className="grade-filter">
                  <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
                    <option value="">Tất cả lớp</option>
                    {[...Array(12)].map((_, index) => (
                      <option key={index + 1} value={`Lớp ${index + 1}`}>
                        Lớp {index + 1}
                      </option>
                    ))}
                    <option value="Đại học">Đại học</option>
                  </select>
                </div>
                <div className="subject-filter">
                  <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                    <option value="">Tất cả môn</option>
                    {gradeFilter === "Đại học" ? (
                      <>
                        <option value="Toán cao cấp">Toán cao cấp</option>
                        <option value="Giải tích">Giải tích</option>
                        <option value="Đại số">Đại số</option>
                        <option value="Xác suất thống kê">Xác suất thống kê</option>
                        <option value="Phương trình vi phân">Phương trình vi phân</option>
                      </>
                    ) : (
                      <>
                        <option value="Toán">Toán</option>
                        <option value="Văn">Văn</option>
                        <option value="Anh">Anh</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="status-filter">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="solved">Đã giải</option>
                    <option value="pending">Đang chờ</option>
                  </select>
                </div>
                <button
                  className="post-question-btn"
                  data-tooltip-id="post-question"
                  data-tooltip-content="Đăng câu hỏi mới"
                  onClick={() => setShowPostForm(true)}
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
                <Tooltip id="post-question" place="top" style={{ zIndex: 1000 }} />
              </div>
              {showPostForm && (
                <div className="post-form">
                  <h3>Đăng câu hỏi mới</h3>
                  <input
                    type="text"
                    placeholder="Tiêu đề câu hỏi..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Nội dung câu hỏi..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  <div className="post-actions">
                    <label htmlFor="file-upload-exercise">
                      <i className="fa-solid fa-paperclip"></i> Đính kèm
                    </label>
                    <input
                      id="file-upload-exercise"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                    <button onClick={handlePostSubmit}>Gửi</button>
                    <button onClick={() => setShowPostForm(false)} className="cancel-btn">
                      Hủy
                    </button>
                  </div>
                  {newPostAttachments.length > 0 && (
                    <div className="post-attachments">
                      {newPostAttachments.map((attachment, index) => (
                        <img key={index} src={URL.createObjectURL(attachment)} alt="Attachment" />
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="exercise-list">
                <h3>Các bài đăng mới nhất xuất hiện ở đây 6 ngày</h3>
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <div
                      key={exercise._id}
                      className={`exercise-item ${selectedExercise?._id === exercise._id ? "selected" : ""}`}
                      onClick={() => handleSelectExercise(exercise)}
                    >
                      <h4>{exercise.title || "Không có tiêu đề"}</h4>
                      <p>Lớp: {exercise.grade || "N/A"}</p>
                      <p>Môn: {exercise.subject || "N/A"}</p>
                      <p>Trạng thái: {exercise.solved ? "Đã giải" : "Đang chờ"}</p>
                      <p>{exercise.content || "Không có nội dung"}</p>
                      <p>Đăng bởi: {exercise.author?.username || "Ẩn danh"}</p>
                      <div className="post-actions">
                        <button onClick={() => handleLike(exercise._id)}>
                          <i className="fa-solid fa-heart"></i> {exercise.likes?.length || 0}
                        </button>
                        <button onClick={() => handleBookmark(exercise)}>
                          <i className={`fa-solid fa-bookmark ${bookmarks.some((b) => b._id === exercise._id) ? "bookmarked" : ""}`}></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không tìm thấy bài tập nào.</p>
                )}
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Trang trước
                  </button>
                  <span>Trang {page}</span>
                  <button
                    disabled={filteredExercises.length < postsPerPage}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            </div>
            <div className="exercise-right">
              {selectedExercise ? (
                <div className="solution-box">
                  <h3>Chi tiết bài tìm được</h3>
                  <h4>{selectedExercise.title || "Không có tiêu đề"}</h4>
                  <p><strong>Nội dung:</strong> {selectedExercise.content || "Không có nội dung"}</p>
                  <p><strong>Đăng bởi:</strong> {selectedExercise.author?.username || "Ẩn danh"}</p>
                  {selectedExercise.attachments?.length > 0 && (
                    <img src={selectedExercise.attachments[0]} alt="Attachment" className="post-image" />
                  )}
                  {selectedExercise.comments?.length > 0 && (
                    <div className="comments-section">
                      {selectedExercise.comments.map((comment, index) => (
                        <div key={index} className="comment-item">
                          <span className="comment-author">{comment.user?.username || "Ẩn danh"}:</span>
                          <span className="comment-content">{comment.content}</span>
                          <span className="comment-time">
                            {Math.floor((Date.now() - new Date(comment.createdAt)) / (1000 * 60 * 60))} giờ trước
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="comment-form">
                    <input
                      type="text"
                      placeholder="Viết bình luận..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleComment(selectedExercise._id)}
                    />
                    <button onClick={() => handleComment(selectedExercise._id)}>Gửi</button>
                  </div>
                </div>
              ) : (
                <p>Chọn một bài tập để xem chi tiết.</p>
              )}
            </div>
          </div>
        )}
        {activeTab === "study" && (
          <div className="study-tab">
            <div className="study-left">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Thanh tìm kiếm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  className="search-btn"
                  data-tooltip-id="keyword-search"
                  data-tooltip-content="Tìm kiếm bằng từ khóa"
                  onClick={handleSearch}
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
                <label htmlFor="image-search-upload" className="image-search-btn">
                  <i className="fa-solid fa-camera" data-tooltip-id="image-search" data-tooltip-content="Tìm kiếm bằng hình ảnh"></i>
                </label>
                <input
                  id="image-search-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSearchUpload}
                  style={{ display: "none" }}
                />
                <button
                  className="ai-search-btn"
                  data-tooltip-id="ai-search"
                  data-tooltip-content="Tìm kiếm bằng AI"
                  onClick={() => handleAISearch(false)}
                >
                  <i className="fa-solid fa-robot"></i>
                </button>
                {imageSearchFile && (
                  <button
                    className="ai-image-search-btn"
                    data-tooltip-id="ai-image-search"
                    data-tooltip-content="Tìm kiếm bằng AI qua hình ảnh"
                    onClick={() => handleAISearch(true)}
                  >
                    <i className="fa-solid fa-robot"></i>
                    <i className="fa-solid fa-image"></i>
                  </button>
                )}
                <Tooltip id="keyword-search" place="top" style={{ zIndex: 1000 }} />
                <Tooltip id="image-search" place="top" style={{ zIndex: 1000 }} />
                <Tooltip id="ai-search" place="top" style={{ zIndex: 1000 }} />
                <Tooltip id="ai-image-search" place="top" style={{ zIndex: 1000 }} />
              </div>
              <div className="search-results">
                <h3>Kết quả tìm kiếm</h3>
                {filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((result) => (
                    <div
                      key={result._id}
                      className={`exercise-item ${selectedExercise?._id === result._id ? "selected" : ""}`}
                      onClick={() => handleSelectExercise(result)}
                    >
                      <h4>{result.title || "Không có tiêu đề"}</h4>
                      <p>{result.content || "Không có nội dung"}</p>
                      <p>Đăng bởi: {result.author?.username || "Ẩn danh"}</p>
                    </div>
                  ))
                ) : (
                  <p>Không tìm thấy kết quả nào.</p>
                )}
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Trang trước
                  </button>
                  <span>Trang {page}</span>
                  <button
                    disabled={filteredSearchResults.length < postsPerPage}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            </div>
            <div className="study-right">
              {aiLoading ? (
                <div className="loading-spinner">Đang tìm kiếm bằng AI...</div>
              ) : aiSearchResult ? (
                <div className="solution-box">
                  <h3>Lời giải AI</h3>
                  <p>{aiSearchResult.content}</p>
                  {aiSearchResult.steps.length > 0 && (
                    <ul>
                      {aiSearchResult.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : selectedExercise ? (
                <div className="solution-box">
                  <h3>Chi tiết bài tìm được</h3>
                  <h4>{selectedExercise.title || "Không có tiêu đề"}</h4>
                  <p><strong>Nội dung:</strong> {selectedExercise.content || "Không có nội dung"}</p>
                  <p><strong>Đăng bởi:</strong> {selectedExercise.author?.username || "Ẩn danh"}</p>
                  {selectedExercise.attachments?.length > 0 && (
                    <img src={selectedExercise.attachments[0]} alt="Attachment" className="post-image" />
                  )}
                </div>
              ) : (
                <p>Chọn một kết quả tìm kiếm hoặc tìm kiếm bằng AI để xem chi tiết.</p>
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
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="new-post">
              <textarea
                placeholder="Chia sẻ suy nghĩ của bạn..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <div className="post-actions">
                <label htmlFor="file-upload-share">
                  <i className="fa-solid fa-paperclip"></i>
                </label>
                <input
                  id="file-upload-share"
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
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <div key={post._id} className="post-item">
                    <div className="post-header">
                      <img src={post.author?.avatar || "/default-avatar.png"} alt="Avatar" className="post-avatar" />
                      <div>
                        <span className="post-author">{post.author?.username || "Ẩn danh"}</span>
                        <span className="post-time">
                          {Math.floor((Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60))} giờ trước
                        </span>
                      </div>
                    </div>
                    <p>{post.content || "Không có nội dung"}</p>
                    {post.attachments?.length > 0 && (
                      <img src={post.attachments[0]} alt="Post attachment" className="post-image" />
                    )}
                    <div className="post-actions">
                      <button onClick={() => handleLike(post._id)}>
                        <i className="fa-solid fa-heart"></i> {post.likes?.length || 0}
                      </button>
                      <button onClick={() => handleComment(post._id)}>
                        <i className="fa-solid fa-comment"></i> {post.comments?.length || 0}
                      </button>
                      <button onClick={() => handleShare(post._id)}>
                        <i className="fa-solid fa-share"></i> {post.shares || 0}
                      </button>
                      <button onClick={() => handleBookmark(post)}>
                        <i className={`fa-solid fa-bookmark ${bookmarks.some((b) => b._id === post._id) ? "bookmarked" : ""}`}></i>
                      </button>
                    </div>
                    {post.comments?.length > 0 && (
                      <div className="comments-section">
                        {post.comments.map((comment, index) => (
                          <div key={index} className="comment-item">
                            <span className="comment-author">{comment.user?.username || "Ẩn danh"}:</span>
                            <span className="comment-content">{comment.content}</span>
                            <span className="comment-time">
                              {Math.floor((Date.now() - new Date(comment.createdAt)) / (1000 * 60 * 60))} giờ trước
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="comment-form">
                      <input
                        type="text"
                        placeholder="Viết bình luận..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleComment(post._id)}
                      />
                      <button onClick={() => handleComment(post._id)}>Gửi</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Chưa có bài đăng nào.</p>
              )}
              <div className="pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Trang trước
                </button>
                <span>Trang {page}</span>
                <button
                  disabled={filteredPosts.length < postsPerPage}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Trang sau
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "bookmarks" && (
          <div className="bookmarks-tab">
            <h3>Bookmarks</h3>
            {bookmarks.length > 0 ? (
              bookmarks.map((item) => (
                <div key={item._id} className="bookmark-item">
                  <h4>{item.title || "Không có tiêu đề"}</h4>
                  <p>{item.content || "Không có nội dung"}</p>
                  <p>Đăng bởi: {item.author?.username || "Ẩn danh"}</p>
                  <button onClick={() => handleBookmark(item)}>Xóa bookmark</button>
                </div>
              ))
            ) : (
              <p>Chưa có bài nào được bookmark.</p>
            )}
          </div>
        )}
        {activeTab === "notifications" && (
          <div className="notifications-tab">
            <h3>Thông báo</h3>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <p>{notification.message}</p>
                  <span>{notification.date}</span>
                </div>
              ))
            ) : (
              <p>Chưa có thông báo nào.</p>
            )}
          </div>
        )}
      </div>
      {activeTab === "share" && (
        <div className="sidebar-right">
          <div className="who-to-follow">
            <h3>Gợi ý theo dõi</h3>
            {whoToFollow.length > 0 ? (
              whoToFollow.map((person) => (
                <div key={person._id} className="follow-item">
                  <img src={person.avatar || "/default-avatar.png"} alt="Avatar" className="follow-avatar" />
                  <div>
                    <span className="follow-name">{person.username || "Ẩn danh"}</span>
                    <span className="follow-bio">{person.bio || "Không có mô tả"}</span>
                  </div>
                  <button
                    onClick={() =>
                      person.isFollowing
                        ? handleUnfollow(person._id)
                        : handleFollow(person._id)
                    }
                  >
                    {person.isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
                  </button>
                </div>
              ))
            ) : (
              <p>Không có gợi ý nào.</p>
            )}
          </div>
          <div className="trending-topics">
            <h3>Chủ đề nổi bật</h3>
            {trendingTopics.length > 0 ? (
              trendingTopics.map((topic, index) => (
                <div key={index} className="topic-item">
                  #{topic}
                </div>
              ))
            ) : (
              <p>Không có chủ đề nào.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyCorner;