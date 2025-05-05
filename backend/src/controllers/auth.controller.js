import { generateAdminToken, generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import Request from "../models/user.request.modal.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

import jwt from "jsonwebtoken" ;

const ADMIN_CREDENTIALS = {
  email: "siyad@gmail.com",
  password: "12345"
};

export const request = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Requested Email:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Match case-insensitively
    const existingRequest = await Request.findOne({ email: { $regex: `^${trimmedEmail}$`, $options: "i" } });

    if (existingRequest) {
      // console.log("Email already exists in DB:", trimmedEmail);
      return res.status(409).json({ message: "Email already requested" });
    }

    const newRequest = await Request.create({ email: trimmedEmail });

    console.log("New request created:", newRequest);
    return res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error in request controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRequestedUsers = async (req, res) => {
  try {
    const users = await Request.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    console.log('Admin login successful');

    const token = generateAdminToken(email, res); 

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: { email },
      token, 
    });
  }
  
  return res.status(401).json({
    success: false,
    message: "Invalid email or password"
  });
};



// export const signup = async (req, res) => {
//   const { fullName, email, password } = req.body;
//   try {
//     if (!fullName || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ message: "Password must be at least 6 characters" });
//     }

//     const user = await User.findOne({ email });

//     if (user) return res.status(400).json({ message: "Email already exists" });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new User({
//       fullName,
//       email,
//       password: hashedPassword,
//     });

//     if (newUser) {
//       // generate jwt token here
//       generateToken(newUser._id, res);
//       await newUser.save();

//       res.status(201).json({
//         _id: newUser._id,
//         fullName: newUser.fullName,
//         email: newUser.email,
//         profilePic: newUser.profilePic,
//       });
//     } else {
//       res.status(400).json({ message: "Invalid user data" });
//     }
//   } catch (error) {
//     console.log("Error in signup controller", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // ✅ Check if the user already signed up
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // ✅ Check access in Request collection
    const requestUser = await Request.findOne({ email });
    if (!requestUser || requestUser.access === false) {
      return res.status(403).json({ message: "Access not granted for this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const checkAdmin = async (req, res) => {
  const token = req.cookies.adminJWT;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If decoded.userId === your hardcoded admin ID/email, return success
    if (decoded.userId === process.env.ADMIN_EMAIL) {
      return res.status(200).json({ email: decoded.userId });
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    console.log("Token error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



export const adminLogout = (req, res) => {
  try {
    res.cookie("adminJWT", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const email = req.query.id;

    const updatedUser = await Request.findOneAndUpdate(
      { email: email },
      { access: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);

  } catch (error) {
    console.error("Error updating user access:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

