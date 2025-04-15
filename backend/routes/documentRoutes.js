// routes/documentRoutes.js
const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const authenticateToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.get("/", documentController.getAllDocuments);
router.get("/:id", documentController.getDocumentById);
router.post(
  "/create",
  authenticateToken,
  checkRole(["admin"]), 
  documentController.createDocument
);

router.put(
  "/update/:id",
  authenticateToken,
  checkRole(["admin"]), 
  documentController.updateDocument
);

router.delete(
  "/:id",
  authenticateToken,
  checkRole(["admin"]), 
  documentController.deleteDocument
);

module.exports = router;