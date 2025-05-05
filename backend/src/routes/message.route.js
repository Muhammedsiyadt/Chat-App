import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, deleteForMe, deleteForEveryone } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

// Node.js (MongoDB) example
router.post("/delete-for-me", deleteForMe);
router.post("/delete-for-everyone", deleteForEveryone);
  
  

export default router;
