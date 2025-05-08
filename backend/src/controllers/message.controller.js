import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import fs from "fs";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

import Group from "../models/group.model.js";
import GroupMessage from "../models/group.message.model.js";


export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // console.log(`text - ${text} :  image - ${image} `)   

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image, {
        resource_type: "auto"
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};




// DELETE FOR ME
export const deleteForMe = async (req, res) => {
  const { messageId, userId } = req.body;
  try {
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userId },
    });
    res.status(200).json({ message: "Message deleted for you." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete for me." });
  }
};

// DELETE FOR EVERYONE
export const deleteForEveryone = async (req, res) => {
  const { messageId } = req.body;
  try {
    await Message.findByIdAndUpdate(messageId, {
      text: "This message was deleted",
      image: null,
      isDeleted: true,
    });
    res.status(200).json({ message: "Message deleted for everyone." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete for everyone." });
  }
};


export const createGroup = async (req, res) => {
  try {
    const { name, members, createdBy } = req.body;

    console.log("name, members, createdBy" + name, members, createdBy)

    if (!name || !members?.length || !createdBy) {
      return res.status(400).json({ message: "Missing required group data." });
    }

    // Ensure creator is included in members
    const allMembers = [...new Set([createdBy, ...members])];
    
    const group = await Group.create({ 
      name, 
      members: allMembers, 
      creator: createdBy 
    });

    // Emit socket event to all group members
    allMembers.forEach(memberId => {
      const receiverSocketId = getReceiverSocketId(memberId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new-group", group);
      }
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const { sender, text } = req.body;

    // Validate sender membership
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // console.log("sender " + sender)
    // console.log("group.members " + group.members)

    if (!group.members.includes(sender)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    
    const message = await GroupMessage.create({ groupId, sender, text });

    
    const populatedMessage = await GroupMessage.findById(message._id)
      .populate("sender", "fullName profilePic");

    
    group.members.forEach(memberId => {
      const receiverSocketId = getReceiverSocketId(memberId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("group-message", populatedMessage);
      }
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending group message:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    console.log('groupId - ' + groupId)

    const messages = await GroupMessage.find({ groupId })
      .populate("sender", "fullName profilePic")
      .sort({ createdAt: 1 }); 

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getUserGroups = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) return res.status(400).json({ message: "User ID is required." });

    const groups = await Group.find({
      members: userId,
    }).populate("members", "fullName profilePic").populate("creator", "fullName"); 

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};