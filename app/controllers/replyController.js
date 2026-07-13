import ReplyService from "../services/replyService.js";
import ApiResponse from "../../utils/ApiResponse.js";

class ReplyController {
    async toggleLikeReply(req, res, next) {
        try {
            const data = await ReplyService.toggleLikeReply(req.params.id, req.user._id);
            const response = new ApiResponse(200, "Reply like updated.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    async deleteReply(req, res, next) {
        try {
            const data = await ReplyService.deleteReply(req.params.id, req.user._id);
            const response = new ApiResponse(200, "Reply deleted successfully.", data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new ReplyController();
