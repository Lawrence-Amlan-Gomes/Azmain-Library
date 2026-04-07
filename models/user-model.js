import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  phone: {
    required: false,
    type: String,
  },
  photo: {
    required: false,
    type: String,
  },
  bio: {
    required: false,
    type: String,
  },
  userType: {
    required: false,
    type: String,
  },
  borrowedBooks: {
    required: false,
    type: Array,
  },
  borrowedHistory: {
    required: false,
    type: Array,
  },
});

// Export the model, checking if it already exists to avoid redefinition
export const userModel =
  mongoose.models?.users || mongoose.model("users", userSchema);
