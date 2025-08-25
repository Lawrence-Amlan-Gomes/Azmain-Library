"use client";
import Image from "next/image";
import Link from "next/link";
import ProfileIcon from "./ProfileIcon";
import { useTheme } from "@/app/hooks/useTheme.js";
import ToogleTheme from "./ToogleTheme";
import { useAuth } from "@/app/hooks/useAuth.js";
import colors from "@/app/colors";
const Navbar = () => {
  const { auth } = useAuth();
  const { theme, setTheme } = useTheme();
  return (
    <div
      className={`h-[10%] overflow-hidden ${
        theme ? colors.keyBg : "bg-orange-600"
      }`}
    >
      <div className="w-[40%] ml-[5%] h-full float-left flex justify-start items-center">
        <Link href="/">
          <div
            className={`text-[15px] sm:text-[18px] md:text-[22px] lg:text-[25px] xl:text-[30px] 2xl:text-[35px] font-bold text-left ${
              theme ? "text-white" : "text-white"
            }`}
          >
            Library Management System
          </div>
        </Link>
      </div>
      <div className="h-full float-left flex justify-end items-center w-[50%] mr-[5%]">
        {auth ? (
          auth.userType === "admin" && (
            <>
              <ul className="flex gap-5 text-white hover:underline mr-5">
                {/* <li>
            <ToogleTheme />
          </li> */}
                <Link href="/allUsers">Users</Link>
              </ul>
              <ul className="flex gap-5 text-white hover:underline mr-5">
                {/* <li>
            <ToogleTheme />
          </li> */}
                <Link href="/admin">Admin</Link>
              </ul>
            </>
          )
        ) : (
          <></>
        )}
        <ul className="flex gap-5 text-white hover:underline">
          {/* <li>
            <ToogleTheme />
          </li> */}
          <Link href="/history">History</Link>
        </ul>

        <ul className="flex ml-5 gap-5 text-[#cfcfcf]">
          {/* <li>
            <ToogleTheme />
          </li> */}
          <li>
            <ProfileIcon />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
