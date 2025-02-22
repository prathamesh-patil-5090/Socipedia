import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      location,
      occupation,
      username
    } = req.body;

    // Debug log
    console.log("Received registration request:", { 
      body: req.body,
      file: req.file 
    });

    // Validate required fields first
    if (!firstName || !lastName || !email || !password || !username) {
      return res.status(400).json({ msg: "All required fields must be provided" });
    }

    // Check if user already exists before handling file
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return res.status(400).json({ msg: `User with this ${field} already exists` });
    }

    // Handle file upload
    let picturePath = "";
    if (req.file) {
      picturePath = req.file.filename;
    } else {
      return res.status(400).json({ msg: "Profile picture is required" });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends: [],
      location: location || "",
      occupation: occupation || "",
      username,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });

    const savedUser = await newUser.save();
    
    // Remove password from response
    const userResponse = { ...savedUser._doc };
    delete userResponse.password;
    
    res.status(201).json({ user: userResponse, msg: "Registration successful" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      msg: "Error registering user", 
      error: err.message 
    });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail },
        { username: usernameOrEmail }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    // Create a sanitized user object without password
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      picturePath: user.picturePath,
      friends: user.friends,
      location: user.location,
      occupation: user.occupation,
      viewedProfile: user.viewedProfile,
      impressions: user.impressions,
    };

    res.status(200).json({ 
      token, 
      user: userResponse
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ msg: "Please provide both email and new password" });
    }

    // Find user and select all fields to avoid validation errors
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (newPassword.length < 5) {
      return res.status(400).json({ msg: "Password must be at least 5 characters" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    // Update only the password field
    await User.findByIdAndUpdate(
      user._id,
      { $set: { password: passwordHash } },
      { new: true, runValidators: false }
    );

    res.status(200).json({ msg: "Password reset successful" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ error: err.message });
  }
};
