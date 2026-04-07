/* eslint-disable @next/next/no-img-element */
"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function EachBookCard({ book }) {
  const router = useRouter();
  const { auth, setBook } = useAuth();

  const handleCardClick = () => {
    setBook(book);
    router.push("/user");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group cursor-pointer"
    >
      <div className="glass-morphism rounded-2xl overflow-hidden shadow-soft hover:shadow-strong transition-all duration-300 border border-white/50">
        {/* Book Cover */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-accent-50 to-accent-100">
          {book.photo ? (
            <>
              <img
                src={book.photo}
                alt={book.title || "Book cover"}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
              <svg
                className="w-16 h-16 text-primary-400 mb-2"
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
              <span className="text-primary-600 font-medium">No Cover</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-accent-700">
              Available
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="p-4">
          <h3 className="font-bold text-accent-900 text-sm mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors duration-200">
            {book.title || "Untitled"}
          </h3>

          {book.author && (
            <p className="text-accent-600 text-xs mb-3 line-clamp-1 flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {book.author}
            </p>
          )}

          {book.genre && (
            <div className="flex items-center justify-between">
              <span className="inline-block px-2 py-1 bg-gradient-to-r from-accent-100 to-primary-100 text-accent-700 text-xs rounded-md font-medium border border-accent-200">
                {book.genre}
              </span>
              <div className="flex items-center text-accent-400">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-medium">4.5</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button className="flex-1 px-3 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs rounded-lg font-medium hover:shadow-soft transition-all duration-200 hover:scale-105">
              View
            </button>
            <button className="px-3 py-2 bg-accent-100 text-accent-700 text-xs rounded-lg font-medium hover:bg-accent-200 transition-all duration-200 hover:scale-105">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
