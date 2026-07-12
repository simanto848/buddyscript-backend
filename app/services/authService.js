import bcrypt from "bcrypt";
import User from "../models/User.js";
import ApiError from "../../utils/ApiError.js";
import generateToken from "../../utils/generateToken.js";

class AuthService {
    async register (payload) {
        const { firstName, lastName, email, password } = payload;
        if (!firstName || !lastName || !email || !password) {
            throw new ApiError(400, "All fields are required.");
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new ApiError(409, "Email already exists.")
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        const token = generateToken(user._id);
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        return { token, user: userWithoutPassword };
    };

    async login (payload) {
        const { email, password } = payload;
        if (!email || !password) {
            throw new ApiError(400, "Email and password are required.");
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
        if (!user) {
            throw new ApiError(401, "Invalid email or password.");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new ApiError(401, "Invalid email or password.");
        }

        const token = generateToken(user._id);
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return { token, user: userWithoutPassword };
    };
};

export default new AuthService();