import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, deleteForMe, deleteForEveryone, createGroup, sendGroupMessage, getGroupMessages, getUserGroups  } from "../controllers/message.controller.js";
import upload from "../multer/multer.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

// router.post("/send/:id", upload.single("file"), protectRoute, sendMessage);
router.post("/send/:id", protectRoute, sendMessage);

// Node.js (MongoDB) example
router.post("/delete-for-me", deleteForMe);
router.post("/delete-for-everyone", deleteForEveryone);

router.post("/create-group", createGroup);
router.get("/groups/:userId", getUserGroups);

// Group message routes
router.post("/send-group/:groupId", sendGroupMessage);

router.get("/group-messages/:groupId", getGroupMessages);
  
  

export default router;
