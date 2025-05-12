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
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,

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
  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/messages/create-group", groupData);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Group creation failed.");
    }
  },
  
  subscribeToGroupMessages: () => {
    
    const { selectedGroup, setSelectedUser, selectedUser } = get();
    // if(selectedUser){
    //   setSelectedUser(null)
    // }
    if (!selectedGroup) return;
  
    const socket = useAuthStore.getState().socket;
  
    socket.on("newGroupMessage", (newMessage) => {
      if (newMessage.groupId === selectedGroup._id) {
        set({
          groupMessages: [...get().groupMessages, newMessage],
        });
      }
    });
  },
  
  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newGroupMessage");
  },
  
  getGroupMessages: async (groupId) => {
    // console.log('Group Message is Loading...!!!')
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/group-messages/${groupId}`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendGroupMessage: async (messageData) => {
    const { selectedGroup, groupMessages } = get();

    // console.log("messageData " + JSON.stringify(messageData))
    try {
      const res = await axiosInstance.post(`/messages/send-group/${selectedGroup._id}`, messageData);
      set({ groupMessages: [...groupMessages, res.data] });
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  
  fetchUserGroups: async (userId) => {
    try {
      const res = await axiosInstance.get(`/messages/groups/${userId}`);
      set({ groups: res.data });
    } catch (error) {
      console.error("Failed to fetch user groups", error);
      toast.error("Failed to load groups");
    }
  },

  setSelectedGroup: (selectedGroup) => {
    console.log(selectedGroup)
    set({
      selectedGroup,
      messages: []  
    });
  },
  setSelectedUser: (selectedUser) => {
    set({ 
      selectedUser,
      selectedGroup: null, 
      messages: [] 
    });
  },
}));