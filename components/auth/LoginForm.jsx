"use client";
import { performLogin } from "@/app/actions";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EachField from "./EachField";

async function hashPassword(password, iterations = 10000) {
  try {
    const fixedSalt = "fixedSalt1234567890abcdef";
    const encodedPassword = new TextEncoder().encode(password);
    const encodedSalt = new TextEncoder().encode(fixedSalt);

    const combined = new Uint8Array(
      encodedPassword.length + encodedSalt.length,
    );
    combined.set(encodedPassword, 0);
    combined.set(encodedSalt, encodedPassword.length);

    let data = combined;
    for (let i = 0; i < iterations; i++) {
      data = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
    }

    const hash = Array.from(data)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const { setAuth } = useAuth();
  const router = useRouter();
  const [isTyping, setIsTyping] = useState(true);
  const [email, setEmail] = useState("");
  const [mainError, setMainError] = useState({
    isError: false,
    error: "Email or password is incorrect",
  });
  const [emailError, setEmailError] = useState({
    iserror: false,
    error: "",
  });
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState({
    iserror: false,
    error: "",
  });

  useEffect(() => {
    if (isTyping) {
      setIsLoading(false);
    }
  }, [isTyping]);

  useEffect(() => {
    setEmailError({
      iserror: false,
      error: "",
    });
    setPasswordError({
      iserror: false,
      error: "",
    });
    setMainError({
      isError: false,
      error: "Email or password is incorrect",
    });
    setIsTyping(true);
  }, [email, password]);

  const submitForm = async () => {
    setIsLoading(true);
    try {
      const hashedPassword = await hashPassword(password);
      const found = await performLogin({
        email: email,
        password: hashedPassword,
      });
      if (found) {
        setAuth(found);
        router.push("/");
        setIsLoading(false);
      } else {
        setEmailError({
          iserror: true,
          error: "",
        });
        setPasswordError({
          iserror: true,
          error: "",
        });
        setMainError({
          isError: true,
          error: "Email or password is incorrect",
        });
        setIsTyping(false);
      }
    } catch (error) {
      console.log("Something went wrong");
      setMainError({
        isError: true,
        error: "SomeThing Went Wrong",
      });
      setIsLoading(false);
    }
  };

  return (
    <div
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          submitForm();
        }
      }}
      className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden flex justify-center items-center p-4"
    >
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
        className="relative glass-morphism rounded-3xl shadow-strong p-8 w-full max-w-md border border-white/50"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
            <svg
              className="w-12 h-12 text-white"
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
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
            Welcome Back
          </h1>
          <p className="text-accent-600">Sign in to your library account</p>
        </div>

        <div className="opacity-0">
          <EachField
            label="fake"
            type="email"
            name="email"
            isReal={false}
            placeholder="Enter your email"
            value={email}
            setValue={setEmail}
            iserror={emailError.iserror}
            error={emailError.error}
          />
          <EachField
            label="fake"
            type="password"
            name="password"
            isReal={false}
            placeholder="Enter your password"
            value={password}
            setValue={setPassword}
            iserror={passwordError.iserror}
            error={passwordError.error}
          />
        </div>

        <div className="space-y-6">
          <EachField
            label="Email"
            type="email"
            name="email"
            isReal={true}
            placeholder="Enter your email"
            value={email}
            setValue={setEmail}
            iserror={emailError.iserror}
            error={emailError.error}
          />
          <EachField
            label="Password"
            type="password"
            name="password"
            isReal={true}
            placeholder="Enter your password"
            value={password}
            setValue={setPassword}
            iserror={passwordError.iserror}
            error={passwordError.error}
          />
        </div>

        {mainError.isError ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-secondary-50 border border-secondary-200 rounded-lg"
          >
            <p className="text-secondary-700 text-sm font-medium">
              {mainError.error}
            </p>
          </motion.div>
        ) : null}

        <button
          onClick={submitForm}
          disabled={isLoading}
          className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Logging in...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="mt-8 text-center">
          <p className="text-accent-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
