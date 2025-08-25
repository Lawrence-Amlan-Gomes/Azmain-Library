"use client";
import { getAllUsers2, registerUser } from "@/app/actions";
import { useTheme } from "@/app/hooks/useTheme";
import Link from "next/link";
import { useEffect, useState } from "react";
import EachField from "./EachField";
import { motion } from "framer-motion";
import colors from "@/app/colors";

async function hashPassword(password, iterations = 10000) {
    try {
        const fixedSalt = 'fixedSalt1234567890abcdef';
        const encodedPassword = new TextEncoder().encode(password);
        const encodedSalt = new TextEncoder().encode(fixedSalt);
        
        const combined = new Uint8Array(encodedPassword.length + encodedSalt.length);
        combined.set(encodedPassword, 0);
        combined.set(encodedSalt, encodedPassword.length);
        
        let data = combined;
        for (let i = 0; i < iterations; i++) {
            data = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
        }
        
        const hash = Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
        return hash;
    } catch (error) {
        console.error('Error hashing password:', error);
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
        <div className={"w-full overflow-hidden"}>
          <div className={`${colors.textKey} text-[20px] sm:text-[25px] md:text-[30px] lg:text-[35px] xl:text-[40px] 2xl:text-[45px] font-bold mb-8 w-full float-left flex justify-center items-center`}>
            Registration
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
        </div>

        <div className="w-full sm:hidden block overflow-hidden">
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
          <button
            onClick={submitForm}
            className={`text-[18px] cursor-pointer rounded-md mt-10 py-2 px-6 shadow-md ${
              noError
                ? "bg-green-800 hover:bg-green-700 text-white"
                : theme
                ? "bg-[#dbdbdb] text-[#808080]"
                : "bg-[#1a1a1a] text-[#696969]"
            }`}
          >
            {isLoading ? `Registering...` : `Register`}
          </button>
        </div>

        <div className={`float-left w-[50%] sm:block hidden overflow-hidden pr-5`}>
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

        <div className={`float-left w-[50%] sm:block hidden overflow-hidden pl-5`}>
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
          <button
            onClick={submitForm}
            className={`text-[18px] cursor-pointer rounded-md mt-10 py-2 px-6 shadow-md ${
              noError
                ? "bg-green-800 hover:bg-green-700 text-white"
                : theme
                ? "bg-[#dbdbdb] text-[#808080]"
                : "bg-[#1a1a1a] text-[#696969]"
            }`}
          >
            {isLoading ? `Registering...` : `Register`}
          </button>
        </div>

        <div className={"float-left w-full overflow-hidden"}>
          <p className="mt-10 text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] 2xl:text-[26px]">
            Already Have An Account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationForm;