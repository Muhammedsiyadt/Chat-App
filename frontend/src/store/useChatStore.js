import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  deleteMessageForMe: async (messageId) => {
    const { authUser, selectedUser, messages } = get();
    try {
      await axiosInstance.post("/messages/delete-for-me", {
        messageId,
        userId: authUser._id,
      });
  
      const updatedMessages = messages.filter(
        (msg) => msg._id !== messageId
      );
      set({ messages: updatedMessages });
  
      toast.success("Deleted for you");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete for me failed");
    }
  },
  
  deleteMessageForEveryone: async (messageId) => {
    const { messages } = get();
    try {
      await axiosInstance.post("/messages/delete-for-everyone", {
        messageId,
      });
  
      const updatedMessages = messages.map((msg) =>
        msg._id === messageId
          ? { ...msg, text: "This message was deleted", image: null, isDeleted: true }
          : msg
      );
      set({ messages: updatedMessages });
  
      toast.success("Deleted for everyone");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete for everyone failed");
    }
  },
  

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
