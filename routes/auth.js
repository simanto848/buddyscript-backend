import express from "express";
import authController from "../app/controllers/authController.js";
import authMiddleware from "../app/middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getMe);

export default router;
