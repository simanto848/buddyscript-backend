import jwt from "jsonwebtoken";
import ApiError from "../../utils/ApiError.js";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    try {
        let token = null;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return next(new ApiError(401, "Unauthorized. Please login."));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return next(new ApiError(401, "User no longer exists."));
        }

        req.user = user;
        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return next(new ApiError(401, "Invalid or expired token."));
        }

        next(error);
    }
};

export default authMiddleware;