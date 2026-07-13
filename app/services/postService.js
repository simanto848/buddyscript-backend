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
        return await post.populate([
            { path: "author", select: "firstName lastName avatar" },
            { path: "likes", select: "firstName lastName avatar" }
        ]);
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

    async getPostById(postId, userId) {
        const post = await Post.findById(postId)
            .populate("author", "firstName lastName avatar")
            .populate("likes", "firstName lastName avatar");

        if (!post) {
            throw new ApiError(404, "Post not found.");
        }

        if (post.visibility === "private" && post.author._id.toString() !== userId.toString()) {
            throw new ApiError(403, "Access denied. This post is private.");
        }

        return post;
    }

    async updatePost(postId, payload, file, userId) {
        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError(404, "Post not found.");
        }

        if (post.author.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to update this post.");
        }

        const { text, visibility } = payload;
        if (text !== undefined) post.text = text;
        if (visibility !== undefined) post.visibility = visibility;

        if (file) {
            post.image = await uploadToCloudinary(file.buffer);
        }

        if (!post.text && !post.image) {
            throw new ApiError(400, "Post must contain text or an image.");
        }

        await post.save();
        return await post.populate("author", "firstName lastName avatar");
    }

    async deletePost(postId, userId) {
        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError(404, "Post not found.");
        }

        if (post.author.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to delete this post.");
        }

        const comments = await Comment.find({ post: postId });
        const commentIds = comments.map(c => c._id);

        await Reply.deleteMany({ comment: { $in: commentIds } });
        await Comment.deleteMany({ post: postId });
        await Post.findByIdAndDelete(postId);

        return { message: "Post and its comments/replies deleted successfully." };
    }
}

export default new PostService();
