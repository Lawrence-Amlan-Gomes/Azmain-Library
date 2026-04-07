/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { getAllBooks2 } from "@/app/actions";
import { useAuth } from "@/app/hooks/useAuth";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EachBookCard from "./EachBookCard";

export default function LandingPage() {
  const router = useRouter();
  const { auth, setAllBooks, allBooks } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedBooks, setSearchedBooks] = useState(allBooks || []);
  const [loading, setLoading] = useState(!allBooks || allBooks.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!allBooks || allBooks.length === 0) {
      const fetchBooks = async () => {
        try {
          const books = await getAllBooks2();
          const plainBooks = Array.isArray(books)
            ? books.map((book) => ({ ...book }))
            : [];
          setAllBooks(plainBooks);
          setSearchedBooks(plainBooks);
        } catch (err) {
          setError(`Failed to load books: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      fetchBooks();
    } else {
      setSearchedBooks(allBooks);
      setLoading(false);
    }
  }, [setAllBooks]);

  useEffect(() => {
    const filtered = allBooks.filter((book) =>
      [book.id?.toString(), book.title, book.author, book.genre].some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
    setSearchedBooks(filtered);
  }, [searchTerm, allBooks]);

  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="relative container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-shadow-lg leading-tight">
              Discover Your Next
              <span className="block text-gradient bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Great Read
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Explore our vast collection of books across all genres and find
              your perfect literary adventure
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-primary-600 rounded-full font-bold hover:bg-accent-50 transition-all duration-300 shadow-strong hover:shadow-xl hover:scale-105">
                Browse Collection
              </button>
              <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-bold hover:bg-white/30 transition-all duration-300 border border-white/30">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-bounce-subtle"></div>
          <div
            className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-bounce-subtle"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-40 h-40 bg-yellow-300/10 rounded-full blur-3xl animate-bounce-subtle"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-6 -mt-12 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-morphism rounded-3xl shadow-strong p-8 border border-white/50"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Title, Author, or Genre..."
              className="input-field pl-14 text-lg h-14 bg-white/90 backdrop-blur-sm border-accent-200 focus:border-primary-400 focus:shadow-soft transition-all duration-300"
            />
            <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
              <button className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-medium hover:shadow-soft transition-all duration-300 hover:scale-105">
                Search
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-6 flex flex-wrap gap-3">
            {["Fiction", "Non-Fiction", "Science", "History", "Romance"].map(
              (genre) => (
                <button
                  key={genre}
                  className="px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-medium hover:bg-primary-100 hover:text-primary-700 transition-all duration-200 hover:scale-105"
                >
                  {genre}
                </button>
              ),
            )}
          </div>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-secondary-50 border border-secondary-200 rounded-lg"
          >
            <p className="text-secondary-700 font-medium">{error}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="skeleton aspect-[3/4] rounded-xl"></div>
                  <div className="skeleton h-4 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : searchedBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-100 rounded-full mb-4">
              <svg
                className="h-10 w-10 text-accent-400"
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
            <p className="text-accent-600">Try adjusting your search terms</p>
          </motion.div>
        ) : (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-accent-900">
                {searchTerm
                  ? `Search Results (${searchedBooks.length})`
                  : `All Books (${searchedBooks.length})`}
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-12">
              {searchedBooks.map((book, index) => (
                <motion.div
                  key={`${book.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <EachBookCard book={book} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
