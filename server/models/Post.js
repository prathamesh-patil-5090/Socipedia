import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  userPicturePath: String,
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to ensure all comments have _id
commentSchema.pre('save', function(next) {
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId();
  }
  next();
});

const postSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    location: String,
    description: String,
    picturePath: String,
    userPicturePath: String,
    likes: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    comments: [commentSchema],  // Use the comment schema here
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
