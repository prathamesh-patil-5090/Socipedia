import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";

const PostsWidget = ({ userId, isProfile = false, isAuth = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user?._id); // Fix: Get _id from user object

  const getPosts = async () => {
    try {
      console.log("Fetching posts from:", `${process.env.REACT_APP_API_URL}/posts`);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Posts data received:", data);
      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.error("Error fetching posts:", error);
      dispatch(setPosts({ posts: [] }));
    }
  };

  const getUserPosts = async () => {
    if (!token) return; // Don't fetch user posts if not authenticated
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/posts/${userId}/posts`,
        {
          method: "GET",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user posts');
      }

      const data = await response.json();
      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.error("Error fetching user posts:", error);
      dispatch(setPosts({ posts: [] }));
    }
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
  }, [userId, isProfile]); // Add isProfile to dependencies

  return (
    <>
      {Array.isArray(posts) && posts.map((post) => {
        // Ensure we have all required data
        if (!post) return null;

        const {
          _id,
          userId: postUserId,
          firstName,
          lastName,
          description,
          location,
          picturePath,
          userPicturePath,
          likes,
          comments,
        } = post;

        return (
          <PostWidget
            key={_id}
            postId={_id}
            postUserId={postUserId}
            name={`${firstName} ${lastName}`} // Properly construct name
            description={description}
            location={location}
            picturePath={picturePath}
            userPicturePath={userPicturePath}
            likes={likes || {}}
            comments={comments || []}
            isAuth={isAuth}
          />
        );
      })}
    </>
  );
};

export default PostsWidget;
