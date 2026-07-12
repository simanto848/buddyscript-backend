import express from "express";
import postController from "../app/controllers/postController.js";
import authMiddleware from "../app/middlewares/authMiddleware.js";
import { upload } from "../app/middlewares/uploadMiddleware.js";

const router = express.Router();

// Apply authMiddleware globally to post routes
router.use(authMiddleware);

router.post("/", upload.single("image"), postController.createPost);
router.get("/", postController.getPosts);
router.post("/:id/like", postController.toggleLikePost);
router.post("/:id/comments", postController.addComment);
router.get("/:id/comments", postController.getComments);

export default router;
