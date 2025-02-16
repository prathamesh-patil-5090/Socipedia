import { PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material"; // Change import
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFriends } from "state";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";

const Friend = ({ friendId, name, subtitle, userPicturePath, getFriends }) => {  // Add getFriends here
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const friends = useSelector((state) => state.user.friends || []); // Ensure friends is an array

  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  const isFriend = Array.isArray(friends) && friends.find((friend) => friend._id === friendId);
  const isSameUser = _id === friendId;

  const patchFriend = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${_id}/${friendId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update friend status');
      }
      
      dispatch(setFriends({ friends: data }));
      if (typeof getFriends === 'function') {
        await getFriends();
      }
    } catch (error) {
      console.error("Error updating friend status:", error);
    }
  };

  return (
    <FlexBetween>
      <FlexBetween gap="1rem">
        <UserImage image={userPicturePath} size="55px" />
        <Box
          onClick={() => {
            navigate(`/profile/${friendId}`);
            // Removed navigate(0) to avoid reload
          }}
        >
          <Typography
            color={main}
            variant="h5"
            fontWeight="500"
            sx={{
              "&:hover": {
                color: palette.primary.light,
                cursor: "pointer",
              },
            }}
          >
            {name}
          </Typography>
          <Typography color={medium} fontSize="0.75rem">
            {subtitle}
          </Typography>
        </Box>
      </FlexBetween>
      {!isSameUser && (
        <IconButton
          onClick={patchFriend}
          sx={{
            "&:hover": {
              backgroundColor: palette.background.light,
            },
            paddingRight: "10px", // Add right padding
          }}
        >
          {isFriend ? (
            <PersonRemoveOutlined 
              sx={{ 
                color: palette.mode === "dark" ? "white" : "#333333",
                fontSize: "25px"
              }} 
            />
          ) : (
            <PersonAddOutlined 
              sx={{ 
                color: palette.mode === "dark" ? "white" : "#333333",
                fontSize: "25px"
              }} 
            />
          )}
        </IconButton>
      )}
    </FlexBetween>
  );
};

export default Friend;
