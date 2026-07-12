import express from "express";
import authRouter from "./auth.js";
import postRouter from "./posts.js";
import commentRouter from "./comments.js";
import replyRouter from "./replies.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/posts", postRouter);
router.use("/comments", commentRouter);
router.use("/replies", replyRouter);

export default router;
