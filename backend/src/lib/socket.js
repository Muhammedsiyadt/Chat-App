// socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const userSocketMap = {}; 
const userGroupsMap = {}; // Track which groups users are in

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    
    // Join group rooms for this user
    socket.on("join-groups", async (groups) => {
      groups.forEach(groupId => {
        socket.join(groupId);
        if (!userGroupsMap[userId]) {
          userGroupsMap[userId] = new Set();
        }
        userGroupsMap[userId].add(groupId);
      });
    });
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    delete userGroupsMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };