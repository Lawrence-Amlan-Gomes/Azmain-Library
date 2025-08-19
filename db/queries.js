import { userModel } from "@/models/user-model";
import { booksModel } from "@/models/books-model";
import {
  replaceMongoIdInArray,
  replaceMongoIdInObject,
} from "@/utils/data-util";

async function getAllUsers() {
  const allUsers = await userModel.find().lean();
  return replaceMongoIdInArray(allUsers);
}

async function getAllBooks() {
  const allBooks = await booksModel.find().lean();
  return replaceMongoIdInArray(allBooks);
}

async function createUser(user) {
  const createdUser = await userModel.create(user);
  return replaceMongoIdInObject(createdUser.toObject());
}

async function createBook(books) {
  const createdBook = await booksModel.create(books);
  return replaceMongoIdInObject(createdBook.toObject());
}

async function findUserByCredentials(credentials) {
  const user = await userModel.findOne(credentials).lean();
  if (user) {
    return replaceMongoIdInObject(user);
  }
  return null;
}

async function updateUser(email, name, phone, bio) {
  await userModel.updateOne(
    { email: email },
    { $set: { name: name, phone: phone, bio: bio } }
  );
}

async function updateBook(
  id,
  title,
  author,
  genre,
  description,
  rating,
  inventory,
  photo,
  isBorrowed
) {
  await booksModel.updateOne(
    { id: id },
    {
      $set: {
        title: title,
        author: author,
        genre: genre,
        description: description,
        rating: rating,
        inventory: inventory,
        photo: photo,
        isBorrowed: isBorrowed,
      },
    }
  );
}

async function changeBookPhoto(id, photo) {
  await booksModel.updateOne({ id: id }, { $set: { photo: photo || "" } });
}

async function deleteBook(id) {
  await booksModel.deleteOne({ id: id });
}

async function changePassword(email, password) {
  await userModel.updateOne({ email: email }, { $set: { password: password } });
}

async function changePhoto(email, photo) {
  await userModel.updateOne({ email: email }, { $set: { photo: photo } });
}

async function changeBorrowedHistory(email, borrowedHistory) {
  await userModel.updateOne({ email: email }, { $set: { borrowedHistory: borrowedHistory } });
}

async function changeIsBorrowed(id, isBorrowed) {
  await booksModel.updateOne({ id: id }, { $set: { isBorrowed: isBorrowed } });
}

async function changeInventory(id, inventory) {
  await booksModel.updateOne({ id: id }, { $set: { inventory: inventory } });
}

async function changeBorrowedBooks(email, borrowedBooks) {
  await userModel.updateOne(
    { email: email },
    {
      $set: {
        borrowedBooks: borrowedBooks,
      },
    }
  );
}

export {
  createUser,
  createBook,
  findUserByCredentials,
  getAllUsers,
  getAllBooks,
  updateUser,
  changePassword,
  changePhoto,
  updateBook,
  changeBookPhoto,
  deleteBook,
  changeBorrowedBooks,
  changeIsBorrowed,
  changeInventory,
  changeBorrowedHistory,
};
