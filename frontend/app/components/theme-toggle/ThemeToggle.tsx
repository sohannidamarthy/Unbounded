"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

const THEME_STORAGE_KEY = "unbounded.theme";

export default function ThemeToggle() {
  // Dark mode is the default
  const [darkMode, setDarkMode] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    // Dark is default unless user previously selected light
    const isDark = savedTheme !== "light";

    setDarkMode(isDark);
    setIsReady(true);

    // Use <html> instead of <body>
    document.documentElement.classList.toggle("dark-mode", isDark);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;

    setDarkMode(newDarkMode);

    // Use <html> instead of <body>
    document.documentElement.classList.toggle(
      "dark-mode",
      newDarkMode
    );

    localStorage.setItem(
      THEME_STORAGE_KEY,
      newDarkMode ? "dark" : "light"
    );
  };

  if (!isReady) {
    return null;
  }

  return (
    <button
      className={`themeToggle ${styles.themeToggle}`}
      type="button"
      onClick={toggleTheme}
      aria-label={
        darkMode ? "Switch to light mode" : "Switch to dark mode"
      }
      title={darkMode ? "Light mode" : "Dark mode"}
    >
      {darkMode ? (
        /* Sun icon */
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20.0832 15.0025C20.0832 17.8084 17.8084 20.0832 15.0025 20.0832C12.1966 20.0832 9.92188 17.8084 9.92188 15.0025C9.92188 12.1966 12.1966 9.92188 15.0025 9.92188C17.8084 9.92188 20.0832 12.1966 20.0832 15.0025Z"
            fill="currentColor"
          />

          <path
            d="M28.5484 16.4516C29.3501 16.4516 30 15.8017 30 15C30 14.1983 29.3501 13.5484 28.5484 13.5484V16.4516ZM25.1613 13.5484C24.3596 13.5484 23.7097 14.1983 23.7097 15C23.7097 15.8017 24.3596 16.4516 25.1613 16.4516V13.5484ZM4.83871 16.4516C5.64041 16.4516 6.29032 15.8017 6.29032 15C6.29032 14.1983 5.64041 13.5484 4.83871 13.5484V16.4516ZM1.45161 13.5484C0.649916 13.5484 0 14.1983 0 15C0 15.8017 0.649916 16.4516 1.45161 16.4516V13.5484ZM16.4516 1.45161C16.4516 0.649916 15.8017 0 15 0C14.1983 0 13.5484 0.649916 13.5484 1.45161H16.4516ZM13.5484 4.83871C13.5484 5.64041 14.1983 6.29032 15 6.29032C15.8017 6.29032 16.4516 5.64041 16.4516 4.83871H13.5484ZM16.4516 25.1613C16.4516 24.3596 15.8017 23.7097 15 23.7097C14.1983 23.7097 13.5484 24.3596 13.5484 25.1613H16.4516ZM13.5484 28.5484C13.5484 29.3501 14.1984 30 15 30C15.8017 30 16.4516 29.3501 16.4516 28.5484H13.5484ZM25.607 6.4458C26.1739 5.87892 26.1739 4.95979 25.607 4.39291C25.0401 3.82603 24.1212 3.82603 23.5543 4.39291L25.607 6.4458ZM21.1581 6.78904C20.5912 7.35592 20.5912 8.27504 21.1581 8.84193C21.725 9.40881 22.644 9.40881 23.2109 8.84193L21.1581 6.78904ZM8.84193 23.2109C9.40881 22.644 9.40881 21.725 9.40881 21.1581C8.27504 20.5912 7.35592 20.5912 6.78904 21.1581L8.84193 23.2109ZM4.39291 23.5543C3.82603 24.1212 3.82603 25.0401 4.39291 25.607C4.95979 26.1739 5.87892 26.1739 6.4458 25.607L4.39291 23.5543ZM6.4458 4.39291C5.87892 3.82603 4.95979 3.82603 4.39291 4.39291C3.82603 4.95979 3.82603 5.87892 4.39291 6.4458L6.4458 4.39291ZM6.78904 8.84193C7.35592 9.40881 8.27504 9.40881 8.84193 8.84193C9.40881 8.27504 9.40881 7.35592 6.78904 6.78904L6.78904 8.84193ZM23.2128 21.1601C22.6459 20.5932 21.727 20.5932 21.1601 21.1601C20.5932 21.727 20.5932 22.6459 21.1601 23.2128L23.2128 21.1601ZM23.5543 25.607C24.1212 26.1739 25.0401 26.1739 25.607 25.607C26.1739 25.0401 26.1739 24.1212 25.607 23.5543L23.5543 25.607ZM28.5484 13.5484H25.1613V16.4516H28.5484V13.5484ZM4.83871 13.5484H1.45161V16.4516H4.83871V13.5484ZM13.5484 1.45161V4.83871H16.4516V1.45161H13.5484ZM13.5484 25.1613V28.5484H16.4516V25.1613H13.5484ZM23.5543 4.39291L21.1581 6.78904L23.2109 8.84193L25.607 6.4458L23.5543 4.39291ZM6.78904 21.1581L4.39291 23.5543L6.4458 25.607L8.84193 23.2109L6.78904 21.1581ZM4.39291 6.4458L6.78904 8.84193L8.84193 6.78904L6.4458 4.39291ZM21.1601 23.2128L23.5543 25.607L25.607 23.5543L23.2128 21.1601L21.1601 23.2128Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        /* Moon icon */
        <svg
          width="27"
          height="27"
          viewBox="0 0 27 27"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.5 13.053C1.5 19.9273 7.07178 25.5 13.9449 25.5C19.1817 25.5 23.663 22.2649 25.5 17.684C24.0666 18.2601 22.4981 18.5848 20.8587 18.5848C13.9856 18.5848 8.41384 13.0122 8.41384 6.13785C8.41384 4.50585 8.73373 2.92813 9.30465 1.5C4.72979 3.33984 1.5 7.81916 1.5 13.053Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}