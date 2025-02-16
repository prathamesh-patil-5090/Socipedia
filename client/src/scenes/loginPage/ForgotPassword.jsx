import { Box, Button, TextField, Typography, useTheme, useMediaQuery } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  newPassword: yup.string()
    .required("required")
    .min(5, "Password must be at least 5 characters"),
});

const ForgotPassword = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const theme = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const handleSubmit = async (values, onSubmitProps) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: values.email,
          newPassword: values.newPassword
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Password reset successful! Please login with your new password.");
        navigate("/");
      } else {
        throw new Error(data.msg || data.error || "Password reset failed");
      }
    } catch (error) {
      console.error("Reset error:", error);
      onSubmitProps.setErrors({ 
        email: error.message.includes("User not found") ? "Email not found" : error.message
      });
    } finally {
      onSubmitProps.setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box
        width="100%"
        backgroundColor={theme.palette.background.alt}
        p="1rem 6%"
        textAlign="center"
      >
        <Typography fontWeight="bold" fontSize="32px" color="primary">
          Socipedia
        </Typography>
      </Box>

      <Box
        width={isNonMobileScreens ? "50%" : "93%"}
        p="2rem"
        m="2rem auto"
        borderRadius="1.5rem"
        backgroundColor={theme.palette.background.alt}
      >
        <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }}>
          Reset Your Password
        </Typography>

        <Formik
          initialValues={{ email: "", newPassword: "" }}
          validationSchema={forgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: "span 4" },
                }}
              >
                <TextField
                  label="Email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.email}
                  name="email"
                  error={Boolean(touched.email) && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  label="New Password"
                  type="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.newPassword}
                  name="newPassword"
                  error={Boolean(touched.newPassword) && Boolean(errors.newPassword)}
                  helperText={touched.newPassword && errors.newPassword}
                  sx={{ gridColumn: "span 4" }}
                />
              </Box>

              <Box>
                <Button
                  fullWidth
                  type="submit"
                  disabled={isSubmitting}
                  sx={{
                    m: "2rem 0",
                    p: "1rem",
                    backgroundColor: palette.primary.main,
                    color: "white",
                    "&:hover": { 
                      backgroundColor: palette.primary.light,
                      color: "white"
                    },
                  }}
                >
                  Reset Password
                </Button>
                <Typography
                  onClick={() => navigate("/")}
                  sx={{
                    textDecoration: "underline",
                    color: palette.primary.main,
                    "&:hover": {
                      cursor: "pointer",
                      color: palette.primary.light,
                    },
                    textAlign: "center",
                  }}
                >
                  Back to Login
                </Typography>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
