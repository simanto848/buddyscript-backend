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

    async googleLogin (payloadData) {
        const { idToken, accessToken } = payloadData;
        if (!idToken && !accessToken) {
            throw new ApiError(400, "Google token is required.");
        }

        let payload;
        try {
            if (idToken) {
                const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
                if (!response.ok) {
                    throw new ApiError(401, "Invalid Google ID token.");
                }
                payload = await response.json();

                const clientAudience = payload.aud;
                if (clientAudience !== process.env.GOOGLE_CLIENT_ID) {
                    throw new ApiError(401, "Token audience mismatch. Access denied.");
                }
            } else {
                const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
                if (!response.ok) {
                    throw new ApiError(401, "Invalid Google access token.");
                }
                payload = await response.json();
            }
        } catch (error) {
            throw new ApiError(401, "Failed to verify Google token: " + error.message);
        }

        const email = payload.email.toLowerCase();
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                firstName: payload.given_name || "Google",
                lastName: payload.family_name || "User",
                email,
                avatar: payload.picture,
                password: await bcrypt.hash(Math.random().toString(36) + Math.random().toString(36), 10),
            });
        } else if (!user.avatar && payload.picture) {
            user.avatar = payload.picture;
            await user.save();
        }

        const token = generateToken(user._id);
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return { token, user: userWithoutPassword };
    };
};

export default new AuthService();