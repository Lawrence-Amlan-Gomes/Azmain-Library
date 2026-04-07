"use client";
import {
  updateBorrowedBooks,
  updateBorrowedHistory,
  updateInventory,
  updateIsBorrowed,
} from "@/app/actions";
import { useAuth } from "@/app/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function User() {
  const router = useRouter();
  const { auth, setAuth, book, setBook, allBooks, setAllBooks } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!auth) {
      router.push("/login");
    } else {
      const borrowed = Array.isArray(auth.borrowedBooks)
        ? auth.borrowedBooks
        : [];
      setBorrowedBooks(borrowed);
      console.log("Initialized borrowedBooks:", borrowed);
      console.log("Initialized borrowedHistory:", auth.borrowedHistory || []);
      console.log("auth.email:", auth.email);

      // Check for expired books and show popup if any
      const hasExpiredBooks = borrowed.some((borrowedBook) => {
        const fine = calculateFine(borrowedBook.borrowedDate);
        return fine > 0;
      });
      setShowPopup(hasExpiredBooks);
    }
    setIsCheckingAuth(false);
  }, [auth, router]);

  const getExpireDate = (borrowedDate) => {
    try {
      const date = Date.parse(borrowedDate);
      if (!isNaN(date)) {
        const expire = new Date(date + 7 * 24 * 60 * 60 * 1000);
        return expire.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
      }
      console.error(`Invalid borrowedDate: ${borrowedDate}`);
      return "Invalid Date";
    } catch (error) {
      console.error(`Error parsing borrowedDate: ${borrowedDate}`, error);
      return "Invalid Date";
    }
  };

  const calculateFine = (borrowedDate) => {
    try {
      const borrowDate = Date.parse(borrowedDate);
      if (!isNaN(borrowDate)) {
        const expireDate = new Date(borrowDate + 7 * 24 * 60 * 60 * 1000);
        const currentDate = new Date();
        const daysOverdue = Math.max(
          Math.floor((currentDate - expireDate) / (1000 * 60 * 60 * 24)),
          0,
        );
        const fine = daysOverdue * 100;
        console.log(
          `Calculated fine for ${borrowedDate}: ${fine} TK (Days overdue: ${daysOverdue})`,
        );
        return fine;
      }
      console.error(`Invalid borrowDate: ${borrowedDate}`);
      return 0;
    } catch (error) {
      console.error(`Error calculating fine for ${borrowedDate}`, error);
      return 0;
    }
  };

  const handleBorrow = async () => {
    if (!auth || !book || isLoading) {
      console.error(
        "Borrow failed: auth, book missing, or operation in progress",
        { auth, book, isLoading },
      );
      setFeedback("Cannot borrow: Missing data or operation in progress");
      return;
    }
    if (!auth.email) {
      console.error("Borrow failed: auth.email is missing", { auth });
      setFeedback("Cannot borrow: User email is missing");
      return;
    }
    setIsLoading(true);
    setFeedback("");
    try {
      const currentDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      const newBorrowedBook = {
        bookId: book.id,
        borrowedDate: currentDate,
        title: book.title || "N/A",
        photo: book.photo || "",
      };
      const newBorrowedBooks = [...borrowedBooks, newBorrowedBook];
      const newIsBorrowed = (book.isBorrowed || 0) + 1;
      const newInventory = (book.inventory || 0) - 1;
      const newBorrowedHistory = Array.isArray(auth.borrowedHistory)
        ? [
            ...auth.borrowedHistory,
            {
              bookId: book.id,
              borrowedDate: currentDate,
              expiresDate: getExpireDate(currentDate),
              return: "Have to return",
            },
          ]
        : [
            {
              bookId: book.id,
              borrowedDate: currentDate,
              expiresDate: getExpireDate(currentDate),
              return: "Have to return",
            },
          ];

      // Log data before sending to server
      console.log("Borrow: Updating state and database", {
        email: auth.email,
        newBorrowedBooks,
        newBorrowedHistory,
        bookId: book.id,
        newIsBorrowed,
        newInventory,
      });

      // Update frontend state
      setBorrowedBooks(newBorrowedBooks);
      setAuth({
        ...auth,
        borrowedBooks: newBorrowedBooks,
        borrowedHistory: newBorrowedHistory,
      });
      const updatedBook = {
        ...book,
        isBorrowed: newIsBorrowed,
        inventory: newInventory,
      };
      setBook(updatedBook);
      setAllBooks(allBooks.map((b) => (b.id === book.id ? updatedBook : b)));

      // Call server actions to update database
      await updateBorrowedBooks(auth.email, newBorrowedBooks);
      await updateIsBorrowed(book.id, newIsBorrowed);
      await updateInventory(book.id, newInventory);
      try {
        const historyResult = await updateBorrowedHistory(
          auth.email,
          newBorrowedHistory,
        );
        if (historyResult?.success === false) {
          console.error(
            "Failed to update borrowedHistory:",
            historyResult.error,
          );
          setFeedback(
            `Borrowed book, but failed to update history: ${historyResult.error}`,
          );
          return;
        }
      } catch (historyError) {
        console.error("Failed to update borrowedHistory:", historyError);
        setFeedback(
          `Borrowed book, but failed to update history: ${historyError.message}`,
        );
        return;
      }

      setFeedback("Book borrowed successfully!");
    } catch (error) {
      console.error("Unexpected error in handleBorrow:", error);
      setFeedback(`Failed to borrow book: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!auth || !book || isLoading) {
      console.error(
        "Return failed: auth, book missing, or operation in progress",
        { auth, book, isLoading },
      );
      setFeedback("Cannot return: Missing data or operation in progress");
      return;
    }
    if (!auth.email) {
      console.error("Return failed: auth.email is missing", { auth });
      setFeedback("Cannot return: User email is missing");
      return;
    }
    setIsLoading(true);
    setFeedback("");
    try {
      const currentDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      const updatedBorrowedBooks = borrowedBooks.filter(
        (borrowed) => borrowed.bookId !== book.id,
      );
      const newIsBorrowed = Math.max((book.isBorrowed || 0) - 1, 0);
      const newInventory = (book.inventory || 0) + 1;
      const newBorrowedHistory = Array.isArray(auth.borrowedHistory)
        ? auth.borrowedHistory.map((entry) =>
            entry.bookId === book.id && entry.return === "Have to return"
              ? { ...entry, return: currentDate }
              : entry,
          )
        : [];

      // Log data before sending to server
      console.log("Return: Updating state and database", {
        email: auth.email,
        updatedBorrowedBooks,
        newBorrowedHistory,
        bookId: book.id,
        newIsBorrowed,
        newInventory,
      });

      // Update frontend state
      setBorrowedBooks(updatedBorrowedBooks);
      setAuth({
        ...auth,
        borrowedBooks: updatedBorrowedBooks,
        borrowedHistory: newBorrowedHistory,
      });
      const updatedBook = {
        ...book,
        isBorrowed: newIsBorrowed,
        inventory: newInventory,
      };
      setBook(updatedBook);
      setAllBooks(allBooks.map((b) => (b.id === book.id ? updatedBook : b)));

      // Call server actions to update database
      await updateBorrowedBooks(auth.email, updatedBorrowedBooks);
      await updateIsBorrowed(book.id, newIsBorrowed);
      await updateInventory(book.id, newInventory);
      try {
        const historyResult = await updateBorrowedHistory(
          auth.email,
          newBorrowedHistory,
        );
        if (historyResult?.success === false) {
          console.error(
            "Failed to update borrowedHistory:",
            historyResult.error,
          );
          setFeedback(
            `Returned book, but failed to update history: ${historyResult.error}`,
          );
          return;
        }
      } catch (historyError) {
        console.error("Failed to update borrowedHistory:", historyError);
        setFeedback(
          `Returned book, but failed to update history: ${historyError.message}`,
        );
        return;
      }

      setFeedback("Book returned successfully!");
      setShowPopup(
        updatedBorrowedBooks.some(
          (borrowedBook) => calculateFine(borrowedBook.borrowedDate) > 0,
        ),
      );
    } catch (error) {
      console.error("Unexpected error in handleReturn:", error);
      setFeedback(`Failed to return book: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSelect = (bookId) => {
    const selectedBook = allBooks.find((b) => b.id === bookId);
    if (selectedBook) {
      setBook(selectedBook);
      console.log("Selected book:", selectedBook);
    } else {
      console.error("Book not found in allBooks:", bookId);
    }
  };

  const isBookBorrowed =
    Array.isArray(borrowedBooks) &&
    borrowedBooks.some((borrowed) => borrowed.bookId === book?.id);
  const canBorrow =
    Array.isArray(borrowedBooks) &&
    borrowedBooks.length < 3 &&
    !isBookBorrowed &&
    book?.inventory > 0;

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (isCheckingAuth || !auth) {
    return null;
  }

  const expiredBooks = borrowedBooks.filter(
    (borrowedBook) => calculateFine(borrowedBook.borrowedDate) > 0,
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Book Details Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-[65%]"
          >
            <div className="glass-morphism rounded-3xl shadow-strong p-8 border border-white/50">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gradient">
                    Book Details
                  </h1>
                  <p className="text-accent-600">
                    Complete information about the selected book
                  </p>
                </div>
              </div>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl border ${
                    feedback.includes("Failed") || feedback.includes("Cannot")
                      ? "bg-secondary-50 border-secondary-200 text-secondary-700"
                      : "bg-primary-50 border-primary-200 text-primary-700"
                  }`}
                >
                  <p className="font-medium">{feedback}</p>
                </motion.div>
              )}

              {book ? (
                <div className="space-y-8">
                  {/* Book Cover and Basic Info */}
                  <div className="flex flex-col md:flex-row gap-8">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0"
                    >
                      <div className="relative group">
                        <div className="w-48 h-72 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl overflow-hidden shadow-soft">
                          {book.photo ? (
                            <img
                              src={book.photo}
                              alt="Book cover"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex justify-center items-center">
                              <div className="text-center">
                                <svg
                                  className="w-16 h-16 text-accent-400 mx-auto mb-2"
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
                                <p className="text-accent-500 font-medium">
                                  No Cover
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              book.inventory > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {book.inventory > 0
                              ? `In Stock (${book.inventory})`
                              : "Out of Stock"}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <div className="flex-1 space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-accent-600 mb-2">
                          Title
                        </h3>
                        <p className="text-2xl font-bold text-accent-900">
                          {book.title || "N/A"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-accent-600 mb-2">
                            Genre
                          </h3>
                          <div className="inline-block px-3 py-1 bg-gradient-to-r from-accent-100 to-primary-100 text-accent-700 rounded-lg text-sm font-medium">
                            {book.genre || "N/A"}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-accent-600 mb-2">
                            Author
                          </h3>
                          <p className="text-lg font-semibold text-accent-900">
                            {book.author || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-accent-600 mb-2">
                          Rating
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${
                                  i < Math.floor(book.rating || 0)
                                    ? "text-yellow-400"
                                    : "text-accent-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-accent-900">
                            {book.rating || "0"}/5.0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-accent-600 mb-2">
                      Description
                    </h3>
                    <p className="text-accent-800 leading-relaxed">
                      {book.description ||
                        "No description available for this book."}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {canBorrow ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBorrow}
                        className="btn-primary flex items-center justify-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
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
                            Borrow Book
                          </>
                        )}
                      </motion.button>
                    ) : (
                      <div className="w-full p-4 bg-secondary-50 border border-secondary-200 rounded-xl">
                        <p className="text-secondary-700 font-medium text-center">
                          {borrowedBooks.length >= 3
                            ? "Maximum book borrow limit (3) has reached"
                            : book?.inventory <= 0 && borrowedBooks.length < 3
                              ? "No more books in stock"
                              : "Book not available for borrowing"}
                        </p>
                      </div>
                    )}

                    {isBookBorrowed && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReturn}
                        className="btn-secondary flex items-center justify-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-700 mr-2"></div>
                            Processing...
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
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Return Book
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              ) : (
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
                    No book selected
                  </h3>
                  <p className="text-accent-600">
                    Please select a book from the library to view details
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Borrowed Books Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-[35%]"
          >
            <div className="glass-morphism rounded-3xl shadow-strong p-6 border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gradient">
                      Borrowed Books
                    </h2>
                    <p className="text-accent-600 text-sm">
                      {borrowedBooks.length}/3 books borrowed
                    </p>
                  </div>
                </div>
                <div className="text-accent-600 text-sm font-medium">
                  {borrowedBooks.length}/3
                </div>
              </div>

              {!(Array.isArray(borrowedBooks) && borrowedBooks.length > 0) ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  <h3 className="text-lg font-semibold text-accent-900 mb-2">
                    No books borrowed
                  </h3>
                  <p className="text-accent-600 text-sm">
                    Start borrowing books to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {borrowedBooks.map((borrowedBook, index) => (
                    <motion.div
                      key={`${borrowedBook.bookId}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="glass-morphism rounded-xl p-4 cursor-pointer hover:shadow-medium transition-all duration-300 hover:scale-105 border border-white/30"
                      onClick={() => handleBookSelect(borrowedBook.bookId)}
                    >
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-lg overflow-hidden">
                            {borrowedBook.photo ? (
                              <img
                                src={borrowedBook.photo}
                                alt="Borrowed book cover"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex justify-center items-center">
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
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-accent-900 truncate">
                            {borrowedBook.title || "N/A"}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-sm text-accent-600">
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
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              Borrowed: {borrowedBook.borrowedDate || "N/A"}
                            </div>
                            <div className="flex items-center text-sm text-accent-600">
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
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Expires:{" "}
                              {getExpireDate(borrowedBook.borrowedDate) ||
                                "N/A"}
                            </div>
                            {calculateFine(borrowedBook.borrowedDate) > 0 && (
                              <div className="flex items-center text-sm font-medium text-secondary-600">
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
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c1.11 0 2.08-.402 2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Fine: {calculateFine(borrowedBook.borrowedDate)}{" "}
                                TK
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fine Popup */}
      <AnimatePresence>
        {showPopup && expiredBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 glass-morphism rounded-2xl shadow-strong p-6 max-w-sm w-full z-50 border border-white/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center mr-3">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c1.11 0 2.08-.402 2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-accent-900">
                    Overdue Books
                  </h3>
                  <p className="text-sm text-accent-600">
                    You have books that need to be returned
                  </p>
                </div>
              </div>
              <button
                onClick={handleClosePopup}
                className="text-accent-400 hover:text-accent-600 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
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
            <div className="space-y-2">
              {expiredBooks.map((book, index) => (
                <div key={index} className="text-sm text-accent-700">
                  <span className="font-medium">{book.title}</span> - Fine:{" "}
                  {calculateFine(book.borrowedDate)} TK
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
