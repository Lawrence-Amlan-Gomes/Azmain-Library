"use client";
import { callUpdateUser } from "@/app/actions";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ Correct import for App Router
import { useEffect, useState } from "react";
import ProfilePic from "./ProfilePic";
import { motion } from "framer-motion";
import colors from "@/app/colors";

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
    <div
      className={`h-full w-full sm:p-0 p-[5%] overflow-y-auto lg:overflow-hidden lg:flex lg:justify-center lg:items-center ${
        theme ? "bg-[#ffffff] text-[#0a0a0a]" : "bg-[#000000] text-[#ebebeb]"
      }`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, type: "just" }}
        className={`p-10 overflow-hidden rounded-lg sm:my-[5%] sm:w-[80%] sm:mx-[10%] lg:w-[700px] xl:w-[800px] 2xl:w-[900px] lg:my-0 text-center shadow-lg ${
          theme ? "bg-[#ececec] text-[#0a0a0a]" : "bg-[#0f0f0f] text-[#f0f0f0]"
        }`}
      >
        <div className="w-full sm:hidden block">
          <ProfilePic />

          {auth ? (
            <>
              {" "}
              <div
                className={`${colors.textKey} w-full mt-5 mb-5 flex items-center justify-center font-bold text-[35px]`}
              >
                {isEditing ? (
                  <input
                    className={` bg-transparent border-[2px] border-blue-700 focus:border-green-700 focus:outline-none text-center rounded-lg w-full p-3`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <div>{name}</div>
                )}
              </div>
              <div className="w-full mt-5 mb-5 flex items-center justify-center">
                {auth.email}
              </div>
              <div className="w-full mt-5 mb-5 flex items-center justify-center">
                Subscription : {auth.paymentType}
              </div>
              <div className="w-full mt-5 mb-5 flex items-center justify-center">
                {isEditing ? (
                  <input
                    className="bg-transparent border-[2px] border-blue-700 focus:border-green-700 focus:outline-none rounded-lg break-words w-full text-center p-3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                ) : (
                  <div className="break-words w-full text-center">{bio}</div>
                )}
              </div>
              <div className="w-full mt-5 mb-5 flex items-center justify-center">
                {isEditing ? (
                  <input
                    className="bg-transparent border-[2px] border-blue-700 focus:border-green-700 focus:outline-none text-center rounded-lg w-full p-3"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                ) : (
                  <div>{phone}</div>
                )}
              </div>
              <div className="w-full mt-5 mb-5 flex items-center justify-center">
                <button
                  onClick={handleClick}
                  className={`${
                    isEditing ? "text-green-700 " : "text-blue-700"
                  } bg-[#161616] p-3 rounded-lg hover:bg-[#202020] w-full tracking-wider ${
                    theme
                      ? "bg-[#c9c9c9] hover:bg-[#bdbdbd]"
                      : "bg-[#161616]  hover:bg-[#202020]"
                  }`}
                >
                  {isEditing ? "Update" : "Edit"}
                </button>
              </div>
              <div className="w-full mt-5 mb-5 flex items-center justify-center">
                <Link href="/changePassword" className="w-full">
                  <button
                    className={`p-3 w-full text-purple-600 tracking-wider text-[18px] py-2 px-5 shadow-lg rounded-lg ${
                      theme
                        ? "bg-[#c9c9c9] hover:bg-[#bdbdbd]"
                        : "bg-[#161616]  hover:bg-[#202020]"
                    }`}
                  >
                    Change Password
                  </button>
                </Link>
              </div>
              <div className="w-full mt-5 mb-5 flex items-center justify-center">
                <button
                  onClick={logout}
                  className={`p-3  w-full text-red-600 tracking-wider text-[18px] py-2 px-5 shadow-lg rounded-lg ${
                    theme
                      ? "bg-[#c9c9c9] hover:bg-[#bdbdbd]"
                      : "bg-[#161616]  hover:bg-[#202020]"
                  }`}
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>

        <div className={`w-[50%] float-left pr-5 sm:block hidden`}>
          <ProfilePic />

          {auth ? (
            <>
              {" "}
              <div className={`${colors.textKey} w-full mt-5 mb-5 flex items-center justify-center font-bold text-[35px]`}>
                {isEditing ? (
                  <input
                    className={`bg-transparent border-[2px] border-blue-700 focus:border-green-700 focus:outline-none text-center rounded-lg w-full p-3`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <div>{name}</div>
                )}
              </div>
              <div className="w-full mt-5 mb-5 flex items-center justify-center">
                {auth.email}
              </div>
              <div className="w-full mt-5 mb-5 flex items-center justify-center">
                Subscription : {auth.paymentType}
              </div>
            </>
          ) : (
            <></>
          )}
        </div>

        <div className={`w-[50%] float-left pl-5 sm:block hidden`}>
          {auth ? (
            <>
              <div className="w-full mt-5 mb-5 flex items-center justify-center">
                {isEditing ? (
                  <input
                    className="bg-transparent border-[2px] border-blue-700 focus:border-green-700 focus:outline-none rounded-lg break-words w-full text-center p-3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                ) : (
                  <div className="break-words w-full text-center">{bio}</div>
                )}
              </div>
              <div className="w-full mt-5 mb-5 flex items-center justify-center">
                {isEditing ? (
                  <input
                    className="bg-transparent border-[2px] border-blue-700 focus:border-green-700 focus:outline-none text-center rounded-lg w-full p-3"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                ) : (
                  <div>{phone}</div>
                )}
              </div>
            </>
          ) : (
            <></>
          )}
          <div className="w-full mt-5 mb-5 flex items-center justify-center">
            <button
              onClick={handleClick}
              className={`${
                isEditing ? "text-green-700 " : "text-blue-700"
              } bg-[#161616] p-3 rounded-lg hover:bg-[#202020] w-full tracking-wider ${
                theme
                  ? "bg-[#c9c9c9] hover:bg-[#bdbdbd]"
                  : "bg-[#161616]  hover:bg-[#202020]"
              }`}
            >
              {isEditing ? "Update" : "Edit"}
            </button>
          </div>
          <div className="w-full mt-5 mb-5 flex items-center justify-center">
            <Link href="/changePassword" className="w-full">
              <button
                className={`p-3 w-full text-purple-600 tracking-wider text-[18px] py-2 px-5 shadow-lg rounded-lg ${
                  theme
                    ? "bg-[#c9c9c9] hover:bg-[#bdbdbd]"
                    : "bg-[#161616]  hover:bg-[#202020]"
                }`}
              >
                Change Password
              </button>
            </Link>
          </div>
          <div className="w-full mt-5 mb-5 flex items-center justify-center">
            <button
              onClick={logout}
              className={`p-3  w-full text-red-600 tracking-wider text-[18px] py-2 px-5 shadow-lg rounded-lg ${
                theme
                  ? "bg-[#c9c9c9] hover:bg-[#bdbdbd]"
                  : "bg-[#161616]  hover:bg-[#202020]"
              }`}
            >
              Log Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  ) : (
    <div
      className={`w-full h-full flex justify-center items-center ${
        theme ? "bg-[#ffffff] text-[#0a0a0a]" : "bg-[#000000] text-[#ebebeb]"
      }`}
    >
      <div className="p-10 text-[18px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[35px] 2xl:text-[40px]">
        You have to login first
      </div>
    </div>
  );
};

export default Profile;
