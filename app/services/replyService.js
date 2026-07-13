import Reply from "../models/Reply.js";
import Comment from "../models/Comment.js";
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
        return await reply.populate([
            { path: "author", select: "firstName lastName avatar" },
            { path: "likes", select: "firstName lastName avatar" }
        ]);
    }

    async deleteReply(replyId, userId) {
        const reply = await Reply.findById(replyId).populate({
            path: "comment",
            populate: { path: "post" }
        });
        if (!reply) {
            throw new ApiError(404, "Reply not found.");
        }

        if (reply.author.toString() !== userId.toString() &&
            reply.comment.author.toString() !== userId.toString() &&
            reply.comment.post.author.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to delete this reply.");
        }

        await Reply.findByIdAndDelete(replyId);
        return { message: "Reply deleted successfully." };
    }
}

export default new ReplyService();
