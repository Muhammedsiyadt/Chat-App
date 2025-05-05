import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, 
      trim: true,
      lowercase: true,
    },
    access: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);

export default Request;
