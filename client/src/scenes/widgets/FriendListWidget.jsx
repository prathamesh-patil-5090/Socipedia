import { Box, Typography, useTheme } from "@mui/material";
import Friend from "../../components/Friend";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "state";

const FriendListWidget = ({ userId }) => {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const friends = useSelector((state) => state.user.friends || []);
  const loggedInUserId = useSelector((state) => state.user._id);

  const getFriends = async () => {
    if (!userId || !token) {
      dispatch(setFriends({ friends: [] }));
      return;
    }
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${userId}/friends`,
        {
          method: "GET",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Server error:", data.message);
        dispatch(setFriends({ friends: [] }));
        return;
      }
      
      dispatch(setFriends({ friends: Array.isArray(data) ? data : [] }));
    } catch (error) {
      console.error("Error fetching friends:", error);
      dispatch(setFriends({ friends: [] }));
    }
  };

  useEffect(() => {
    getFriends();
  }, [userId, token]); // Add both dependencies back

  return (
    <WidgetWrapper>
      <Typography
        color={palette.neutral.dark}
        variant="h5"
        fontWeight="500"
        sx={{ mb: "1.5rem" }}
      >
        Friend List
      </Typography>
      <Box display="flex" flexDirection="column" gap="1.5rem">
        {Array.isArray(friends) && friends.length > 0 ? (
          friends
            .filter(friend => friend && friend._id && friend._id !== loggedInUserId)
            .map((friend) => (
              <Friend
                key={`friend-${friend._id}`}
                friendId={friend._id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.occupation}
                userPicturePath={friend.picturePath}
                getFriends={getFriends}
              />
            ))
        ) : (
          <Typography>No friends yet</Typography>
        )}
      </Box>
    </WidgetWrapper>
  );
};

export default FriendListWidget;
