import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography, useTheme, InputBase, Button } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, setPosts } from "state";
import CommentCard from "components/CommentCard";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;
  const posts = useSelector((state) => state.posts);

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const addComment = async () => {
    try {
      if (!comment.trim()) {
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}/comment`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: loggedInUserId,
          comment: comment.trim()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost })); // Ensure updatedPost includes correct comment IDs
      setComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      // Optionally add error handling UI feedback here
    }
  };

  const handleDeletePost = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedPosts = await response.json();
      dispatch(setPosts({ posts: updatedPosts }));
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          description: editedDescription,
          userId: loggedInUserId // Add this
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  const handleUpdateComment = async (commentId, newText) => {
    console.log(`Updating comment. postId: ${postId}, commentId: ${commentId}`); // Add this
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: newText }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <FlexBetween>
        <Friend
          friendId={postUserId}
          name={name}
          subtitle={location}
          userPicturePath={userPicturePath}
        />
        {loggedInUserId === postUserId && (
          <FlexBetween gap="1rem">
            <IconButton onClick={() => setIsEditing(!isEditing)}>
              <EditOutlined />
            </IconButton>
            <IconButton onClick={handleDeletePost}>
              <DeleteOutlined />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>

      {isEditing ? (
        <Box>
          <InputBase
            fullWidth
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            sx={{
              backgroundColor: palette.neutral.light,
              borderRadius: "2rem",
              padding: "1rem 2rem",
              marginTop: "1rem",
            }}
          />
          <Button onClick={handleUpdatePost}>Save</Button>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </Box>
      ) : (
        <Typography color={main} sx={{ mt: "1rem" }}>
          {description}
        </Typography>
      )}
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`${process.env.REACT_APP_API_URL}/assets/${picturePath}`}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          <InputBase
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              width: "100%",
              backgroundColor: palette.neutral.light,
              borderRadius: "2rem",
              padding: "0.5rem 2rem",
              marginBottom: "1rem"
            }}
          />
          <Button
            disabled={!comment}
            onClick={addComment}
            sx={{
              color: palette.background.alt,
              backgroundColor: palette.primary.main,
              borderRadius: "3rem",
              marginBottom: "1rem"
            }}
          >
            Post Comment
          </Button>
          {comments.map((comment) => (
            <Box key={comment._id}>
              <Divider />
              <CommentCard 
                comment={comment}
                postId={postId}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            </Box>
          ))}
          <Divider />
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
