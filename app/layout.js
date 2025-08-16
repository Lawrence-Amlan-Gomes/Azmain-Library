import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "./providers/AuthProvider";

import { dbConnect } from "@/services/mongo";
import ThemeProvider from "./providers/ThemeProvider";
import BmiProvider from "./providers/BmiProvider";

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
        <BmiProvider>
          <ThemeProvider>
            <AuthProvider>
              <div className="h-screen overflow-hidden">
                <Navbar />
                <div className="h-[90%] overflow-hidden">{children}</div>
              </div>
            </AuthProvider>
          </ThemeProvider>
        </BmiProvider>
      </body>
    </html>
  );
}
