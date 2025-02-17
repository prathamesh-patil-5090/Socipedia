import Post from "../models/Post.js";
import User from "../models/User.js";
import mongoose from "mongoose";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();

    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName picturePath location occupation')
      .exec();

    // Transform posts to include user details
    const formattedPosts = posts.map(post => ({
      ...post._doc,
      firstName: post.userId?.firstName || '',
      lastName: post.userId?.lastName || '',
      userPicturePath: post.userId?.picturePath || '',
      location: post.userId?.location || '',
      occupation: post.userId?.occupation || ''
    }));

    res.status(200).json(formattedPosts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, firstName, lastName, userPicturePath, comment } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Create new comment with explicit _id
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
    res.status(500).json({ message: err.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, userId } = req.body;

    console.log("Update post request:", {
      postId: id,
      requestUserId: userId,
      description
    });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Convert IDs to strings for comparison
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.description = description;
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId; // Change this line to get userId from body

    console.log("Attempting to delete post:", { postId: id, userId });

    const post = await Post.findById(id);
    if (!post) {
      console.log("Post not found:", id);
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Convert IDs to strings for comparison
    if (post.userId.toString() !== userId.toString()) {
      console.log("Unauthorized delete attempt:", {
        postUserId: post.userId,
        requestUserId: userId
      });
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);
    
    // Return all posts after deletion
    const posts = await Post.find().sort({ createdAt: -1 });
    console.log("Post deleted successfully, returning updated posts list");
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id; // From auth middleware

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Find comment index
    const commentIndex = post.comments.findIndex(c => 
      c._id && c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      console.log("Comment not found:", { commentId, availableComments: post.comments });
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update the comment
    post.comments[commentIndex].comment = comment;
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    console.error("Update comment error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.id; // From auth middleware

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const commentToDelete = post.comments.id(commentId);
    if (!commentToDelete) return res.status(404).json({ message: "Comment not found" });

    if (commentToDelete.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    post.comments.pull(commentId);
    const updatedPost = await post.save();
    
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePostPicture = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const picturePath = req.file?.filename;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.picturePath = picturePath;
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePostPicture = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.picturePath = "";
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
