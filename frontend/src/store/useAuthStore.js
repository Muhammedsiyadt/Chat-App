import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isRequested: false,
  request: null,
  admin: false,
  authAdmin: null,
  admin_login: false,
  isAdminLoggingIn: false,
  isCheckingAdminAuth: false,
  
  // Remove the redundant currentUser state
  // currentUser: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      
      set({ authUser: res.data });
      // Remove this line - no need for duplicate state
      // set({currentUser: res.data._id})
      
      // console.log("Auth check successful. User ID: " + res.data._id);

      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  request: async (data) => {
    set({ isRequested: true });
    try {
      console.log('Requesting access for:', data.email);
      const res = await axiosInstance.post("/auth/request", data);
      set({ request: res.data });
      toast.success("Wait for Accept of Admin");
      get().connectSocket();
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },

  fetchRequests: async () => {
    const response = await axiosInstance.get("/auth/requested-users");
    return response.data;
  },

  acceptRequest: async (requestId) => {
    await axiosInstance.post(`/auth/accept-request?id=${requestId}`); 
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  adminLoginAuth: async (formData) => {
    console.log('Admin login button clicked..!!', formData);
    set({ isAdminLoggingIn: true });

    try {
      const res = await axiosInstance.post("/auth/admin-login", formData);
      set({ authAdmin: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      
      // This won't work properly - useNavigate must be used inside a component
      const navigate = useNavigate();
      navigate('/admin');
      
      // Instead, use this approach:
      // window.location.href = '/admin';
    } catch (error) {
      // toast.error(error.response?.data?.message || "An error occurred");
      console.log('error')
    } finally {
      set({ isAdminLoggingIn: false });
    }
  },
  
  checkAuthAdmin: async () => {
    try {
      const res = await axiosInstance.get("/auth/check-admin");
      set({ authAdmin: res.data });
      return res.data; // Return the admin data
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authAdmin: null });
      return null;
    }
  },
  
  initializeAdminAuth: async () => {
    try {
      const admin = await get().checkAuthAdmin();
      if (!admin) {
        // Redirect if not authenticated
        if (window.location.pathname !== "/admin-login") {
          window.location.href = "/admin-login";
        }
      }
    } catch (error) {
      console.error("Admin auth initialization failed:", error);
    }
  },
  
  adminLogout: async () => {
    try {
      await axiosInstance.post("/auth/adminLogout");
      set({ authUser: null });
      toast.success("Admin Logged out successfully");

      
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },
}));