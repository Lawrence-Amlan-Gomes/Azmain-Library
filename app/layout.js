import Navbar from "@/components/Navbar";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";

import { dbConnect } from "@/services/mongo";
import ThemeProvider from "./providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Library Management System",
  description: "",
};

export default async function RootLayout({ children }) {
  await dbConnect();
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen">
              <Navbar />
              <div className="min-h-[90%]">{children}</div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
