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
  const friends = useSelector((state) => state.user?.friends || []);
  const loggedInUserId = useSelector((state) => state.user?._id);

  console.log("FriendListWidget state:", { 
    userId, 
    loggedInUserId,
    friendsCount: friends.length, 
    friends 
  });

  const getFriends = async () => {
    if (!userId || !token) {
      console.log("No userId or token, skipping friend fetch");
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
      
      console.log("Friends fetch response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch friends");
      }
      
      dispatch(setFriends({ friends: Array.isArray(data) ? data : [] }));
    } catch (error) {
      console.error("Error fetching friends:", error);
      dispatch(setFriends({ friends: [] }));
    }
  };

  useEffect(() => {
    getFriends();
  }, [userId, token]);

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
                key={friend._id}
                friendId={friend._id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.occupation}
                userPicturePath={friend.picturePath || null} // Add null fallback
                isAuth={true}
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
