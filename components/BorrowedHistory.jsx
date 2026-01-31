"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import colors from "@/app/colors";

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
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Borrowed History</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              className="bg-white border border-[#aaaaaa] rounded-md shadow-sm overflow-hidden flex flex-col h-full"
            >
              <div className="flex flex-1 p-4 gap-4">
                <div className="bg-gray-200 w-20 h-28 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
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

                <div className="flex-1 flex flex-col">
                  <h3 className={`${colors.textKey} text-lg font-semibold mb-1`}>
                    {book?.title || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-600">Book ID: {entry.bookId}</p>
                  <p className="text-sm text-gray-600">Borrowed: {entry.borrowedDate}</p>
                  <p className="text-sm text-gray-600">Expires: {entry.expiresDate}</p>
                  <p className="text-sm text-gray-600 mt-auto">
                    Return:{" "}
                    <span className={isOverdue ? "text-red-600 font-medium" : "text-green-600"}>
                      {entry.return || (returnDate ? returnDate.toLocaleDateString() : "Have to return")}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}