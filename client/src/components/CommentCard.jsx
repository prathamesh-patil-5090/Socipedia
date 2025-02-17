import { useState } from "react";
import { Box, Typography, IconButton, InputBase, Button } from "@mui/material";
import { EditOutlined, DeleteOutlined } from "@mui/icons-material";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";

const CommentCard = ({ 
  comment, 
  postId, 
  currentUserId,
  onUpdate, 
  onDelete,
  isOwner 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.comment);

  const handleUpdate = async () => {
    if (!comment._id) {
      console.error("Comment ID is missing");
      return;
    }
    
    await onUpdate(comment._id, editedText);
    setIsEditing(false);
  };

  return (
    <Box p="1rem">
      <FlexBetween>
        <FlexBetween gap="1rem">
          <UserImage image={comment.userPicturePath} size="45px" />
          <Box>
            <Typography variant="h6">
              {comment.firstName} {comment.lastName}
            </Typography>
            {isEditing ? (
              <Box>
                <InputBase
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  fullWidth
                />
                <Button onClick={handleUpdate}>Save</Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </Box>
            ) : (
              <Typography>{comment.comment}</Typography>
            )}
          </Box>
        </FlexBetween>
        {isOwner && (
          <FlexBetween gap="0.5rem">
            <IconButton onClick={() => setIsEditing(!isEditing)}>
              <EditOutlined />
            </IconButton>
            <IconButton onClick={() => onDelete(comment._id)}>
              <DeleteOutlined />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>
    </Box>
  );
};

export default CommentCard;
