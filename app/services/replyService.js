import Reply from "../models/Reply.js";
import ApiError from "../../utils/ApiError.js";

class ReplyService {
    async toggleLikeReply(replyId, userId) {
        const reply = await Reply.findById(replyId);
        if (!reply) {
            throw new ApiError(404, "Reply not found.");
        }

        const likeIndex = reply.likes.indexOf(userId);

        if (likeIndex > -1) {
            reply.likes.splice(likeIndex, 1);
        } else {
            reply.likes.push(userId);
        }

        await reply.save();
        return await reply
            .populate("author", "firstName lastName avatar")
            .populate("likes", "firstName lastName avatar");
    }
}

export default new ReplyService();
