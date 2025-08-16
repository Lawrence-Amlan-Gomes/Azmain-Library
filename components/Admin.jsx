"use client";
import {
  createBook2,
  getAllBooks2,
  callUpdateBook,
  callDeleteBook,
  callChangeBookPhoto,
} from "@/app/actions";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Admin() {
  // State for adding a new book
  const {auth} = useAuth();
  const router = useRouter();
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");
  const [inventory, setInventory] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const [isUploadingNewPhoto, setIsUploadingNewPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [existingBooks, setExistingBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [feedback, setFeedback] = useState("");
  const newPhotoInputRef = useRef(null);

  // State for updating a book
  const [editingBook, setEditingBook] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRating, setEditRating] = useState("");
  const [editInventory, setEditInventory] = useState("");
  const [editPhoto, setEditPhoto] = useState("");
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);
  const editPhotoInputRef = useRef(null);

  // State for table photo uploads
  const [tablePhotoUploading, setTablePhotoUploading] = useState({});
  const tablePhotoRefs = useRef({});

useEffect(() => {
  console.log(auth)
  if(!auth){
    router.push("/login");
  }
}, [auth, router]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const books = await getAllBooks2();
        const plainBooks = Array.isArray(books)
          ? books.map((book) => ({ ...book, id: String(book.id) })) // Ensure id is string
          : [];
        setExistingBooks(plainBooks);
        setFilteredBooks(plainBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
        setFeedback(`Failed to load books: ${error.message}`);
      }
    };
    fetchBooks();
  }, [refreshTrigger]);

  useEffect(() => {
    const filtered = existingBooks.filter((book) =>
      [book.id, book.title, book.author, book.genre].some((field) =>
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredBooks(filtered);
  }, [searchQuery, existingBooks]);

  const validateForm = () => {
    const newErrors = {};
    if (!id) newErrors.id = "Book ID is required";
    else if (isNaN(id) || Number(id) <= 0) newErrors.id = "ID must be a positive number";
    if (!title) newErrors.title = "Title is required";
    if (!author) newErrors.author = "Author is required";
    if (!genre) newErrors.genre = "Genre is required";
    if (!description) newErrors.description = "Description is required";
    if (!rating || isNaN(rating) || Number(rating) < 0 || Number(rating) > 5) {
      newErrors.rating = "Rating must be a number between 0 and 5";
    }
    if (!inventory || isNaN(inventory) || Number(inventory) < 0) {
      newErrors.inventory = "Inventory must be a non-negative number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewPhotoClick = () => {
    if (newPhotoInputRef.current) {
      newPhotoInputRef.current.click();
    }
  };

  const handleNewPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFeedback("Error: Only JPG, JPEG, and PNG files are allowed!");
      return;
    }

    setIsUploadingNewPhoto(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      setNewPhoto(reader.result);
      setIsUploadingNewPhoto(false);
    };
    reader.onerror = () => {
      setFeedback("Error reading image file!");
      setIsUploadingNewPhoto(false);
    };
  };

  const handleNewPhotoDelete = () => {
    setNewPhoto("");
  };

  const submitForm = async () => {
    if (!validateForm()) {
      setFeedback("Please fix the errors in the form");
      return;
    }

    const isDuplicateId = existingBooks.some((book) => book.id === id);
    if (isDuplicateId) {
      setFeedback("A book with this ID already exists!");
      return;
    }

    const bookData = {
      id: String(id), // Ensure id is string
      title,
      author,
      genre,
      description,
      rating: Number(rating) || 0,
      inventory: Number(inventory) || 0,
      photo: newPhoto || "",
      isBorrowed: 0,
    };
    console.log("Submitting book data:", bookData);

    const sureSubmit = confirm("Are you sure to add this book?");
    if (sureSubmit) {
      setIsLoading(true);
      try {
        const registered = await createBook2(bookData);
        console.log("Response from createBook2:", registered);
        if (registered && registered.id) {
          setFeedback("Book added successfully!");
          setId("");
          setTitle("");
          setAuthor("");
          setGenre("");
          setDescription("");
          setRating("");
          setInventory("");
          setNewPhoto("");
          setErrors({});
          setRefreshTrigger((prev) => !prev);
        } else {
          setFeedback("Failed to add book: No ID returned");
        }
      } catch (error) {
        console.error("Error adding book:", error);
        setFeedback(`Error adding book: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const validateEditForm = () => {
    const newErrors = {};
    if (!editTitle) newErrors.editTitle = "Title is required";
    if (!editAuthor) newErrors.editAuthor = "Author is required";
    if (!editGenre) newErrors.editGenre = "Genre is required";
    if (!editDescription) newErrors.editDescription = "Description is required";
    if (
      !editRating ||
      isNaN(editRating) ||
      Number(editRating) < 0 ||
      Number(editRating) > 5
    ) {
      newErrors.editRating = "Rating must be a number between 0 and 5";
    }
    if (!editInventory || isNaN(editInventory) || Number(editInventory) < 0) {
      newErrors.editInventory = "Inventory must be a non-negative number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setEditTitle(book.title || "");
    setEditAuthor(book.author || "");
    setEditGenre(book.genre || "");
    setEditDescription(book.description || "");
    setEditRating(book.rating || "");
    setEditInventory(book.inventory || "");
    setEditPhoto(book.photo || "");
    setErrors({});
  };

  const handleUpdate = async () => {
    if (!editingBook) return;
    if (!validateEditForm()) {
      setFeedback("Please fix the errors in the update form");
      return;
    }

    const sureUpdate = confirm("Are you sure to update this book?");
    if (sureUpdate) {
      try {
        await callUpdateBook(
          String(editingBook.id), // Ensure id is string
          editTitle,
          editAuthor,
          editGenre,
          editDescription,
          Number(editRating) || 0,
          Number(editInventory) || 0,
          editPhoto,
          editingBook.isBorrowed
        );
        setFeedback("Book updated successfully!");
        setEditingBook(null);
        setErrors({});
        setRefreshTrigger((prev) => !prev);
      } catch (error) {
        console.error("Error updating book:", error);
        setFeedback(`Error updating book: ${error.message}`);
      }
    }
  };

  const handleDelete = async (book) => {
    if (book.isBorrowed > 0) {
      setFeedback("Cannot delete a borrowed book!");
      return;
    }

    const sureDelete = confirm("Are you sure to delete this book?");
    if (sureDelete) {
      try {
        await callDeleteBook(String(book.id)); // Ensure id is string
        setFeedback("Book deleted successfully!");
        setRefreshTrigger((prev) => !prev);
      } catch (error) {
        console.error("Error deleting book:", error);
        setFeedback(`Error deleting book: ${error.message}`);
      }
    }
  };

  const handleTablePhotoClick = (bookId) => {
    if (tablePhotoRefs.current[bookId]) {
      tablePhotoRefs.current[bookId].click();
    }
  };

  const handleTablePhotoUpload = (bookId) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFeedback("Error: Only JPG, JPEG, and PNG files are allowed!");
      return;
    }

    setTablePhotoUploading((prev) => ({ ...prev, [bookId]: true }));
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const imageData = reader.result;
      try {
        await callChangeBookPhoto(String(bookId), imageData); // Ensure id is string
        setFeedback("Photo updated successfully!");
        setRefreshTrigger((prev) => !prev);
      } catch (error) {
        console.error("Error uploading photo:", error);
        setFeedback(`Error uploading photo: ${error.message}`);
      } finally {
        setTablePhotoUploading((prev) => ({ ...prev, [bookId]: false }));
      }
    };
    reader.onerror = () => {
      setFeedback("Error reading image file!");
      setTablePhotoUploading((prev) => ({ ...prev, [bookId]: false }));
    };
  };

  const handleTablePhotoDelete = (bookId) => async () => {
    try {
      await callChangeBookPhoto(String(bookId), ""); // Ensure id is string
      setFeedback("Photo deleted successfully!");
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Error deleting photo:", error);
      setFeedback(`Error deleting photo: ${error.message}`);
    }
  };

  const handleEditPhotoClick = () => {
    if (editPhotoInputRef.current) {
      editPhotoInputRef.current.click();
    }
  };

  const handleEditPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFeedback("Error: Only JPG, JPEG, and PNG files are allowed!");
      return;
    }

    setIsUploadingEditPhoto(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const imageData = reader.result;
      setEditPhoto(imageData);
      try {
        await callChangeBookPhoto(String(editingBook.id), imageData); // Ensure id is string
        setFeedback("Photo updated successfully!");
        setRefreshTrigger((prev) => !prev);
      } catch (error) {
        console.error("Error uploading photo:", error);
        setFeedback(`Error uploading photo: ${error.message}`);
      } finally {
        setIsUploadingEditPhoto(false);
      }
    };
    reader.onerror = () => {
      setFeedback("Error reading image file!");
      setIsUploadingEditPhoto(false);
    };
  };

  const handleEditPhotoDelete = async () => {
    if (!editingBook) return;

    try {
      await callChangeBookPhoto(String(editingBook.id), ""); // Ensure id is string
      setEditPhoto("");
      setFeedback("Photo deleted successfully!");
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Error deleting photo:", error);
      setFeedback(`Error deleting photo: ${error.message}`);
    }
  };

  return (
    <div className="bg-white text-gray-800 w-full h-screen p-6 flex flex-col md:flex-row gap-6">
      {/* Left Side: Add New Book */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-[30%] bg-gray-50 p-6 rounded-lg shadow-md overflow-y-auto h-full pb-20"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Add New Book</h2>
        {feedback && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-4 text-sm ${
              feedback.includes("Error") ? "text-red-600" : "text-green-600"
            }`}
          >
            {feedback}
          </motion.p>
        )}
        <div className="space-y-4">
          <div>
            <input
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Book ID (numbers only)"
              min="1"
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.id && (
              <p className="text-red-500 text-sm mt-1">{errors.id}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author"
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.author && (
              <p className="text-red-500 text-sm mt-1">{errors.author}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Genre"
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.genre && (
              <p className="text-red-500 text-sm mt-1">{errors.genre}</p>
            )}
          </div>
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Rating (0-5)"
              min="0"
              max="5"
              step="0.1"
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.rating && (
              <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              placeholder="Inventory"
              min="0"
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.inventory && (
              <p className="text-red-500 text-sm mt-1">{errors.inventory}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={handleNewPhotoClick}
              className="bg-gray-200 w-24 h-36 rounded-md overflow-hidden flex items-center justify-center cursor-pointer"
            >
              {isUploadingNewPhoto ? (
                <div className="w-full h-full flex justify-center items-center text-sm font-semibold text-gray-600">
                  Uploading...
                </div>
              ) : newPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={newPhoto}
                  alt="New book cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex justify-center items-center text-2xl font-semibold text-gray-500">
                  ?
                </div>
              )}
            </motion.div>
            <input
              className="hidden"
              type="file"
              ref={newPhotoInputRef}
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleNewPhotoUpload}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewPhotoClick}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md transition duration-200"
            >
              Upload
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewPhotoDelete}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md transition duration-200"
            >
              Delete
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={submitForm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Create Book"}
          </motion.button>
        </div>
      </motion.div>

      {/* Right Side: Existing Books and Update Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-[70%] flex flex-col h-full overflow-auto pb-20"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Existing Books
        </h2>
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, Title, Author, or Genre"
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-x-auto bg-gray-50 rounded-lg shadow-md">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-blue-100 sticky top-0">
                <th className="border-b border-gray-300 p-3 text-left">ID</th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Title
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Author
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Genre
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Description
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Rating
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Inventory
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Borrowed
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Photo
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="border-b border-gray-300 p-3 text-center text-gray-500"
                  >
                    No books found
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book, index) => (
                  <tr
                    key={`${book.id}-${index}`}
                    className={`hover:bg-blue-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    <td className="border-b border-gray-300 p-3">{book.id}</td>
                    <td className="border-b border-gray-300 p-3">
                      {book.title || "N/A"}
                    </td>
                    <td className="border-b border-gray-300 p-3">
                      {book.author || "N/A"}
                    </td>
                    <td className="border-b border-gray-300 p-3">
                      {book.genre || "N/A"}
                    </td>
                    <td className="border-b border-gray-300 p-3">
                      {book.description || "N/A"}
                    </td>
                    <td className="border-b border-gray-300 p-3">
                      {book.rating ?? "0"}
                    </td>
                    <td className="border-b border-gray-300 p-3">
                      {book.inventory ?? "0"}
                    </td>
                    <td className="border-b border-gray-300 p-3">
                      {book.isBorrowed ? book.isBorrowed : book.isBorrowed}
                    </td>
                    <td className="border-b border-gray-300 p-3">
                      <div className="flex items-center space-x-2">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleTablePhotoClick(book.id)}
                          className="bg-gray-200 w-24 h-20 rounded-md overflow-hidden flex items-center justify-center cursor-pointer"
                        >
                          {tablePhotoUploading[book.id] ? (
                            <div className="w-full h-full flex justify-center items-center text-sm font-semibold text-gray-600">
                              Uploading...
                            </div>
                          ) : book.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={book.photo}
                              alt="Book cover"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex justify-center items-center text-2xl font-semibold text-gray-500">
                              ?
                            </div>
                          )}
                        </motion.div>
                        <input
                          className="hidden"
                          type="file"
                          ref={(el) => (tablePhotoRefs.current[book.id] = el)}
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleTablePhotoUpload(book.id)}
                        />
                        {/* <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTablePhotoClick(book.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded-md transition duration-200"
                        >
                          Upload
                        </motion.button> */}
                        {/* <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleTablePhotoDelete(book.id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded-md transition duration-200"
                        >
                          Delete
                        </motion.button> */}
                      </div>
                    </td>
                    <td className="border-b border-gray-300 p-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(book)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md mr-2 transition duration-200"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(book)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md transition duration-200"
                      >
                        Delete
                      </motion.button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Update Form */}
        {editingBook && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              Update Book: {editingBook.id}
            </h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.editTitle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.editTitle}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  placeholder="Author"
                  className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.editAuthor && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.editAuthor}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                  placeholder="Genre"
                  className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.editGenre && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.editGenre}
                  </p>
                )}
              </div>
              <div>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
                {errors.editDescription && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.editDescription}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  value={editRating}
                  onChange={(e) => setEditRating(e.target.value)}
                  placeholder="Rating (0-5)"
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.editRating && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.editRating}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  value={editInventory}
                  onChange={(e) => setEditInventory(e.target.value)}
                  placeholder="Inventory"
                  min="0"
                  className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.editInventory && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.editInventory}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={handleEditPhotoClick}
                  className="bg-gray-200 w-24 h-20 rounded-md overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {isUploadingEditPhoto ? (
                    <div className="w-full h-full flex justify-center items-center text-sm font-semibold text-gray-600">
                      Uploading...
                    </div>
                  ) : editPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editPhoto}
                      alt="Book cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex justify-center items-center text-2xl font-semibold text-gray-500">
                      ?
                    </div>
                  )}
                </motion.div>
                <input
                  className="hidden"
                  type="file"
                  ref={editPhotoInputRef}
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleEditPhotoUpload}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditPhotoClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md transition duration-200"
                >
                  Upload
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditPhotoDelete}
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md transition duration-200"
                >
                  Delete
                </motion.button>
              </div>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpdate}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                >
                  Update Book
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingBook(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition duration-200"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}