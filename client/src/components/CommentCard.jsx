import { useState } from "react";
import { useSelector } from "react-redux";  // Ensure this import exists
import { EditOutlined, DeleteOutlined } from "@mui/icons-material";
import { Box, Typography, useTheme, IconButton, InputBase, Button } from "@mui/material";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";

const CommentCard = ({ comment, postId, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);
  const { palette } = useTheme();
  const main = palette.neutral.main;
  const loggedInUserId = useSelector((state) => state.user._id);
  const isAuthor = loggedInUserId === comment.userId;

  const handleUpdate = () => {
    console.log(`Comment ID from client: ${comment._id}`); // Verify this ID matches server
    onUpdate(comment._id, editedComment); // Use server-provided _id
    setIsEditing(false);
  };

  return (
    <FlexBetween>
      <Box sx={{ m: "0.5rem", pl: "1rem", width: "100%" }}>
        <FlexBetween>
          <Typography sx={{ color: main, fontWeight: "500" }}>
            {comment.firstName} {comment.lastName}
          </Typography>
          {isAuthor && (
            <FlexBetween gap="1rem">
              <IconButton onClick={() => setIsEditing(!isEditing)}>
                <EditOutlined sx={{ fontSize: "20px" }} />
              </IconButton>
              <IconButton onClick={() => onDelete(comment._id)}>
                <DeleteOutlined sx={{ fontSize: "20px" }} />
              </IconButton>
            </FlexBetween>
          )}
        </FlexBetween>
        
        {isEditing ? (
          <Box>
            <InputBase
              fullWidth
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              sx={{
                backgroundColor: palette.neutral.light,
                borderRadius: "2rem",
                padding: "0.5rem 1rem",
                marginTop: "0.5rem",
              }}
            />
            <Button onClick={handleUpdate}>Save</Button>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          </Box>
        ) : (
          <Typography sx={{ color: main }}>{comment.comment}</Typography>
        )}
      </Box>
      <UserImage image={comment.userPicturePath} size="35px" />
    </FlexBetween>
  );
};

export default CommentCard;
