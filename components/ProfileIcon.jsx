"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ProfileIcon = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { auth } = useAuth();
  const handleClick = () => {};

  return (
    <div>
      {auth ? (
        <Link href="/profile" className="group">
          <div
            className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 relative overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border-2 border-white/50"
            onClick={handleClick}
          >
            {auth.photo == "" ? (
              <div className="w-full h-full flex justify-center items-center text-2xl font-bold text-white">
                {auth.name != undefined
                  ? auth.name.charAt(0).toUpperCase()
                  : ""}
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={auth.photo}
                alt="profilepic"
                className="w-full h-full object-cover"
              />
            )}
            {/* Online status indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </Link>
      ) : (
        <Link href={pathname == "/login" ? "/register" : "/login"}>
          <button className="relative group btn-primary text-sm font-medium px-8 py-3 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 rounded-lg">
            <span className="relative z-10 flex items-center space-x-2">
              {pathname == "/login" ? (
                <>
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <span>Register</span>
                </>
              ) : (
                <>
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
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Login</span>
                </>
              )}
            </span>
          </button>
        </Link>
      )}
    </div>
  );
};

export default ProfileIcon;
