import PostService from "../services/postService.js";
import ApiResponse from "../../utils/ApiResponse.js";

class PostController {
    async createPost(req, res, next) {
        try {
            const data = await PostService.createPost(req.body, req.file, req.user._id);
            const response = new ApiResponse(201, "Post created successfully.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getPosts(req, res, next) {
        try {
            const data = await PostService.getPosts(req.user._id);
            const response = new ApiResponse(200, "Posts retrieved successfully.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    async toggleLikePost(req, res, next) {
        try {
            const data = await PostService.toggleLikePost(req.params.id, req.user._id);
            const response = new ApiResponse(200, "Post like updated.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    async addComment(req, res, next) {
        try {
            const data = await PostService.addComment(req.params.id, req.user._id, req.body.text);
            const response = new ApiResponse(201, "Comment added successfully.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getComments(req, res, next) {
        try {
            const data = await PostService.getComments(req.params.id);
            const response = new ApiResponse(200, "Comments retrieved successfully.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getPostById(req, res, next) {
        try {
            const data = await PostService.getPostById(req.params.id, req.user._id);
            const response = new ApiResponse(200, "Post retrieved successfully.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    async updatePost(req, res, next) {
        try {
            const data = await PostService.updatePost(req.params.id, req.body, req.file, req.user._id);
            const response = new ApiResponse(200, "Post updated successfully.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    async deletePost(req, res, next) {
        try {
            const data = await PostService.deletePost(req.params.id, req.user._id);
            const response = new ApiResponse(200, "Post deleted successfully.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new PostController();
