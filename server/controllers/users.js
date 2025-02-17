import User from "../models/User.js";
import mongoose from "mongoose";
import { users, posts } from "../data/index.js";
import Post from "../models/Post.js";
/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure friends is an array
    if (!Array.isArray(user.friends)) {
      user.friends = [];
      await user.save();
    }

    const friends = await User.find({
      '_id': { $in: user.friends }
    }).select('firstName lastName occupation location picturePath');

    res.status(200).json(friends);
  } catch (err) {
    console.error("Error getting friends:", err);
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id: userId, friendId } = req.params;
    console.log("Attempting friend operation:", { userId, friendId });

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId)
    ]);

    // Check if both users exist
    if (!user || !friend) {
      console.log("User or friend not found:", { user, friend });
      return res.status(404).json({ message: "User or friend not found" });
    }

    // Ensure friends arrays exist
    user.friends = Array.isArray(user.friends) ? user.friends : [];
    friend.friends = Array.isArray(friend.friends) ? friend.friends : [];

    const friendIdStr = friendId.toString();
    const userIdStr = userId.toString();

    // Check if they are already friends
    const areFriends = user.friends.some(fid => fid.toString() === friendIdStr);

    if (areFriends) {
      // Remove from both users' friend lists
      user.friends = user.friends.filter(id => id.toString() !== friendIdStr);
      friend.friends = friend.friends.filter(id => id.toString() !== userIdStr);
      console.log("Removing friend relationship");
    } else {
      // Add to both users' friend lists
      user.friends.push(friendId);
      friend.friends.push(userId);
      console.log("Adding friend relationship");
    }

    // Save both users
    await Promise.all([user.save(), friend.save()]);

    // Get updated friend list with details
    const updatedFriends = await User.find(
      { _id: { $in: user.friends }},
      'firstName lastName occupation location picturePath _id'
    );

    console.log("Returning updated friends list:", updatedFriends.length);
    res.status(200).json(updatedFriends);
  } catch (err) {
    console.error("Friend operation error:", err);
    res.status(500).json({ 
      message: "Failed to update friend relationship",
      error: err.message
    });
  }
};

export const popUser = async (req, res) => {
  try {
    users.forEach(async (user) => {
      const newUser = new User(user);
      await newUser.save();
    });

    res.status(200).json({ message: "Users added" });
  }
  catch (err) {
    res.status(404).json({ message: err.message });
  }
}

export const popPosts = async (req, res) => {
  try {
    posts.forEach(async (post) => {
      const newPost = new Post(post);
      await newPost.save();
    });

    res.status(200).json({ message: "Posts added" });
  }
  catch (err) {
    res.status(404).json({ message: err.message });
  }
}

export const fixUserFriends = async (req, res) => {
  try {
    const users = await User.find({});
    
    const updates = users.map(async (user) => {
      if (!Array.isArray(user.friends)) {
        user.friends = [];
        return user.save();
      }
      return Promise.resolve();
    });

    await Promise.all(updates);
    res.status(200).json({ message: "Fixed friends arrays for all users" });
  } catch (err) {
    console.error("Error fixing friend arrays:", err);
    res.status(500).json({ message: err.message });
  }
};
