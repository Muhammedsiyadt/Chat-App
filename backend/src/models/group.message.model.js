import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});


const groupMessageModel = mongoose.model("GroupMessage", messageSchema);

export default groupMessageModel;