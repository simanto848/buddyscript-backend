import CommentService from "../services/commentService.js";
import ApiResponse from "../../utils/ApiResponse.js";

class CommentController {
    async toggleLikeComment(req, res, next) {
        try {
            const data = await CommentService.toggleLikeComment(req.params.id, req.user._id);
            const response = new ApiResponse(200, "Comment like updated.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    async addReply(req, res, next) {
        try {
            const data = await CommentService.addReply(req.params.id, req.user._id, req.body.text);
            const response = new ApiResponse(201, "Reply added successfully.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new CommentController();
