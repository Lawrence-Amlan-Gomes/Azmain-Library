"use client";
import { getAllUsers2, registerUser } from "@/app/actions";
import { useTheme } from "@/app/hooks/useTheme";
import { motion } from "framer-motion";
import Link from "next/link";
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

const RegistrationForm = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [noError, setNoError] = useState(false);
  const [nameError, setNameError] = useState({
    iserror: false,
    error: "Name is required",
  });
  const [firstTimeEmailCheck, setFirstTimeEmailCheck] = useState(true);
  const [email, setEmail] = useState("");
  const [allEmails, setAllEmails] = useState([]);
  const [emailError, setEmailError] = useState({
    iserror: true,
    error: "Email is required",
  });
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState({
    iserror: true,
    error: "Your password must be at least 8 characters",
  });

  useEffect(() => {
    if (name == "") {
      setNameError({ ...nameError, iserror: true });
    } else {
      setNameError({ ...nameError, iserror: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    const setAllEmailsInArray = async () => {
      const Emails = [];
      const users = await getAllUsers2({ email: email });
      for (let user of users) {
        Emails.push(user.email);
      }
      setAllEmails(Emails);
    };
    setAllEmailsInArray();
    if (email == "") {
      setEmailError({ iserror: true, error: "Email is required" });
    } else if (email.slice(-10) != "@gmail.com") {
      setEmailError({
        iserror: true,
        error: "Use @gmail.com as your email format",
      });
    } else if (allEmails.includes(email)) {
      setEmailError({
        iserror: true,
        error: "This email is already taken",
      });
    } else {
      setEmailError({ ...emailError, iserror: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  if (firstTimeEmailCheck) {
    setTimeout(() => {
      if (allEmails.includes(email)) {
        setEmailError({
          iserror: true,
          error: "This email is already taken",
        });
      } else {
        setEmailError({ ...emailError, iserror: true });
      }
      setFirstTimeEmailCheck(false);
    }, 3000);
  }

  useEffect(() => {
    if (password.length < 8) {
      setPasswordError({
        iserror: true,
        error: "Your password must be at least 8 characters",
      });
    } else {
      setPasswordError({ ...passwordError, iserror: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  useEffect(() => {
    if (nameError.iserror == false && emailError.iserror == false) {
      if (passwordError.iserror == false) {
        setNoError(true);
      } else {
        setNoError(false);
      }
    } else {
      setNoError(false);
    }
  }, [emailError.iserror, nameError.iserror, passwordError.iserror]);

  const submitForm = async () => {
    if (noError) {
      const sureSubmit = confirm("Are you sure to Register?");
      if (sureSubmit) {
        setIsLoading(true);
        try {
          const hashedPassword = await hashPassword(password);
          let registered = await registerUser({
            name: name,
            email: email,
            password: hashedPassword,
            phone: "Phone",
            photo: "",
            bio: "Bio",
            userType: "user",
            borrowedBooks: [],
          });
          if (registered) {
            setIsLoading(false);
          }
        } catch (error) {
          setIsLoading(false);
          console.error("Registration failed:", error);
        }
      }
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
        className="relative glass-morphism rounded-3xl shadow-strong p-8 w-full max-w-2xl border border-white/50"
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
            Create Account
          </h1>
          <p className="text-accent-600">Join our library community today</p>
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

        {/* Form Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <EachField
              label="Name"
              type="name"
              name="name"
              isReal={true}
              placeholder="Enter your name"
              value={name}
              setValue={setName}
              iserror={nameError.iserror}
              error={nameError.error}
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

            {/* Password Strength Indicator */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-accent-700">
                Password Strength
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                      password.length >= level * 2
                        ? level <= 2
                          ? "bg-secondary-400"
                          : level === 3
                            ? "bg-yellow-400"
                            : "bg-primary-500"
                        : "bg-accent-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-accent-600">
                {password.length === 0
                  ? "Enter a password"
                  : password.length < 8
                    ? "Use at least 8 characters"
                    : password.length < 12
                      ? "Good password"
                      : "Strong password"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={submitForm}
          disabled={!noError || isLoading}
          className="w-full mt-8 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="mt-8 text-center">
          <p className="text-accent-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationForm;
