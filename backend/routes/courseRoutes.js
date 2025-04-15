const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const authenticateToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// console.log("courseController.getAllCourses:", typeof courseController.getAllCourses);
// console.log("courseController.getCourseById:", typeof courseController.getCourseById);
// console.log("courseController.createCourse:", typeof courseController.createCourse);
// console.log("courseController.updateCourse:", typeof courseController.updateCourse);
// console.log("courseController.deleteCourse:", typeof courseController.deleteCourse);

router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById); // Sửa ở đây
router.post(
  "/create",
  authenticateToken,
  checkRole(["admin", "teacher"]),
  courseController.createCourse
);
router.put(
  "/update/:id",
  authenticateToken,
  checkRole(["admin", "teacher"]),
  courseController.updateCourse
);
router.delete(
  "/:id",
  authenticateToken,
  checkRole(["admin", "teacher"]),
  courseController.deleteCourse
);

module.exports = router;