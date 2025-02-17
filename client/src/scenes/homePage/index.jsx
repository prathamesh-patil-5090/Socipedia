import { Box, useMediaQuery, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import AdvertWidget from "scenes/widgets/AdvertWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1200px)");
  const isAuth = Boolean(useSelector((state) => state.token));
  const user = useSelector((state) => state.user) || {};
  const { _id, picturePath } = user;
  const isDummyUser = user?._id === "67b1d55da90d9304b1f869d5";

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
        flexGrow={1}
      >
        {/* Left Column */}
        {isAuth && !isDummyUser && (
          <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
            <UserWidget userId={_id} picturePath={picturePath} />
          </Box>
        )}

        {/* Middle Column */}
        <Box
          flexBasis={isNonMobileScreens ? (isAuth && !isDummyUser ? "42%" : "70%") : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        >
          {isDummyUser && (
            <Typography 
              variant="h5" 
              textAlign="center" 
              mb={2}
              color="primary"
            >
              Please login or register to interact with posts
            </Typography>
          )}
          {isAuth && !isDummyUser && <MyPostWidget picturePath={picturePath} />}
          <PostsWidget userId={_id} isAuth={isAuth && !isDummyUser} />
        </Box>

        {/* Right Column */}
        {isNonMobileScreens && isAuth && !isDummyUser && (
          <Box flexBasis="26%">
            <AdvertWidget />
            <Box m="2rem 0" />
            <FriendListWidget userId={_id} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
