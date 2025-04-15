const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const authenticateToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.get("/list", newsController.getAllNews);
router.get("/new/:id", newsController.getNewsById);
router.post(
  "/create",
  authenticateToken,
  checkRole(["admin"]),
  newsController.createNews
);
router.put(
  "/update/:id",
  authenticateToken,
  checkRole(["admin"]),
  newsController.updateNews
);
router.delete(
  "/:id",
  authenticateToken,
  checkRole(["admin"]),
  newsController.deleteNews
);

module.exports = router;