import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        text: {
            type: String,
            trim: true,
            maxlength: 5000,
        },

        image: {
            type: String,
            default: null,
        },

        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        sharedFrom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: null,
        },

        shares: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ visibility: 1 });

export default mongoose.model("Post", postSchema);