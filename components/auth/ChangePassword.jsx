"use client";
import { useEffect, useState } from "react";
import EachField from "./EachField";
import { useAuth } from "@/app/hooks/useAuth";
import { callChangePassword } from "@/app/actions";
import { useTheme } from "@/app/hooks/useTheme";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const ChangePassword = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { auth, setAuth } = useAuth();
  const [noError, setNoError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState({
    iserror: true,
    error: "Password is incorrect",
  });
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState({
    iserror: true,
    error: "Your password must be at least 8 characters",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState({
    iserror: true,
    error: "Your password must be at least 8 characters",
  });

  useEffect(() => {
    if (!auth) {
      router.push("/login"); // Redirects to login if not authenticated
    }
  }, [auth, router]);

  useEffect(() => {
    if (newPassword.length < 8) {
      setNewPasswordError({
        iserror: true,
        error: "Your password must be at least 8 characters",
      });
    } else {
      setNewPasswordError({
        iserror: false,
        error: "Your password must be at least 8 characters",
      });
    }
    if (confirmPassword.length < 8) {
      setConfirmPasswordError({
        iserror: true,
        error: "Your password must be at least 8 characters",
      });
    } else {
      if (confirmPassword.length >= 8 && newPassword != confirmPassword) {
        setConfirmPasswordError({
          iserror: true,
          error: "Isn't matching with new password",
        });
      } else {
        setConfirmPasswordError({
          iserror: false,
          error: "Your password must be at least 8 characters",
        });
      }
    }
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    if (auth) {
      if (auth.password != password) {
        setPasswordError({ ...passwordError, iserror: true });
      } else {
        setPasswordError({ ...passwordError, iserror: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  useEffect(() => {
    if (passwordError.iserror == false && newPasswordError.iserror == false) {
      if (confirmPasswordError.iserror == false) {
        setNoError(true);
      } else {
        setNoError(false);
      }
    } else {
      setNoError(false);
    }
  }, [
    newPasswordError.iserror,
    passwordError.iserror,
    confirmPasswordError.iserror,
  ]);

  const submitForm = async () => {
    if (noError) {
      const sureSubmit = confirm("Are you sure want to change you password?");
      if (sureSubmit) {
        if (auth) {
          await callChangePassword(auth.email, newPassword);
          setAuth({ ...auth, password: newPassword });
        }
      }
    }
  };

  return auth ? (
    <div
      className={`h-full w-full sm:p-0 p-[5%] overflow-y-auto lg:overflow-hidden lg:flex lg:justify-center lg:items-center  ${
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
          <div className="text-[20px] sm:text-[25px] md:text-[30px] lg:text-[35px] xl:text-[40px] 2xl:text-[45px] font-bold mb-10 ">
            Change Password
          </div>
          {/* Trick the browser with this fake email and password field */}
          <div className="opacity-0">
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
            label="Old Password"
            type="password"
            name="password"
            isReal={true}
            placeholder="Enter your old Password"
            value={password}
            setValue={setPassword}
            iserror={passwordError.iserror}
            error={passwordError.error}
          />
          <EachField
            label="New Password"
            type="password"
            name="password"
            isReal={true}
            placeholder="Enter your new Password"
            value={newPassword}
            setValue={setNewPassword}
            iserror={newPasswordError.iserror}
            error={newPasswordError.error}
          />
          <EachField
            label="Confirm New Password"
            type="password"
            name="password"
            isReal={true}
            placeholder="Confirm your Password"
            value={confirmPassword}
            setValue={setConfirmPassword}
            iserror={confirmPasswordError.iserror}
            error={confirmPasswordError.error}
          />
          <button
            onClick={submitForm}
            className={`text-[18px] cursor-pointer rounded-lg mt-10 py-2 px-6 mb-5 shadow-md ${
              noError
                ? "bg-green-700 text-white"
                : theme
                ? "bg-[#dbdbdb] text-[#808080]"
                : "bg-[#1a1a1a] text-[#696969]"
            }`}
          >
            Change Password
          </button>
        </div>

        <div
          className={`float-left w-[50%] sm:block hidden overflow-hidden pr-5`}
        >
          <EachField
            label="New Password"
            type="password"
            name="password"
            isReal={true}
            placeholder="Enter your new Password"
            value={newPassword}
            setValue={setNewPassword}
            iserror={newPasswordError.iserror}
            error={newPasswordError.error}
          />
          <EachField
            label="Confirm New Password"
            type="password"
            name="password"
            isReal={true}
            placeholder="Confirm your Password"
            value={confirmPassword}
            setValue={setConfirmPassword}
            iserror={confirmPasswordError.iserror}
            error={confirmPasswordError.error}
          />
        </div>

        <div
          className={`float-left w-[50%] sm:block hidden overflow-hidden pl-5`}
        >
          <EachField
            label="Old Password"
            type="password"
            name="password"
            isReal={true}
            placeholder="Enter your old Password"
            value={password}
            setValue={setPassword}
            iserror={passwordError.iserror}
            error={passwordError.error}
          />
          <button
            onClick={submitForm}
            className={`text-[18px] cursor-pointer rounded-lg mt-10 py-2 px-6 mb-5 shadow-md ${
              noError
                ? "bg-green-700 text-white"
                : theme
                ? "bg-[#dbdbdb] text-[#808080]"
                : "bg-[#1a1a1a] text-[#696969]"
            }`}
          >
            Change Password
          </button>
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

export default ChangePassword;
