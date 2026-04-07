import mongoose, { Schema } from "mongoose";

const bookSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: false, default: "" },
  author: { type: String, required: false, default: "" },
  genre: { type: String, required: false, default: "" },
  description: { type: String, required: false, default: "" },
  rating: { type: Number, required: false, default: 0 },
  inventory: { type: Number, required: false, default: 0 },
  photo: { type: String, required: false, default: "" },
  isBorrowed: { type: Number, required: false, default: 0 },
});

export const booksModel =
  mongoose.models?.books || mongoose.model("books", bookSchema);
