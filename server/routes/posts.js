import express from "express";
import multer from "multer";
import path from "path";
import { getFeedPosts, getUserPosts, likePost, addComment, updateComment, deleteComment, updatePost, deletePost, updatePostPicture, deletePostPicture } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import Post from "../models/Post.js";
import mongoose from "mongoose";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

/* READ */
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all posts"); // Debug log
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "firstName lastName picturePath location occupation")
      .exec();
      
    console.log(`Found ${posts.length} posts`); // Debug log
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Error fetching posts", error: err.message });
  }
});

// Protected routes
router.use(verifyToken);

router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);
router.patch("/:id/comment", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, firstName, lastName, userPicturePath, comment } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      userId,
      firstName,
      lastName,
      userPicturePath,
      comment,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: err.message });
  }
});
router.patch("/:id/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { comment } = req.body;
    const userId = req.body.userId; // Get from request body instead of token

    console.log("Updating comment:", { id, commentId, comment, userId });

    const post = await Post.findById(id);
    if (!post) {
      console.log("Post not found:", id);
      return res.status(404).json({ message: "Post not found" });
    }

    // Find comment by string comparison of _id
    const commentToUpdate = post.comments.find(
      c => c._id.toString() === commentId
    );

    if (!commentToUpdate) {
      console.log("Comment not found:", commentId);
      return res.status(404).json({ message: "Comment not found" });
    }

    if (commentToUpdate.userId !== userId) {
      console.log("Unauthorized:", { commentUserId: commentToUpdate.userId, requestUserId: userId });
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    commentToUpdate.comment = comment;
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    console.error("Update comment error:", err);
    res.status(500).json({ message: err.message });
  }
});
router.delete("/:id/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const commentToDelete = post.comments.find(c => c._id.toString() === commentId);
    if (!commentToDelete) return res.status(404).json({ message: "Comment not found" });

    if (commentToDelete.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: err.message });
  }
});
router.patch("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.patch("/:id/picture", upload.single("picture"), verifyToken, updatePostPicture);
router.delete("/:id/picture", verifyToken, deletePostPicture);

export default router;
