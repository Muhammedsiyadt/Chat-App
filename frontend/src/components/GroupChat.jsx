// GroupChat.js
import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const GroupChat = ({ group }) => {
  const { authUser } = useAuthStore();
  const { groupMessages, sendGroupMessage, fetchGroupMessages } = useChatStore();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    if (group) {
      fetchGroupMessages(group._id);
    }
  }, [group, fetchGroupMessages]);
  
  useEffect(() => {
    // Initialize socket listeners
    const socket = getSocket(); // Your socket instance
    
    const handleGroupMessage = (newMessage) => {
      if (newMessage.groupId === group?._id) {
        useChatStore.setState(state => ({
          groupMessages: [...state.groupMessages, newMessage]
        }));
      }
    };
    
    socket.on("group-message", handleGroupMessage);
    
    return () => {
      socket.off("group-message", handleGroupMessage);
    };
  }, [group]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      await sendGroupMessage({
        groupId: group._id,
        sender: authUser._id,
        text: message
      });
      setMessage("");
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  if (!group) return <div>Select a group to start chatting</div>;
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-base-300 p-4">
        <h2 className="font-semibold">{group.name}</h2>
        <p className="text-sm text-gray-500">
          {group.members.length} members
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupMessages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender._id === authUser._id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                msg.sender._id === authUser._id
                  ? "bg-primary text-white"
                  : "bg-base-300"
              }`}
            >
              {msg.sender._id !== authUser._id && (
                <div className="font-semibold text-sm">
                  {msg.sender.fullName}
                </div>
              )}
              <div>{msg.text}</div>
              <div className="text-xs opacity-70 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t border-base-300 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="input input-bordered flex-1"
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat;