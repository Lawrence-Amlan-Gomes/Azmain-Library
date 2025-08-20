"use client";
import { useEffect, useState } from "react";
import { getAllUsers2 } from "@/app/actions";
import { useAuth } from "@/app/hooks/useAuth";
import { motion } from "framer-motion";
import Image from "next/image";
import bookIcon from "../public/bookIcon.png";

export default function AllUsers() {
  const { auth, allUsers, setAllUsers } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!allUsers || allUsers.length === 0) {
        try {
          const users = await getAllUsers2();
          setAllUsers(users);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };
    fetchUsers();
  }, [allUsers, setAllUsers]);

  if (selectedUser) {
    const borrowedHistory = Array.isArray(selectedUser.borrowedHistory)
      ? selectedUser.borrowedHistory
      : [];

    return (
      <div className="bg-white text-gray-800 w-full h-full min-h-screen p-6 overflow-y-auto">
        <button
          onClick={() => setSelectedUser(null)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go Back
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {`${selectedUser.name}'s Borrowed History`}
        </h2>
        {borrowedHistory.length === 0 ? (
          <p className="text-gray-500">No borrowing history available</p>
        ) : (
          <div className="w-full">
            {borrowedHistory.map((entry, index) => {
              const expiresDate = new Date(entry.expiresDate);
              const returnDate = entry.return ? new Date(entry.return) : null;
              const isOverdue = returnDate
                ? returnDate > expiresDate
                : new Date() > expiresDate;

              return (
                <motion.div
                  key={`${entry.bookId}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="float-left w-[calc(25%-1rem)] mx-2 mb-4 bg-white p-3 border-[1px] border-[#aaaaaa] rounded-md shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-24 rounded-md overflow-hidden flex items-center justify-center">
                      <Image
                        src={bookIcon}
                        alt="Book icon"
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                    <div>
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
        )}
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-800 w-full h-full min-h-screen p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">All Users</h2>
      {allUsers.length === 0 ? (
        <p className="text-gray-500">No users available</p>
      ) : (
        <div className="w-full">
          {allUsers
            .filter((user) => user.email !== auth?.email)
            .map((user, index) => (
              <motion.div
                key={user.email}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setSelectedUser(user)}
                className="float-left w-[calc(25%-1rem)] mx-2 mb-4 bg-white p-3 border-[1px] border-[#aaaaaa] rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-200 w-16 h-24 rounded-md overflow-hidden flex items-center justify-center">
                    {user.photo ? (
                      <Image
                        src={user.photo}
                        alt="User profile"
                        width={64}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex justify-center items-center text-xl font-semibold text-gray-500">
                        <svg
                          className="w-12 h-12 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">Email: {user.email}</p>
                    <p className="text-sm text-gray-600">Phone: {user.phone}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          <div className="clear-both"></div>
        </div>
      )}
    </div>
  );
}