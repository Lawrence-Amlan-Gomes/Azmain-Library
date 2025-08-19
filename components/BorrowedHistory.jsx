"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BorrowedHistory() {
  const { auth, allBooks } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      router.push("/login");
    }
  }, [auth, router]);

  if (!auth || !Array.isArray(auth.borrowedHistory) || auth.borrowedHistory.length === 0) {
    return (
      <div className="bg-white text-gray-800 w-full h-full min-h-screen p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Borrowed History</h2>
        <p className="text-gray-500">No borrowing history available</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-800 w-full h-full min-h-screen p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Borrowed History</h2>
      <div className="w-full">
        {auth.borrowedHistory.map((entry, index) => {
          const book = allBooks.find((b) => b.id === entry.bookId);
          // Parse dates for comparison
          const expiresDate = new Date(entry.expiresDate);
          const returnDate = entry.returnDate ? new Date(entry.returnDate) : null;
          // Determine if the book is overdue
          const isOverdue = returnDate ? returnDate > expiresDate : new Date() > expiresDate;

          return (
            <motion.div
              key={`${entry.bookId}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="float-left w-[calc(25%-1rem)] mx-2 mb-4 bg-white p-3 border-[1px] border-[#aaaaaa] rounded-md shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gray-200 w-16 h-24 rounded-md overflow-hidden flex items-center justify-center">
                  {book?.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.photo}
                      alt="Book cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex justify-center items-center text-xl font-semibold text-gray-500">
                      ?
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{book?.title || "N/A"}</h3>
                  <p className="text-sm text-gray-600">Book ID: {entry.bookId}</p>
                  <p className="text-sm text-gray-600">Borrowed: {entry.borrowedDate}</p>
                  <p className="text-sm text-gray-600">Expires: {entry.expiresDate}</p>
                  <p className="text-sm text-gray-600">
                    Return:{" "}
                    <span className={isOverdue ? "text-red-600" : "text-green-600"}>
                      {entry.return || (returnDate ? returnDate.toLocaleDateString() : "Have to return")}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
        <div className="clear-both"></div>
      </div>
    </div>
  );
}