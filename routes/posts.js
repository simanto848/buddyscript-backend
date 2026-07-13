import express from "express";
import postController from "../app/controllers/postController.js";
import authMiddleware from "../app/middlewares/authMiddleware.js";
import { upload } from "../app/middlewares/uploadMiddleware.js";

const router = express.Router();

// Apply authMiddleware globally to post routes
router.use(authMiddleware);

router.post("/", upload.single("image"), postController.createPost);
router.get("/", postController.getPosts);
router.get("/:id", postController.getPostById);
router.put("/:id", upload.single("image"), postController.updatePost);
router.delete("/:id", postController.deletePost);
router.post("/:id/like", postController.toggleLikePost);
router.post("/:id/comments", postController.addComment);
router.get("/:id/comments", postController.getComments);
router.post("/:id/share", postController.sharePost);

export default router;
