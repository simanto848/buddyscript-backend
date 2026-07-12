import ApiResponse from "../../utils/ApiResponse.js";
import AuthService from "../services/authService.js";

class AuthController {
    async register (req, res, next) {
        try {
            const data = await AuthService.register(req.body);
            const response = new ApiResponse(201, "Registration successful.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    };

    async login (req, res, next) {
        try {
            const data = await AuthService.login(req.body);
            const response = new ApiResponse(200, "Login successful.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    };

    async getMe (req, res, next) {
        try {
            const response = new ApiResponse(200, "User profile retrieved successfully.", { user: req.user });
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    };
}

export default new AuthController();