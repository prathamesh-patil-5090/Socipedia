import mongoose from "mongoose";
import Post from "../models/Post.js";
import dotenv from "dotenv";

dotenv.config();

const fixComments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts`);

    for (const post of posts) {
      let updated = false;
      
      // Map over existing comments and add _id if missing
      post.comments = post.comments.map(comment => {
        if (!comment._id) {
          updated = true;
          return {
            ...comment.toObject(), // Convert to plain object if it's a Mongoose document
            _id: new mongoose.Types.ObjectId(),
          };
        }
        return comment;
      });

      if (updated) {
        console.log(`Updating comments for post ${post._id}`);
        // Use findByIdAndUpdate to ensure proper update
        await Post.findByIdAndUpdate(post._id, { 
          $set: { comments: post.comments }
        }, { new: true });
        console.log(`Updated post ${post._id}`);
      }
    }

    console.log("Finished updating comments");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixComments();
