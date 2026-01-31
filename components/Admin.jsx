"use client";

import {
  createBook2,
  getAllBooks2,
  callUpdateBook,
  callDeleteBook,
} from "@/app/actions";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";

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

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
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
    if (!createForm.description.trim()) errors.description = "Description is required";

    const ratingNum = Number(createForm.rating);
    if (!createForm.rating || isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
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
    if (!editForm.description.trim()) errors.description = "Description is required";

    const ratingNum = Number(editForm.rating);
    if (!editForm.rating || isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
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
        editingBook.isBorrowed
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
      .includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin – Book Management</h1>

        {loading && <p className="text-gray-600 mb-4">Loading...</p>}

        {/* CREATE FORM */}
        <div className="border rounded-lg p-6 mb-10 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-5">Add New Book</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">ID</label>
              <input
                type="number"
                name="id"
                value={createForm.id}
                onChange={handleCreateChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unique numeric ID"
              />
              {createErrors.id && <p className="text-red-600 text-sm mt-1">{createErrors.id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                name="title"
                value={createForm.title}
                onChange={handleCreateChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {createErrors.title && <p className="text-red-600 text-sm mt-1">{createErrors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input
                name="author"
                value={createForm.author}
                onChange={handleCreateChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {createErrors.author && <p className="text-red-600 text-sm mt-1">{createErrors.author}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Genre</label>
              <input
                name="genre"
                value={createForm.genre}
                onChange={handleCreateChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {createErrors.genre && <p className="text-red-600 text-sm mt-1">{createErrors.genre}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={createForm.description}
                onChange={handleCreateChange}
                className="w-full border rounded px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {createErrors.description && (
                <p className="text-red-600 text-sm mt-1">{createErrors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rating (0–5)</label>
              <input
                type="number"
                name="rating"
                value={createForm.rating}
                onChange={handleCreateChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {createErrors.rating && <p className="text-red-600 text-sm mt-1">{createErrors.rating}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Inventory</label>
              <input
                type="number"
                name="inventory"
                value={createForm.inventory}
                onChange={handleCreateChange}
                min="0"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {createErrors.inventory && (
                <p className="text-red-600 text-sm mt-1">{createErrors.inventory}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Photo URL (optional)</label>
              <input
                name="photo"
                value={createForm.photo}
                onChange={handleCreateChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>

          <button
            onClick={createBook}
            disabled={loading}
            className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Add Book
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <input
            className="w-full max-w-md border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by ID, title, author, genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* BOOK LIST WITH COVER THUMBNAILS */}
        {filteredBooks.length === 0 ? (
          <p className="text-gray-500 italic">No books found.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="w-full min-w-[1100px] text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 font-semibold w-20">Cover</th>
                  <th className="p-3 font-semibold">ID</th>
                  <th className="p-3 font-semibold">Title</th>
                  <th className="p-3 font-semibold">Author</th>
                  <th className="p-3 font-semibold">Genre</th>
                  <th className="p-3 font-semibold">Stock</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((b) => (
                  <tr key={b.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {b.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.photo}
                          alt={`${b.title} cover`}
                          className="w-16 h-24 object-cover rounded shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/64x96?text=No+Cover";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No cover
                        </div>
                      )}
                    </td>
                    <td className="p-3">{b.id}</td>
                    <td className="p-3 font-medium">{b.title}</td>
                    <td className="p-3">{b.author}</td>
                    <td className="p-3">{b.genre}</td>
                    <td className="p-3">{b.inventory}</td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={() => startEdit(b)}
                        className="text-blue-600 hover:underline mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBook(b)}
                        className="text-red-600 hover:underline disabled:opacity-50"
                        disabled={b.isBorrowed > 0}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── FEEDBACK POPUP ──────────────────────────────────────── */}
      {isFeedbackVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className={`pointer-events-auto transform transition-all duration-300 ease-out
              ${isError ? "bg-red-600" : "bg-green-600"} 
              text-white px-8 py-5 rounded-xl shadow-2xl border border-opacity-30
              max-w-md w-full mx-4 text-center font-medium text-lg
              animate-[fadeIn_0.4s_ease-out]`}
          >
            {feedback}
          </div>
        </div>
      )}

      {/* EDIT MODAL WITH PHOTO PREVIEW */}
      {editingBook && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setEditingBook(null)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Photo preview */}
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-300 shadow-inner">
                    {editForm.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editForm.photo}
                        alt="Book cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300x400?text=Invalid+URL";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        Enter photo URL above
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Live preview</p>
                </div>

                {/* Form fields */}
                <div className="md:w-2/3">
                  <h2 className="text-2xl font-bold mb-6">
                    Edit Book #{editingBook.id}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {editErrors.title && <p className="text-red-600 text-sm mt-1">{editErrors.title}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Author</label>
                      <input
                        name="author"
                        value={editForm.author}
                        onChange={handleEditChange}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {editErrors.author && <p className="text-red-600 text-sm mt-1">{editErrors.author}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Genre</label>
                      <input
                        name="genre"
                        value={editForm.genre}
                        onChange={handleEditChange}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {editErrors.genre && <p className="text-red-600 text-sm mt-1">{editErrors.genre}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Rating (0–5)</label>
                      <input
                        type="number"
                        name="rating"
                        value={editForm.rating}
                        onChange={handleEditChange}
                        min="0"
                        max="5"
                        step="0.1"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {editErrors.rating && <p className="text-red-600 text-sm mt-1">{editErrors.rating}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Inventory</label>
                      <input
                        type="number"
                        name="inventory"
                        value={editForm.inventory}
                        onChange={handleEditChange}
                        min="0"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {editErrors.inventory && (
                        <p className="text-red-600 text-sm mt-1">{editErrors.inventory}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        className="w-full border rounded px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {editErrors.description && (
                        <p className="text-red-600 text-sm mt-1">{editErrors.description}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Photo URL</label>
                      <input
                        name="photo"
                        value={editForm.photo}
                        onChange={handleEditChange}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="https://example.com/cover.jpg or https://..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Paste a direct image link (jpg, png, webp)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setEditingBook(null)}
                  className="bg-gray-600 text-white px-6 py-2.5 rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={updateBook}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2.5 rounded hover:bg-green-700 disabled:opacity-50 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}