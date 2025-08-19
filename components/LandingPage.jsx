/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllBooks2 } from "@/app/actions";
import { motion } from "framer-motion";
import EachBookCard from "./EachBookCard";

export default function LandingPage() {
  const router = useRouter();
  const { auth, setAllBooks, allBooks } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedBooks, setSearchedBooks] = useState(allBooks || []); // Initialize with allBooks
  const [loading, setLoading] = useState(!allBooks || allBooks.length === 0); // Only load if allBooks is empty
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if allBooks is empty
    if (!allBooks || allBooks.length === 0) {
      const fetchBooks = async () => {
        try {
          const books = await getAllBooks2();
          const plainBooks = Array.isArray(books)
            ? books.map((book) => ({ ...book }))
            : [];
          setAllBooks(plainBooks); // Update context
          setSearchedBooks(plainBooks); // Initialize searchedBooks
        } catch (err) {
          setError(`Failed to load books: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      fetchBooks();
    } else {
      // If allBooks is already populated, use it for searchedBooks
      setSearchedBooks(allBooks);
      setLoading(false);
    }
  }, [setAllBooks]); // Only depend on setAllBooks

  useEffect(() => {
    const filtered = allBooks.filter((book) =>
      [book.id?.toString(), book.title, book.author, book.genre].some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setSearchedBooks(filtered); // Update searchedBooks state
  }, [searchTerm, allBooks]);

  return (
    <div className="bg-white text-gray-800 min-h-screen py-4 sm:py-6 h-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 ml-4">
        Book Library
      </h1>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-red-600 text-sm ml-4"
        >
          {error}
        </motion.p>
      )}
      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by ID, Title, Author, or Genre"
          className="w-full max-w-md p-2 sm:p-3 rounded-md border ml-4 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {loading ? (
        <p className="text-gray-500 pl-4">Loading books...</p>
      ) : searchedBooks.length === 0 ? (
        <p className="text-gray-500 pl-4">No books found</p>
      ) : (
        <div className="w-full h-full overflow-y-auto relative pb-[200px]">
          {searchedBooks.map((book) => (
            <EachBookCard key={`${book.id}`} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}