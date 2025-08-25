/* eslint-disable @next/next/no-img-element */
"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import colors from "@/app/colors";

export default function EachBookCard({ book }) {
  const router = useRouter();
  const { auth, setBook } = useAuth();

  const handleCardClick = () => {
    setBook(book);
    if (auth) {
      router.push("/user");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer w-[18%] mx-[1%] float-left border-[1px] border-[#676767] mb-5"
    >
      <div className="w-full aspect-[3/4] flex items-center justify-center p-5 overflow-hidden rounded-md relative">
        {book.photo ? (
          <div className="overflow-hidden rounded-md w-full h-full">
            <img
              src={book.photo}
              alt={book.title || "Book cover"}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="text-xl sm:text-2xl font-semibold text-gray-500">
            ?
          </div>
        )}
      </div>
      <div className=" pl-5 pb-5">
        <h3 className={`${colors.textKey} text-sm sm:text-base font-semibold text-gray-900 truncate`}>
          {book.title || "Untitled"}
        </h3>
      </div>
    </motion.div>
  );
}
