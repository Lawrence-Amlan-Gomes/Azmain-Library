"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/services/mongo";
import {
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
  changeBorrowedHistory
} from "@/db/queries";
import { redirect } from "next/navigation";

async function registerUser(formData) {
  await dbConnect();
  const created = await createUser(formData);
  redirect("/login");
}

async function createBook2(formData) {
  await dbConnect();
  try {
    const created = await createBook(formData);
    return created;
  } catch (error) {
    throw new Error(`Failed to create book: ${error.message}`);
  }
}

async function getAllUsers2() {
  try {
    await dbConnect();
    const users = await getAllUsers();
    return users;
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

async function getAllBooks2() {
  try {
    await dbConnect();
    const books = await getAllBooks();
    return books;
  } catch (error) {
    throw new Error(`Failed to fetch books: ${error.message}`);
  }
}

async function performLogin(formData) {
  await dbConnect();
  try {
    const found = await findUserByCredentials(formData);
    return found;
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

async function callUpdateUser(email, name, phone, bio) {
  await dbConnect();
  try {
    await updateUser(email, name, phone, bio);
    revalidatePath("/");
  } catch (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

async function callUpdateBook(
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
  await dbConnect();
  try {
    await updateBook(id, title, author, genre, description, rating, inventory, photo, isBorrowed);
    revalidatePath("/");
  } catch (error) {
    throw new Error(`Failed to update book: ${error.message}`);
  }
}

async function callChangeBookPhoto(id, photo) {
  await dbConnect();
  try {
    await changeBookPhoto(id, photo);
    revalidatePath("/");
  } catch (error) {
    throw new Error(`Failed to update book photo: ${error.message}`);
  }
}

async function callDeleteBook(id) {
  await dbConnect();
  try {
    await deleteBook(id);
    revalidatePath("/");
  } catch (error) {
    throw new Error(`Failed to delete book: ${error.message}`);
  }
}

async function callChangePassword(email, password) {
  await dbConnect();
  try {
    await changePassword(email, password);
    redirect("/");
  } catch (error) {
    throw new Error(`Failed to change password: ${error.message}`);
  }
}

async function callChangePhoto(email, photo) {
  await dbConnect();
  try {
    await changePhoto(email, photo);
    redirect("/profile");
  } catch (error) {
    throw new Error(`Failed to change photo: ${error.message}`);
  }
}

async function updateIsBorrowed(id, isBorrowed) {
  await dbConnect();
  try {
    await changeIsBorrowed(id, isBorrowed);
  } catch (error) {
    return { success: false, error: `Failed to update isBorrowed: ${error.message}` };
  }
}

async function updateBorrowedBooks(email, borrowedBooks) {
  await dbConnect();
  try {
    await changeBorrowedBooks(email, borrowedBooks);
  } catch (error) {
    return { success: false, error: `Failed to update borrowed books: ${error.message}` };
  }
}

async function updateInventory(id, inventory) {
  await dbConnect();
  try {
    await changeInventory(id, inventory);
  } catch (error) {
    return { success: false, error: `Failed to update borrowed books: ${error.message}` };
  }
}

async function updateBorrowedHistory(email, borrowedHistory) {
  await dbConnect();
  try {
    await changeBorrowedHistory(email, borrowedHistory);
  } catch (error) {
    return { success: false, error: `Error: ${error.message}` };
  }
}


export {
  registerUser,
  getAllBooks2,
  createBook2,
  performLogin,
  getAllUsers2,
  callUpdateUser,
  callChangePassword,
  callChangePhoto,
  callUpdateBook,
  callChangeBookPhoto,
  callDeleteBook,
  updateBorrowedBooks,
  updateIsBorrowed,
  updateInventory,
  updateBorrowedHistory
};