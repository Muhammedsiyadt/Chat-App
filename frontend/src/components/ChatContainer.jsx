import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessageForMe,
    deleteMessageForEveryone,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // message ID for which menu is open

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDeleteForMe = (id) => {
    deleteMessageForMe(id);
    setActiveMenu(null);
  };

  const handleDeleteForEveryone = (id) => {
    deleteMessageForEveryone(id);
    setActiveMenu(null);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto relative">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={index === messages.length - 1 ? messageEndRef : null}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1 flex items-center gap-2">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>

              {message.senderId === authUser._id && (
                <button
                  className="text-xs text-gray-400 hover:text-red-500"
                  onClick={() =>
                    setActiveMenu((prev) => (prev === message._id ? null : message._id))
                  }
                >
                  ⋮
                </button>
              )}
            </div>

            <div className="chat-bubbl flex flex-col relative">
              {message.isDeleted ? (
                <p className="italic text-gray-400">This message was deleted</p>
              ) : (
                <>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md cursor-pointer"
                      onClick={() => setPreviewImage(message.image)}
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </>
              )}

              {/* Dropdown Menu */}
              {message.senderId === authUser._id && activeMenu === message._id && !message.isDeleted && (
                <div className="absolute right-0 top-0 mt-[-30px] z-50 bg-white shadow-md border rounded-md p-2 text-sm">
                  <button
                    onClick={() => handleDeleteForMe(message._id)}
                    className="block text-left w-full px-2 py-1 hover:bg-gray-100"
                  >
                    Delete for Me
                  </button>
                  <button
                    onClick={() => handleDeleteForEveryone(message._id)}
                    className="block text-left w-full px-2 py-1 hover:bg-gray-100 text-red-500"
                  >
                    Delete for Everyone
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Zoom"
            className="max-w-[90%] max-h-[90%] object-contain rounded-md shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;