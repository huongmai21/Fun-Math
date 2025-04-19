const Course = require("../models/Course");

// Lấy tất cả các khóa học
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses", error: err.message });
  }
};

// Lấy khóa học theo ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: "Error fetching course", error: err.message });
  }
};

// Tạo khóa học mới
exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Tiêu đề khóa học là bắt buộc!" });
    }

    // Kiểm tra xem khóa học đã tồn tại chưa
    const existingCourse = await Course.findOne({ title });
    if (existingCourse) {
      return res.status(400).json({ message: `Khóa học "${title}" đã tồn tại!` });
    }

    const course = new Course({
      title,
      description,
      enrolledUsers: [],
    });

    await course.save();
    console.log(`Created new course: ${title}, _id: ${course._id}`);
    res.status(201).json(course);
  } catch (err) {
    console.error("Error in createCourse:", {
      message: err.message,
      stack: err.stack,
      body: req.body,
    });
    res.status(500).json({
      message: "Không thể tạo khóa học",
      error: err.message,
    });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.body;

    if (!userId) {
      console.error("No userId found in request");
      return res.status(401).json({ message: "Không tìm thấy thông tin người dùng!" });
    }

    if (!courseId) {
      return res.status(400).json({ message: "ID khóa học là bắt buộc!" });
    }

    // Tìm khóa học duy nhất bằng courseId
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Khóa học không tồn tại!" });
    }

    // Kiểm tra xem người dùng đã đăng ký chưa
    if (course.enrolledUsers.includes(userId)) {
      return res.status(400).json({ message: "Bạn đã đăng ký khóa học này rồi!" });
    }

    // Thêm userId vào enrolledUsers
    course.enrolledUsers.push(userId);
    await course.save();

    console.log(`User ${userId} enrolled in course ${courseId}`);
    res.status(200).json({ message: "Đăng ký khóa học thành công!", course });
  } catch (err) {
    console.error("Error in enrollCourse:", {
      message: err.message,
      stack: err.stack,
      userId,
      courseId,
    });
    res.status(500).json({
      message: "Không thể đăng ký khóa học",
      error: err.message,
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      console.error("No userId found in request");
      return res.status(401).json({ message: "Không tìm thấy thông tin người dùng!" });
    }

    console.log(`Fetching enrolled courses for userId: ${userId}, page: ${page}, limit: ${limit}`);

    const courses = await Course.find({ enrolledUsers: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Course.countDocuments({ enrolledUsers: userId });

    console.log(`Found ${courses.length} courses, total: ${total}`);

    res.status(200).json({ data: courses, total });
  } catch (err) {
    console.error("Error in getEnrolledCourses:", {
      message: err.message,
      stack: err.stack,
      userId: req.user?.id,
      query: req.query,
    });
    res.status(500).json({
      message: "Không thể tải danh sách khóa học",
      error: err.message,
    });
  }
};