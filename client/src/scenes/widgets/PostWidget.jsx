import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  EditOutlined,
  DeleteOutlined,
  ImageNotSupported, // Add ImageNotSupported
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography, useTheme, InputBase, Button } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, setPosts } from "state";
import CommentCard from "components/CommentCard";

const PostWidget = ({
  postId,
  postUserId,
  name,
  ...props
}) => {
  const [isComments, setIsComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(props.description);
  const [newPicture, setNewPicture] = useState(null);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUser = useSelector((state) => state.user) || {};
  const loggedInUserId = loggedInUser?._id;
  const isLiked = Boolean(props.likes[loggedInUserId]);
  const likeCount = Object.keys(props.likes || {}).length;
  const posts = useSelector((state) => state.posts);
  const isDummyUser = loggedInUser?._id === "67b1d55da90d9304b1f869d5";

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const isOwner = useMemo(() => {
    if (!loggedInUserId || !postUserId || isDummyUser) return false;
    return loggedInUserId === postUserId;
  }, [loggedInUserId, postUserId, isDummyUser]);

  const showPostActions = props.isAuth && !isDummyUser && isOwner;

  // Add strict type checking for postUserId comparison
  const isOwnPost = useMemo(() => {
    if (!loggedInUserId || !postUserId) return false;
    return String(loggedInUserId) === String(postUserId);
  }, [loggedInUserId, postUserId]);

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
      if (!comment.trim()) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}/comment`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: loggedInUserId,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          userPicturePath: loggedInUser.picturePath,
          comment: comment.trim(),
          createdAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
      setComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!token || !isOwner) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Add this
          },
          body: JSON.stringify({ userId: loggedInUserId }), // Add userId to body
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete post");
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
    try {
      console.log("Updating comment:", { postId, commentId, newText, userId: loggedInUserId });
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            comment: newText,
            userId: loggedInUserId 
          }),
        }
      );

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Server error:", responseData);
        throw new Error(responseData.message || "Failed to update comment");
      }

      dispatch(setPost({ post: responseData }));
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

  // Add function to handle picture update
  const handleUpdatePicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append("picture", file);
      formData.append("userId", loggedInUserId);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/picture`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update picture");

      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
    } catch (error) {
      console.error("Failed to update picture:", error);
    }
  };

  // Add function to handle picture deletion
  const handleDeletePicture = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/picture`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: loggedInUserId }),
        }
      );

      if (!response.ok) throw new Error("Failed to delete picture");

      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
    } catch (error) {
      console.error("Failed to delete picture:", error);
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <FlexBetween>
        <Friend
          friendId={postUserId}
          name={name}
          subtitle={props.location}
          userPicturePath={props.userPicturePath || null} // Add null fallback
          isAuth={props.isAuth && !isOwnPost} // Prevent friend actions on own posts
        />
        {showPostActions && (
          <FlexBetween gap="1rem">
            <IconButton 
              onClick={() => setIsEditing(!isEditing)}
              sx={{
                '&:hover': {
                  backgroundColor: palette.primary.light,
                  '& .MuiSvgIcon-root': { color: palette.primary.dark }
                }
              }}
            >
              <EditOutlined />
            </IconButton>
            <IconButton 
              onClick={handleDeletePost}
              sx={{
                '&:hover': {
                  backgroundColor: '#ff000022',
                  '& .MuiSvgIcon-root': { color: '#ff0000' }
                }
              }}
            >
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
          {props.description}
        </Typography>
      )}
      {props.picturePath && (
        <Box position="relative">
          <img
            width="100%"
            height="auto"
            alt="post"
            style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
            src={`${process.env.REACT_APP_API_URL}/assets/${props.picturePath}`}
          />
          {isOwner && (
            <Box
              position="absolute"
              top="1rem"
              right="1rem"
              display="flex"
              gap="0.5rem"
              sx={{ backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "1rem", padding: "0.5rem" }}
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id={`picture-upload-${postId}`}
                onChange={(e) => handleUpdatePicture(e.target.files[0])}
              />
              <label htmlFor={`picture-upload-${postId}`}>
                <IconButton
                  component="span"
                  sx={{
                    color: "white",
                    "&:hover": { color: palette.primary.light }
                  }}
                >
                  <EditOutlined />
                </IconButton>
              </label>
              <IconButton
                onClick={handleDeletePicture}
                sx={{
                  color: "white",
                  "&:hover": { color: "#ff4444" }
                }}
              >
                <ImageNotSupported />
              </IconButton>
            </Box>
          )}
        </Box>
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton 
              onClick={patchLike} 
              disabled={!props.isAuth || isDummyUser}
              sx={{ 
                color: (!props.isAuth || isDummyUser) ? "gray" : "inherit",
                cursor: (!props.isAuth || isDummyUser) ? "not-allowed" : "pointer" 
              }}
            >
              {isLiked ? (
                <FavoriteOutlined sx={{ color: props.isAuth ? primary : "gray" }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton 
              onClick={() => setIsComments(!isComments)}
              disabled={!props.isAuth || isDummyUser}
              sx={{ 
                color: (!props.isAuth || isDummyUser) ? "gray" : "inherit",
                cursor: (!props.isAuth || isDummyUser) ? "not-allowed" : "pointer" 
              }}
            >
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{props.comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {props.isAuth && !isDummyUser && isComments && (
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
          {Array.isArray(props.comments) && props.comments.map((comment, index) => (
            <Box key={comment._id || `temp-comment-${index}`}>
              <Divider />
              <CommentCard 
                comment={comment}
                postId={postId}
                currentUserId={loggedInUserId}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                isOwner={comment.userId === loggedInUserId}
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
