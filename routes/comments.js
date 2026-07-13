import express from "express";
import commentController from "../app/controllers/commentController.js";
import authMiddleware from "../app/middlewares/authMiddleware.js";

const router = express.Router();

// Apply authMiddleware globally to comment routes
router.use(authMiddleware);

router.post("/:id/like", commentController.toggleLikeComment);
router.post("/:id/replies", commentController.addReply);
router.delete("/:id", commentController.deleteComment);

export default router;
