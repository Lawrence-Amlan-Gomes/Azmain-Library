"use client";
import { useTheme } from "@/app/hooks/useTheme";
import sun from "../public/Sun.png";
import moon from "../public/Moon.png";
import Image from "next/image";

function ToogleTheme() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex justify-center items-center h-full">
      <div
        className={`rounded-full  lg:h-[40px] shadow-md lg:w-[40px] w-[35px] h-[35px] relative ${
          theme
            ? "bg-[#b8b8b8] hover:bg-[#b2b2b2] text-black"
            : "bg-[#1f1f1f] hover:bg-[#272727] text-zinc-300"
        }`}
        onClick={() => setTheme((prev) => !prev)}
      >
        <div className="h-full w-full relative">
          {" "}
          <Image
            priority
            src={theme ? moon : sun}
            alt={theme ? "moon" : "sun"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default ToogleTheme;
