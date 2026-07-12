import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Reply from "../models/Reply.js";
import ApiError from "../../utils/ApiError.js";
import { uploadToCloudinary } from "../../utils/cloudinaryHelper.js";

class PostService {
    async createPost(payload, file, authorId) {
        const { text, visibility } = payload;
        let imageUrl = null;

        if (file) {
            imageUrl = await uploadToCloudinary(file.buffer);
        }

        if (!text && !imageUrl) {
            throw new ApiError(400, "Post must contain text or an image.");
        }

        const post = await Post.create({
            author: authorId,
            text,
            image: imageUrl,
            visibility: visibility || "public",
        });

        return await post.populate("author", "firstName lastName avatar");
    }

    async getPosts(authorId) {
        return await Post.find({
            $or: [
                { visibility: "public" },
                { author: authorId }
            ]
        })
        .populate("author", "firstName lastName avatar")
        .populate("likes", "firstName lastName avatar")
        .sort({ createdAt: -1 });
    }

    async toggleLikePost(postId, userId) {
        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError(404, "Post not found.");
        }

        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        return await post
            .populate("author", "firstName lastName avatar")
            .populate("likes", "firstName lastName avatar");
    }

    async addComment(postId, userId, text) {
        if (!text) {
            throw new ApiError(400, "Comment text is required.");
        }

        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError(404, "Post not found.");
        }

        const comment = await Comment.create({
            post: postId,
            author: userId,
            text,
        });

        return await comment.populate("author", "firstName lastName avatar");
    }

    async getComments(postId) {
        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError(404, "Post not found.");
        }

        const comments = await Comment.find({ post: postId })
            .populate("author", "firstName lastName avatar")
            .populate("likes", "firstName lastName avatar")
            .sort({ createdAt: -1 });

        return await Promise.all(comments.map(async (comment) => {
            const replies = await Reply.find({ comment: comment._id })
                .populate("author", "firstName lastName avatar")
                .populate("likes", "firstName lastName avatar")
                .sort({ createdAt: 1 });
            return {
                ...comment.toObject(),
                replies,
            };
        }));
    }
}

export default new PostService();
