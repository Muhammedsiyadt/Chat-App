import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, selectedGroup, setSelectedGroup } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // Determine if we're showing a user or group chat
  const isGroupChat = !!selectedGroup;
  const currentSelection = isGroupChat ? selectedGroup : selectedUser;

  // Handle closing the chat
  const handleClose = () => {
    if (isGroupChat) {
      setSelectedGroup(null);
    } else {
      setSelectedUser(null);
    }
  };

  // Make sure we have something selected before rendering
  if (!currentSelection) return null;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              {isGroupChat ? (
                <div className="bg-primary text-white rounded-full size-10 flex items-center justify-center">
                  {selectedGroup.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img 
                  src={selectedUser.profilePic || "/avatar.png"} 
                  alt={selectedUser.fullName} 
                />
              )}
            </div>
          </div>

          {/* User/Group info */}
          <div>
            <h3 className="font-medium">
              {isGroupChat ? selectedGroup.name : selectedUser.fullName}
            </h3>
            {!isGroupChat && (
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            )}
            {isGroupChat && (
              <p className="text-sm text-base-content/70">
                {selectedGroup.members?.length || 0} members
              </p>
            )}
          </div>
        </div>

        {/* Close button */}
        <button onClick={handleClose}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;