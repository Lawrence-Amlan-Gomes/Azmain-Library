'use client'
import { ThemeContext } from "../contexts";
import { useContext } from "react";

export const useTheme = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return { theme, setTheme };
};
