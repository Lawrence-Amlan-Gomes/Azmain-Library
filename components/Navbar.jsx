"use client";
import { useAuth } from "@/app/hooks/useAuth.js";
import { useTheme } from "@/app/hooks/useTheme.js";
import Link from "next/link";
import ProfileIcon from "./ProfileIcon";
const Navbar = () => {
  const { auth } = useAuth();
  const { theme, setTheme } = useTheme();
  return (
    <div className="h-[10%] overflow-hidden glass-morphism shadow-soft border-b border-white/30 py-4">
      <div className="container mx-auto px-6 h-full flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/" className="group">
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gradient group-hover:scale-105 transition-all duration-300 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-soft">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span>Library Management System</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {auth
            ? auth.userType === "admin" && (
                <>
                  <Link
                    href="/allUsers"
                    className="text-accent-700 hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105 transform px-3 py-2 rounded-lg hover:bg-accent-100 flex items-center space-x-2"
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span>Users</span>
                  </Link>
                  <Link
                    href="/admin"
                    className="text-accent-700 hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105 transform px-3 py-2 rounded-lg hover:bg-accent-100 flex items-center space-x-2"
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
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Admin</span>
                  </Link>
                </>
              )
            : null}

          <Link
            href="/history"
            className="text-accent-700 hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105 transform px-3 py-2 rounded-lg hover:bg-accent-100 flex items-center space-x-2"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>History</span>
          </Link>

          <div className="flex items-center space-x-2 pl-6 border-l border-accent-200">
            <div className="bg-white rounded-full p-1 shadow-soft">
              <ProfileIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
