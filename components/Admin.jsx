"use client";

import {
  callDeleteBook,
  callUpdateBook,
  createBook2,
  getAllBooks2,
} from "@/app/actions";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Admin() {
  const { auth } = useAuth();
  const router = useRouter();

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Feedback popup ───────────────────────────────────────
  const [feedback, setFeedback] = useState("");
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isError, setIsError] = useState(false);

  const showFeedback = (message, isError = false) => {
    setFeedback(message);
    setIsError(isError);
    setIsFeedbackVisible(true);

    setTimeout(() => {
      setIsFeedbackVisible(false);
    }, 3500);
  };

  // Create form
  const [createForm, setCreateForm] = useState({
    id: "",
    title: "",
    author: "",
    genre: "",
    description: "",
    rating: "",
    inventory: "",
    photo: "",
  });
  const [createErrors, setCreateErrors] = useState({});

  // Edit modal
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
    rating: "",
    inventory: "",
    photo: "",
  });
  const [editErrors, setEditErrors] = useState({});

  // Scroll lock when modal is open
  useEffect(() => {
    if (!editingBook) return;

    const scrollY = window.pageYOffset;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";
      window.scrollTo(0, scrollY);
    };
  }, [editingBook]);

  // Redirect if not authenticated
  useEffect(() => {
    if (auth === null) {
      router.replace("/login");
    }
  }, [auth, router]);

  // Load books
  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await getAllBooks2();
      const safeBooks = Array.isArray(data)
        ? data.map((b) => ({
            ...b,
            isBorrowed: b.isBorrowed ?? 0,
            photo: b.photo || "",
          }))
        : [];
      setBooks(safeBooks);
    } catch (err) {
      console.error("Failed to load books:", err);
      showFeedback("Could not load books", true);
    } finally {
      setLoading(false);
    }
  };

  // ── CREATE ────────────────────────────────────────────────
  const validateCreate = () => {
    const errors = {};

    if (!createForm.id.trim()) errors.id = "ID is required";
    else if (!/^\d+$/.test(createForm.id)) errors.id = "ID must be a number";
    else if (books.some((b) => b.id === Number(createForm.id))) {
      errors.id = "ID already exists";
    }

    if (!createForm.title.trim()) errors.title = "Title is required";
    if (!createForm.author.trim()) errors.author = "Author is required";
    if (!createForm.genre.trim()) errors.genre = "Genre is required";
    if (!createForm.description.trim())
      errors.description = "Description is required";

    const ratingNum = Number(createForm.rating);
    if (
      !createForm.rating ||
      isNaN(ratingNum) ||
      ratingNum < 0 ||
      ratingNum > 5
    ) {
      errors.rating = "Rating must be 0–5";
    }

    const invNum = Number(createForm.inventory);
    if (!createForm.inventory || isNaN(invNum) || invNum < 0) {
      errors.inventory = "Inventory must be ≥ 0";
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const createBook = async () => {
    if (!validateCreate()) return;

    setLoading(true);

    try {
      await createBook2({
        id: Number(createForm.id),
        title: createForm.title.trim(),
        author: createForm.author.trim(),
        genre: createForm.genre.trim(),
        description: createForm.description.trim(),
        rating: Number(createForm.rating),
        inventory: Number(createForm.inventory),
        photo: createForm.photo.trim() || null,
        isBorrowed: 0,
      });

      showFeedback("Book added successfully ✓");
      setCreateForm({
        id: "",
        title: "",
        author: "",
        genre: "",
        description: "",
        rating: "",
        inventory: "",
        photo: "",
      });
      setCreateErrors({});
      await loadBooks();
    } catch (err) {
      console.error("Create failed:", err);
      showFeedback(err.message || "Failed to add book", true);
    } finally {
      setLoading(false);
    }
  };

  // ── EDIT ──────────────────────────────────────────────────
  const startEdit = (book) => {
    setEditingBook(book);
    setEditForm({
      title: book.title || "",
      author: book.author || "",
      genre: book.genre || "",
      description: book.description || "",
      rating: String(book.rating ?? ""),
      inventory: String(book.inventory ?? ""),
      photo: book.photo || "",
    });
    setEditErrors({});
  };

  const validateEdit = () => {
    const errors = {};

    if (!editForm.title.trim()) errors.title = "Title is required";
    if (!editForm.author.trim()) errors.author = "Author is required";
    if (!editForm.genre.trim()) errors.genre = "Genre is required";
    if (!editForm.description.trim())
      errors.description = "Description is required";

    const ratingNum = Number(editForm.rating);
    if (
      !editForm.rating ||
      isNaN(ratingNum) ||
      ratingNum < 0 ||
      ratingNum > 5
    ) {
      errors.rating = "Rating must be 0–5";
    }

    const invNum = Number(editForm.inventory);
    if (!editForm.inventory || isNaN(invNum) || invNum < 0) {
      errors.inventory = "Inventory must be ≥ 0";
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateBook = async () => {
    if (!editingBook || !validateEdit()) return;

    setLoading(true);

    try {
      await callUpdateBook(
        editingBook.id,
        editForm.title.trim(),
        editForm.author.trim(),
        editForm.genre.trim(),
        editForm.description.trim(),
        Number(editForm.rating),
        Number(editForm.inventory),
        editForm.photo.trim() || null,
        editingBook.isBorrowed,
      );

      showFeedback("Book updated ✓");
      setEditingBook(null);
      await loadBooks();
    } catch (err) {
      console.error("Update failed:", err);
      showFeedback(err.message || "Failed to update book", true);
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────
  const deleteBook = async (book) => {
    if (book.isBorrowed > 0) {
      showFeedback("Cannot delete a borrowed book", true);
      return;
    }

    if (!window.confirm(`Delete "${book.title}" (ID ${book.id})?`)) return;

    setLoading(true);
    try {
      await callDeleteBook(book.id);
      showFeedback("Book deleted ✓");
      await loadBooks();
    } catch (err) {
      console.error("Delete failed:", err);
      showFeedback(err.message || "Failed to delete book", true);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((b) =>
    `${b.id} ${b.title} ${b.author} ${b.genre}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary-200/20 rounded-full blur-3xl animate-bounce-subtle"></div>
        <div
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary-200/20 rounded-full blur-3xl animate-bounce-subtle"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-40 h-40 bg-accent-200/20 rounded-full blur-3xl animate-bounce-subtle"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                Admin – Book Management
              </h1>
              <p className="text-accent-600">
                Manage your library&apos;s book collection
              </p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mr-3"></div>
              <span className="text-accent-600">Loading books...</span>
            </div>
          )}
        </div>

        {/* CREATE FORM */}
        <div className="glass-morphism rounded-3xl shadow-strong p-8 mb-10 border border-white/50">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gradient">Add New Book</h2>
              <p className="text-accent-600">
                Create a new book entry for the library
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-accent-700 mb-2">
                ID
              </label>
              <input
                type="number"
                name="id"
                value={createForm.id}
                onChange={handleCreateChange}
                className="input-field"
                placeholder="Unique numeric ID"
              />
              {createErrors.id && (
                <p className="text-secondary-600 text-sm mt-1">
                  {createErrors.id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent-700 mb-2">
                Title
              </label>
              <input
                name="title"
                value={createForm.title}
                onChange={handleCreateChange}
                className="input-field"
                placeholder="Enter book title"
              />
              {createErrors.title && (
                <p className="text-secondary-600 text-sm mt-1">
                  {createErrors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent-700 mb-2">
                Author
              </label>
              <input
                name="author"
                value={createForm.author}
                onChange={handleCreateChange}
                className="input-field"
                placeholder="Enter author name"
              />
              {createErrors.author && (
                <p className="text-secondary-600 text-sm mt-1">
                  {createErrors.author}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent-700 mb-2">
                Genre
              </label>
              <input
                name="genre"
                value={createForm.genre}
                onChange={handleCreateChange}
                className="input-field"
                placeholder="Enter book genre"
              />
              {createErrors.genre && (
                <p className="text-secondary-600 text-sm mt-1">
                  {createErrors.genre}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-accent-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={createForm.description}
                onChange={handleCreateChange}
                className="input-field h-32 resize-none"
                placeholder="Enter book description"
              />
              {createErrors.description && (
                <p className="text-secondary-600 text-sm mt-1">
                  {createErrors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent-700 mb-2">
                Rating (0–5)
              </label>
              <input
                type="number"
                name="rating"
                value={createForm.rating}
                onChange={handleCreateChange}
                min="0"
                max="5"
                step="0.1"
                className="input-field"
                placeholder="0.0 - 5.0"
              />
              {createErrors.rating && (
                <p className="text-secondary-600 text-sm mt-1">
                  {createErrors.rating}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent-700 mb-2">
                Inventory
              </label>
              <input
                type="number"
                name="inventory"
                value={createForm.inventory}
                onChange={handleCreateChange}
                min="0"
                className="input-field"
                placeholder="Number of copies"
              />
              {createErrors.inventory && (
                <p className="text-secondary-600 text-sm mt-1">
                  {createErrors.inventory}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-accent-700 mb-2">
                Photo URL (optional)
              </label>
              <input
                name="photo"
                value={createForm.photo}
                onChange={handleCreateChange}
                className="input-field"
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>

          <button
            onClick={createBook}
            disabled={loading}
            className="mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adding Book...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Book
              </>
            )}
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <div className="glass-morphism rounded-2xl shadow-soft p-4 max-w-2xl mx-auto">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-accent-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                className="input-field border-0 bg-transparent focus:ring-0 text-base"
                placeholder="Search by ID, title, author, genre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* BOOK LIST WITH COVER THUMBNAILS */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-accent-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-accent-900 mb-2">
              No books found
            </h3>
            <p className="text-accent-600">
              Try adjusting your search criteria or add new books to the library
            </p>
          </div>
        ) : (
          <div className="glass-morphism rounded-3xl shadow-strong border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-accent-50 border-b border-accent-200">
                  <tr>
                    <th className="p-4 font-semibold text-accent-900 w-24">
                      Cover
                    </th>
                    <th className="p-4 font-semibold text-accent-900">ID</th>
                    <th className="p-4 font-semibold text-accent-900">Title</th>
                    <th className="p-4 font-semibold text-accent-900">
                      Author
                    </th>
                    <th className="p-4 font-semibold text-accent-900">Genre</th>
                    <th className="p-4 font-semibold text-accent-900">Stock</th>
                    <th className="p-4 font-semibold text-accent-900 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((b, index) => (
                    <tr
                      key={b.id}
                      className="border-b border-accent-100 hover:bg-accent-50/50 transition-colors duration-200"
                    >
                      <td className="p-4">
                        <div className="w-16 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-lg overflow-hidden shadow-soft">
                          {b.photo ? (
                            <img
                              src={b.photo}
                              alt={`${b.title} cover`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/64x96?text=No+Cover";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-accent-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 bg-accent-100 text-accent-700 rounded-lg text-sm font-medium">
                          {b.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-accent-900">
                          {b.title}
                        </div>
                      </td>
                      <td className="p-4 text-accent-700">{b.author}</td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-accent-100 to-primary-100 text-accent-700 rounded-lg text-sm font-medium">
                          {b.genre}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              b.inventory > 5
                                ? "bg-green-500"
                                : b.inventory > 0
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          ></div>
                          <span
                            className={`font-medium ${
                              b.inventory > 5
                                ? "text-green-700"
                                : b.inventory > 0
                                  ? "text-yellow-700"
                                  : "text-red-700"
                            }`}
                          >
                            {b.inventory}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => startEdit(b)}
                            className="btn-secondary text-sm px-3 py-1.5 flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => deleteBook(b)}
                            className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-200 flex items-center"
                            disabled={b.isBorrowed > 0}
                            title={
                              b.isBorrowed > 0
                                ? "Cannot delete book that is currently borrowed"
                                : "Delete book"
                            }
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── FEEDBACK POPUP ──────────────────────────────────────── */}
      {isFeedbackVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className={`pointer-events-auto transform transition-all duration-300 ease-out glass-morphism rounded-2xl shadow-strong p-6 max-w-md w-full mx-4 text-center border border-white/50 ${
              isError
                ? "bg-secondary-50 border-secondary-200"
                : "bg-primary-50 border-primary-200"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isError ? "bg-secondary-100" : "bg-primary-100"
              }`}
            >
              {isError ? (
                <svg
                  className="w-6 h-6 text-secondary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <p
              className={`text-lg font-semibold ${
                isError ? "text-secondary-700" : "text-primary-700"
              }`}
            >
              {feedback}
            </p>
          </div>
        </div>
      )}

      {/* EDIT MODAL WITH PHOTO PREVIEW */}
      {editingBook && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setEditingBook(null)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="glass-morphism rounded-3xl shadow-strong p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto pointer-events-auto border border-white/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gradient">
                      Edit Book #{editingBook.id}
                    </h2>
                    <p className="text-accent-600">
                      Update book information and details
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingBook(null)}
                  className="text-accent-400 hover:text-accent-600 transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Photo preview */}
                <div className="lg:w-1/3">
                  <div className="sticky top-8">
                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl overflow-hidden border border-accent-200 shadow-soft">
                      {editForm.photo ? (
                        <img
                          src={editForm.photo}
                          alt="Book cover preview"
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/300x400?text=Invalid+URL";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-accent-500">
                          <svg
                            className="w-16 h-16 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-sm font-medium">
                            Enter photo URL above
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-accent-600 mt-3 text-center">
                      Live preview
                    </p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="lg:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-accent-700 mb-2">
                        Title
                      </label>
                      <input
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                        className="input-field"
                        placeholder="Enter book title"
                      />
                      {editErrors.title && (
                        <p className="text-secondary-600 text-sm mt-1">
                          {editErrors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-accent-700 mb-2">
                        Author
                      </label>
                      <input
                        name="author"
                        value={editForm.author}
                        onChange={handleEditChange}
                        className="input-field"
                        placeholder="Enter author name"
                      />
                      {editErrors.author && (
                        <p className="text-secondary-600 text-sm mt-1">
                          {editErrors.author}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-accent-700 mb-2">
                        Genre
                      </label>
                      <input
                        name="genre"
                        value={editForm.genre}
                        onChange={handleEditChange}
                        className="input-field"
                        placeholder="Enter book genre"
                      />
                      {editErrors.genre && (
                        <p className="text-secondary-600 text-sm mt-1">
                          {editErrors.genre}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-accent-700 mb-2">
                        Rating (0–5)
                      </label>
                      <input
                        type="number"
                        name="rating"
                        value={editForm.rating}
                        onChange={handleEditChange}
                        min="0"
                        max="5"
                        step="0.1"
                        className="input-field"
                        placeholder="0.0 - 5.0"
                      />
                      {editErrors.rating && (
                        <p className="text-secondary-600 text-sm mt-1">
                          {editErrors.rating}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-accent-700 mb-2">
                        Inventory
                      </label>
                      <input
                        type="number"
                        name="inventory"
                        value={editForm.inventory}
                        onChange={handleEditChange}
                        min="0"
                        className="input-field"
                        placeholder="Number of copies"
                      />
                      {editErrors.inventory && (
                        <p className="text-secondary-600 text-sm mt-1">
                          {editErrors.inventory}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-accent-700 mb-2">
                        Photo URL
                      </label>
                      <input
                        name="photo"
                        value={editForm.photo}
                        onChange={handleEditChange}
                        className="input-field"
                        placeholder="https://example.com/cover.jpg"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-accent-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        className="input-field h-32 resize-none"
                        placeholder="Enter book description"
                      />
                      {editErrors.description && (
                        <p className="text-secondary-600 text-sm mt-1">
                          {editErrors.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-8">
                    <button
                      onClick={() => setEditingBook(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateBook}
                      disabled={loading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Update Book
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
