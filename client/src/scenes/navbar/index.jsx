import { useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import {
  Search,
  Menu,
  Close,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "state";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";

const AuthButtons = ({ theme, navigate, isMobile = false }) => {
  const isDarkMode = theme.palette.mode === "dark";
  
  return (
    <Box 
      display="flex" 
      gap={isMobile ? "1.5rem" : "1rem"}
      flexDirection={isMobile ? "column" : "row"}
      width={isMobile ? "100%" : "auto"}
      alignItems="center"
    >
      <Button
        variant="contained"
        onClick={() => navigate("/login")}
        sx={{
          backgroundColor: isDarkMode ? theme.palette.primary.dark : theme.palette.primary.main,
          color: theme.palette.background.alt,
          padding: isMobile ? "0.75rem" : "0.5rem 2rem",
          borderRadius: "2rem",
          width: isMobile ? "85%" : "auto",
          fontSize: isMobile ? "1.1rem" : "1rem",
          fontWeight: 600,
          "&:hover": {
            backgroundColor: isDarkMode ? theme.palette.primary.main : theme.palette.primary.dark,
            transform: "translateY(-2px)",
            boxShadow: `0 4px 12px ${isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'}`,
          },
          transition: "all 0.3s ease",
          boxShadow: `0 2px 8px ${isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        Login
      </Button>
    </Box>
  );
};

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user) || {};
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const isAuth = Boolean(useSelector((state) => state.token));
  const isDummyUser = user?._id === "67b1d55da90d9304b1f869d5";

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}` : '';

  return (
    <FlexBetween padding="1rem 6%" backgroundColor={alt}>
      <FlexBetween gap="1.75rem">
        <Typography
          fontWeight="bold"
          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color={theme.palette.mode === "dark" ? "white" : "primary"}
          onClick={() => navigate("/")}
          sx={{
            cursor: "pointer",
          }}
        >
          Socipedia
        </Typography>
        {isNonMobileScreens && (
          <FlexBetween
            backgroundColor={neutralLight}
            borderRadius="9px"
            gap="3rem"
            padding="0.1rem 1.5rem"
          >
            <InputBase placeholder="Search..." />
            <IconButton>
              <Search />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>

      {/* DESKTOP NAV */}
      {isNonMobileScreens ? (
        <FlexBetween gap="2rem">
          {/* Removed message, notifications, and help icons */}
          
          {!isDummyUser && isAuth && (
            <>
            </>
          )}

          {isDummyUser ? (
            <AuthButtons theme={theme} navigate={navigate} />
          ) : isAuth ? (
            <FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  backgroundColor: neutralLight,
                  width: "150px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Box display="flex" gap="1rem">
              <Typography
                sx={{
                  cursor: "pointer",
                  "&:hover": { color: theme.palette.primary.light },
                }}
                onClick={() => navigate("/login")}
              >
                Login
              </Typography>
            </Box>
          )}
        </FlexBetween>
      ) : (
        <IconButton
          onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
        >
          <Menu />
        </IconButton>
      )}

      {/* MOBILE NAV */}
      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          bottom="0"
          height="100%"
          zIndex="10"
          maxWidth="500px"
          minWidth="300px"
          backgroundColor={background}
        >
          {/* CLOSE ICON */}
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <Close />
            </IconButton>
          </Box>

          {/* MENU ITEMS */}
          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
            padding="2rem"
          >
            {/* Removed message, notifications, and help icons */}
            {isDummyUser ? (
              <AuthButtons theme={theme} navigate={navigate} isMobile={true} />
            ) : isAuth ? (
              <FormControl variant="standard" value={fullName}>
                <Select
                  value={fullName}
                  sx={{
                    backgroundColor: neutralLight,
                    width: "150px",
                    borderRadius: "0.25rem",
                    p: "0.25rem 1rem",
                    "& .MuiSvgIcon-root": {
                      pr: "0.25rem",
                      width: "3rem",
                    },
                    "& .MuiSelect-select:focus": {
                      backgroundColor: neutralLight,
                    },
                  }}
                  input={<InputBase />}
                >
                  <MenuItem value={fullName}>
                    <Typography>{fullName}</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => dispatch(setLogout())}>
                    Log Out
                  </MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Box display="flex" gap="1rem">
                <Typography
                  sx={{
                    cursor: "pointer",
                    "&:hover": { color: theme.palette.primary.light },
                  }}
                  onClick={() => navigate("/login")}
                >
                  Login
                </Typography>
              </Box>
            )}
          </FlexBetween>
        </Box>
      )}
    </FlexBetween>
  );
};

export default Navbar;
