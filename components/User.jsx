"use client";
import { updateIsBorrowed, updateBorrowedBooks, updateInventory, updateBorrowedHistory } from "@/app/actions";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import colors from "@/app/colors";

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
      const borrowed = Array.isArray(auth.borrowedBooks) ? auth.borrowedBooks : [];
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
          0
        );
        const fine = daysOverdue * 100;
        console.log(`Calculated fine for ${borrowedDate}: ${fine} TK (Days overdue: ${daysOverdue})`);
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
      console.error("Borrow failed: auth, book missing, or operation in progress", { auth, book, isLoading });
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
      setAuth({ ...auth, borrowedBooks: newBorrowedBooks, borrowedHistory: newBorrowedHistory });
      const updatedBook = { ...book, isBorrowed: newIsBorrowed, inventory: newInventory };
      setBook(updatedBook);
      setAllBooks(
        allBooks.map((b) => (b.id === book.id ? updatedBook : b))
      );

      // Call server actions to update database
      await updateBorrowedBooks(auth.email, newBorrowedBooks);
      await updateIsBorrowed(book.id, newIsBorrowed);
      await updateInventory(book.id, newInventory);
      try {
        const historyResult = await updateBorrowedHistory(auth.email, newBorrowedHistory);
        if (historyResult?.success === false) {
          console.error("Failed to update borrowedHistory:", historyResult.error);
          setFeedback(`Borrowed book, but failed to update history: ${historyResult.error}`);
          return;
        }
      } catch (historyError) {
        console.error("Failed to update borrowedHistory:", historyError);
        setFeedback(`Borrowed book, but failed to update history: ${historyError.message}`);
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
      console.error("Return failed: auth, book missing, or operation in progress", { auth, book, isLoading });
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
        (borrowed) => borrowed.bookId !== book.id
      );
      const newIsBorrowed = Math.max((book.isBorrowed || 0) - 1, 0);
      const newInventory = (book.inventory || 0) + 1;
      const newBorrowedHistory = Array.isArray(auth.borrowedHistory)
        ? auth.borrowedHistory.map((entry) =>
            entry.bookId === book.id && entry.return === "Have to return"
              ? { ...entry, return: currentDate }
              : entry
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
      setAuth({ ...auth, borrowedBooks: updatedBorrowedBooks, borrowedHistory: newBorrowedHistory });
      const updatedBook = { ...book, isBorrowed: newIsBorrowed, inventory: newInventory };
      setBook(updatedBook);
      setAllBooks(
        allBooks.map((b) => (b.id === book.id ? updatedBook : b))
      );

      // Call server actions to update database
      await updateBorrowedBooks(auth.email, updatedBorrowedBooks);
      await updateIsBorrowed(book.id, newIsBorrowed);
      await updateInventory(book.id, newInventory);
      try {
        const historyResult = await updateBorrowedHistory(auth.email, newBorrowedHistory);
        if (historyResult?.success === false) {
          console.error("Failed to update borrowedHistory:", historyResult.error);
          setFeedback(`Returned book, but failed to update history: ${historyResult.error}`);
          return;
        }
      } catch (historyError) {
        console.error("Failed to update borrowedHistory:", historyError);
        setFeedback(`Returned book, but failed to update history: ${historyError.message}`);
        return;
      }

      setFeedback("Book returned successfully!");
      setShowPopup(updatedBorrowedBooks.some((borrowedBook) => calculateFine(borrowedBook.borrowedDate) > 0));
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

  const expiredBooks = borrowedBooks.filter((borrowedBook) => calculateFine(borrowedBook.borrowedDate) > 0);

  return (
    <div className="bg-white text-gray-800 w-full h-full min-h-screen p-6 flex flex-col md:flex-row gap-6 overflow-auto pb-20 relative">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-[70%] bg-gray-50 p-6 rounded-lg shadow-md overflow-y-auto"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Book Details</h2>
        {feedback && (
          <p className={`text-sm ${feedback.includes("Failed") ? "text-red-600" : "text-green-600"} mb-4`}>
            {feedback}
          </p>
        )}
        {book ? (
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-200 w-40 h-60 rounded-md overflow-hidden flex items-center justify-center"
            >
              {book.photo ? (
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
            <div>
              <h3 className={`text-xl font-semibold`}>Title</h3>
              <p>{book.title || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Genre</h3>
              <p>{book.genre || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Author</h3>
              <p>{book.author || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Description</h3>
              <p>{book.description || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Rating</h3>
              <p>{book.rating ?? "0"}</p>
            </div>
            {canBorrow ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBorrow}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Borrowing..." : "Borrow Book"}
              </motion.button>
            ) : (
              <p className="text-red-600">
                {borrowedBooks.length >= 3
                  ? "Maximum book borrow limit (3) has reached"
                  : book?.inventory <= 0 && borrowedBooks.length < 3
                  ? "No more books in the stock"
                  : ""}
              </p>
            )}
            {isBookBorrowed && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReturn}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Returning..." : "Return Book"}
              </motion.button>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No book selected</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-[30%] bg-gray-50 p-6 rounded-lg shadow-md overflow-auto"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Borrowed Books
        </h2>
        {!(Array.isArray(borrowedBooks) && borrowedBooks.length > 0) ? (
          <p className="text-gray-500">No books borrowed</p>
        ) : (
          <div className="space-y-4">
            {borrowedBooks.map((borrowedBook, index) => (
              <motion.div
                key={`${borrowedBook.bookId}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center space-x-4 bg-white p-3 rounded-md shadow-sm cursor-pointer"
                onClick={() => handleBookSelect(borrowedBook.bookId)}
              >
                <div className="bg-gray-200 w-16 h-24 rounded-md overflow-hidden flex items-center justify-center">
                  {borrowedBook.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={borrowedBook.photo}
                      alt="Borrowed book cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex justify-center items-center text-xl font-semibold text-gray-500">
                      ?
                    </div>
                  )}
                </div>
                <div>
                  <h3 className={`${colors.textKey} text-lg font-semibold`}>
                    {borrowedBook.title || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Borrowed: {borrowedBook.borrowedDate || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Expires: {getExpireDate(borrowedBook.borrowedDate) || "N/A"}
                  </p>
                  {calculateFine(borrowedBook.borrowedDate) > 0 && (
                    <p className="text-sm text-red-600">
                      Your expire fine is {calculateFine(borrowedBook.borrowedDate)} TK
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showPopup && expiredBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm w-full z-50"
          >
            <button
              onClick={handleClosePopup}
              className="absolute top-2 right-2 text-white hover:text-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-2">Overdue Books</h3>
            <ul className="space-y-2">
              {expiredBooks.map((book, index) => (
                <li key={`${book.bookId}-${index}`} className="text-sm">
                  <span className="font-medium">{book.title || "N/A"}</span>
                  <br />
                  Expired on: {getExpireDate(book.borrowedDate) || "N/A"}
                  <br />
                  Fine: {calculateFine(book.borrowedDate)} TK
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}