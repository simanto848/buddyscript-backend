import express from "express";
import replyController from "../app/controllers/replyController.js";
import authMiddleware from "../app/middlewares/authMiddleware.js";

const router = express.Router();

// Apply authMiddleware globally to reply routes
router.use(authMiddleware);

router.post("/:id/like", replyController.toggleLikeReply);
router.delete("/:id", replyController.deleteReply);

export default router;
