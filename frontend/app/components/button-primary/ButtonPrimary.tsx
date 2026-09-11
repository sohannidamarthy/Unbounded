"use client";

import React from "react";
import Link from "next/link";
import styles from "./ButtonPrimary.module.css";

interface ButtonPrimaryProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "primaryWhite";
  href?: string;
}

const ButtonPrimary = ({
  children,
  icon,
  type = "button",
  className = "",
  disabled = false,
  variant = "primary",
  href,
  ...props
}: ButtonPrimaryProps) => {
  const content = (
    <>
      {icon && <i className={styles.icon}>{icon}</i>}
      <span>{children}</span>
    </>
  );

  // Default: Button
  if (!href) {
    return (
      <button
        type={type}
        disabled={disabled}
        className={`${styles.ButtonPrimary} ${styles[variant]} ${className}`}
        {...props}
      >
        {content}
      </button>
    );
  }

  // If href exists: Link
  return (
    <Link
      href={href}
      className={`${styles.ButtonPrimary} ${styles[variant]} ${className}`}
    >
      {content}
    </Link>
  );
};

export default ButtonPrimary;