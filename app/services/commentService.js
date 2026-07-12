import Comment from "../models/Comment.js";
import Reply from "../models/Reply.js";
import ApiError from "../../utils/ApiError.js";

class CommentService {
    async toggleLikeComment(commentId, userId) {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found.");
        }

        const likeIndex = comment.likes.indexOf(userId);

        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1);
        } else {
            comment.likes.push(userId);
        }

        await comment.save();
        return await comment
            .populate("author", "firstName lastName avatar")
            .populate("likes", "firstName lastName avatar");
    }

    async addReply(commentId, userId, text) {
        if (!text) {
            throw new ApiError(400, "Reply text is required.");
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found.");
        }

        const reply = await Reply.create({
            comment: commentId,
            author: userId,
            text,
        });

        return await reply.populate("author", "firstName lastName avatar");
    }
}

export default new CommentService();
