"use client";
import { motion } from "framer-motion";

const EachField = ({
  label,
  isReal,
  name,
  type,
  placeholder,
  value,
  setValue,
  iserror,
  error,
}) => {
  return (
    <>
      {isReal ? (
        <div>
          <div className="text-sm font-semibold text-accent-700 mb-2 text-start">
            {value != "" ? label : ""}
          </div>
          <div className="relative">
            <input
              className={`input-field text-base w-full transition-all duration-200 ${
                !iserror
                  ? "border-primary-300 text-accent-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  : "border-secondary-300 text-accent-900 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200"
              }`}
              type={type}
              value={value}
              name={name}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoComplete="off"
            />
            {!iserror && value && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-primary-500"
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
              </div>
            )}
            {iserror && value && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-secondary-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
          </div>
          {iserror ? (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-secondary-600 mt-2 text-start text-sm font-medium"
            >
              {error}
            </motion.div>
          ) : null}
        </div>
      ) : (
        <div>
          <input
            className="h-[1px] w-[1px] float-left"
            type={type}
            value={value}
            name={name}
            onChange={() => console.log("hello")}
            placeholder={placeholder}
          />
        </div>
      )}
    </>
  );
};

export default EachField;
