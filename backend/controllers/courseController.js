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
    const newCourse = new Course(req.body);
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (err) {
    res.status(500).json({ message: "Error creating course", error: err.message });
  }
};

// Cập nhật khóa học
exports.updateCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: "Error updating course", error: err.message });
  }
};

// Xóa khóa học
exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting course", error: err.message });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id; // Giả sử middleware auth đã thêm user
    const { page = 1, limit = 10 } = req.query;
    const courses = await Course.find({ enrolledUsers: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Course.countDocuments({ enrolledUsers: userId });

    res.status(200).json({ data: courses, total });
  } catch (err) {
    console.error('Error in getEnrolledCourses:', err); // Thêm log để debug
    res.status(500).json({ message: 'Không thể tải danh sách khóa học', error: err.message });
  }
};