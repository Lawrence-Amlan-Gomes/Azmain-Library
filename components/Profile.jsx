"use client";
import { callUpdateUser } from "@/app/actions";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ Correct import for App Router
import { useEffect, useState } from "react";

const Profile = () => {
  const router = useRouter(); // This will now work
  const { theme } = useTheme();
  const { auth, setAuth } = useAuth();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!auth) {
      router.push("/login"); // Redirects to login if not authenticated
    }
  }, [auth, router]);

  const handleClick = async () => {
    setIsEditing((prev) => !prev);
    if (isEditing) {
      if (auth) {
        await callUpdateUser(auth.email, name, phone, bio);
        setAuth({ ...auth, name: name, bio: bio, phone: phone });
      }
    }
  };

  useEffect(() => {
    if (auth) {
      setName(auth.name);
      setPhone(auth.phone);
      setBio(auth.bio);
    }
  }, [auth]);

  const logout = () => {
    const sure = confirm("Are are surely want to log out?");
    if (sure) {
      setAuth({});
      window.location.href = "/";
    }
  };

  return auth ? (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden flex justify-center items-center p-4">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary-200/20 rounded-full blur-3xl animate-bounce-subtle"></div>
        <div
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary-200/20 rounded-full blur-3xl animate-bounce-subtle"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-40 h-40 bg-accent-200/20 rounded-full blur-3xl animate-bounce-subtle"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative glass-morphism rounded-3xl shadow-strong p-8 w-full max-w-4xl border border-white/50"
      >
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft border-4 border-white/50">
            {auth.photo == "" ? (
              <span className="text-4xl font-bold text-white">
                {auth.name ? auth.name.charAt(0).toUpperCase() : "U"}
              </span>
            ) : (
              <img
                src={auth.photo}
                alt="profile"
                className="w-full h-full rounded-full object-cover"
              />
            )}
          </div>
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-accent-600 text-sm font-medium">
              Active Now
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-accent-700 mb-4">
                Profile Information
              </h3>

              <div className="space-y-4">
                <div className="glass-morphism rounded-xl p-4">
                  <div className="text-sm text-accent-600 mb-1">Full Name</div>
                  {isEditing ? (
                    <input
                      className="input-field text-base w-full"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="font-semibold text-accent-900">
                      {name || "Not set"}
                    </div>
                  )}
                </div>

                <div className="glass-morphism rounded-xl p-4">
                  <div className="text-sm text-accent-600 mb-1">
                    Email Address
                  </div>
                  <div className="font-semibold text-accent-900">
                    {auth.email}
                  </div>
                </div>

                <div className="glass-morphism rounded-xl p-4">
                  <div className="text-sm text-accent-600 mb-1">
                    Phone Number
                  </div>
                  {isEditing ? (
                    <input
                      className="input-field text-base w-full"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone"
                    />
                  ) : (
                    <div className="font-semibold text-accent-900">
                      {phone || "Not set"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bio & Actions */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-accent-700 mb-4">
                About Me
              </h3>

              <div className="glass-morphism rounded-xl p-4">
                <div className="text-sm text-accent-600 mb-2">Bio</div>
                {isEditing ? (
                  <textarea
                    className="input-field text-base w-full resize-none"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                ) : (
                  <div className="font-semibold text-accent-900 min-h-[100px]">
                    {bio || "No bio added yet"}
                  </div>
                )}
              </div>

              <div className="glass-morphism rounded-xl p-4">
                <div className="text-sm text-accent-600 mb-1">Subscription</div>
                <div className="flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
                  <div className="font-semibold text-accent-900">
                    {auth.paymentType || "Free Plan"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleClick}
              className={`btn-primary flex items-center justify-center ${
                isEditing ? "bg-secondary-600 hover:bg-secondary-700" : ""
              }`}
            >
              {isEditing ? (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Update Profile
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </>
              )}
            </button>

            <Link
              href="/changePassword"
              className="btn-secondary flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Change Password
            </Link>
          </div>

          <button
            onClick={logout}
            className="w-full px-6 py-3 bg-secondary-100 text-secondary-700 rounded-xl font-semibold hover:bg-secondary-200 transition-all duration-200 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  ) : null;
};

export default Profile;
