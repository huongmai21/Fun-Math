const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const authenticateToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");


router.get("/",  courseController.getAllCourses);
router.get("/courses/enroll", authenticateToken, courseController.enrollCourse);
router.get("/courses/enrolled", authenticateToken, courseController.getEnrolledCourses);
router.get("/:id",authenticateToken, courseController.getCourseById); 
router.post(
  "/create",
  authenticateToken,
  checkRole(["admin", "teacher"]),
  courseController.createCourse
);
// router.put(
//   "/update/:id",
//   authenticateToken,
//   checkRole(["admin", "teacher"]),
//   courseController.updateCourse
// );
// router.delete(
//   "/:id",
//   authenticateToken,
//   checkRole(["admin", "teacher"]),
//   courseController.deleteCourse
// );

module.exports = router;