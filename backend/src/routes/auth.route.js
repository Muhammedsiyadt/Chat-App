import express from "express";
import { checkAuth, login, logout, signup, updateProfile, request, getRequestedUsers, adminLogin, adminLogout, checkAdmin, acceptRequest } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);


router.post("/request", request);
router.get("/requested-users", getRequestedUsers);
router.post("/accept-request", acceptRequest);

router.post("/admin-login", adminLogin);
router.post("/adminLogout", adminLogout);
router.get("/check-admin", checkAdmin);


router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);



export default router;
