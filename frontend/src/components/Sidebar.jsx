import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  // Get users, selectedUser, isUsersLoading from useChatStore
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  // Get onlineUsers and currentUser directly from the authStore
  const { onlineUsers, authUser } = useAuthStore();
  const { groups, fetchUserGroups, isGroupsLoading, createGroup } = useChatStore();
  const { setSelectedGroup, selectedGroup } = useChatStore();

  const [activeGroupMenu, setActiveGroupMenu] = useState(null); // To show menu per group
  const [showAddPeopleModal, setShowAddPeopleModal] = useState(false);
  const [selectedGroupForEdit, setSelectedGroupForEdit] = useState(null);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]);



  const currentUserId = authUser?._id;

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);


  useEffect(() => {
    if (currentUserId) {
      fetchUserGroups(currentUserId);
    }
  }, [currentUserId, fetchUserGroups]);

  // Now using the correct variable from the storex

  const [groupName, setGroupName] = useState("");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);

  const handleUserToggle = (userId) => {
    setSelectedGroupUsers((prev) =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    const allMembers = [...new Set([currentUserId, ...selectedGroupUsers])];

    if (!groupName.trim()) {
      toast.error("Please provide a name for group!");
      return;
    }

    if (selectedGroupUsers.length < 1) {
      toast.error("Please select at least one other user to create a group.");
      return;
    }

    const groupData = {
      name: groupName,
      members: allMembers,
      createdBy: currentUserId,
    };

    try {
      await createGroup(groupData); // Call from store
      toast.success("Group created successfully!");
      setShowCreateGroup(false);
      setGroupName("");
      setSelectedGroupUsers([]);
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    }
  };

  const handleAddPeople = (group) => {
    console.log('Add - ' + JSON.stringify(group))
  };
  
  const handleRemovePeople = (group) => {
    console.log('remove')
  };
  
  const handleDeleteGroup = async (group) => {
    const confirm = window.confirm(`Delete group "${group.name}"?`);
    if (!confirm) return;
  
    try {
      await deleteGroup(group._id); // define in store or API
      toast.success("Group deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete group.");
    }
  };
  

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center me-2">
            <Users className="size-6 " />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
          <button
            className="flex items-center gap-1 text-sm text-primary"
            onClick={() => setShowCreateGroup(true)}
          >
            <UserPlus className="size-5" />
          </button>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>


      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
            }}
            className={`
            w-full p-3 flex items-center gap-3
            hover:bg-base-300 transition-colors
            ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
          `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>

      <div className="border-t border-base-300 w-full p-5">
        <div className="flex items-center me-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Groups</span>
        </div>

        {isGroupsLoading ? (
          <div className="mt-3">Loading groups...</div>
        ) : (
          <div className="mt-3 space-y-2">
            {groups.map((group) => (
              <div
                key={group._id}
                className={`relative w-full p-2 flex items-center justify-between gap-2 rounded hover:bg-base-300 transition-colors ${selectedGroup?._id === group._id ? "bg-base-300" : ""
                  }`}
              >
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <div className="bg-primary text-white rounded-full size-8 flex items-center justify-center">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">{group.name}</span>
                </button>

                {/* 3-dot menu */}
                <div className="relative group">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <span className="text-lg">⋮</span>
                  </button>

                  <div className="absolute right-0 top-8 z-10 hidden group-hover:flex flex-col bg-white shadow-md rounded w-36 border">
                    <button
                      onClick={() => handleAddPeople(group)}
                      className="px-4 py-2 hover:bg-gray-100 text-left"
                    >
                      Add People
                    </button>
                    <button
                      onClick={() => handleRemovePeople(group)}
                      className="px-4 py-2 hover:bg-gray-100 text-left"
                    >
                      Remove People
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="px-4 py-2 hover:bg-red-100 text-left text-red-600"
                    >
                      Delete Group
                    </button>
                  </div>
                </div>
              </div>
            ))}


          </div>


        )}
      </div>


      {showAddPeopleModal && selectedGroupForEdit && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add People to {selectedGroupForEdit.name}</h2>

            <div className="max-h-60 overflow-y-auto border p-2 rounded space-y-2">
              {users
                .filter((user) => !selectedGroupForEdit.members.includes(user._id))
                .map((user) => (
                  <label
                    key={user._id}
                    className={`flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors ${selectedUsersToAdd.includes(user._id) ? "bg-gray-200" : ""
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsersToAdd.includes(user._id)}
                      onChange={() =>
                        setSelectedUsersToAdd((prev) =>
                          prev.includes(user._id)
                            ? prev.filter((id) => id !== user._id)
                            : [...prev, user._id]
                        )
                      }
                      className="checkbox"
                    />
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex flex-col text-sm">
                      <span>{user.fullName}</span>
                    </div>
                  </label>
                ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddPeopleModal(false);
                  setSelectedUsersToAdd([]);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // ✅ Update group in your store (e.g., addMembersToGroup(selectedGroupForEdit._id, selectedUsersToAdd))
                  toast.success("People added!");
                  setShowAddPeopleModal(false);
                  setSelectedUsersToAdd([]);
                }}
                className="btn btn-primary"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}


      {showCreateGroup && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create Group</h2>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input input-bordered w-full mb-4"
            />

            <div className="max-h-60 overflow-y-auto border p-2 rounded space-y-2">
              {users.map((user) => (
                <label
                  key={user._id}
                  className={`flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors ${selectedGroupUsers.includes(user._id) ? "bg-gray-200" : ""
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedGroupUsers.includes(user._id)}
                    onChange={() => handleUserToggle(user._id)}
                    className="checkbox"
                  />
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col text-sm">
                    <span>{user.fullName}</span>
                    <span className="text-xs text-zinc-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowCreateGroup(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleCreateGroup} className="btn btn-primary">Create</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;