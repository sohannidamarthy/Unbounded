import React from "react";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  title: string;
  description?: string;
  highlight?: string;
  align?: "left" | "center";
}

const SectionHeading = ({ title, description, highlight, align = "center",}: SectionHeadingProps) => {
  return (
    <div className={`${styles.sectionHeading} ${styles[align]}`}>
      <h2>
        {highlight ? (
          <>
            <span>{highlight}</span>
            {title}
          </>
        ) : (
          title
        )}
      </h2>

      {description && <p>{description}</p>}
    </div>
  );
};

export default SectionHeading;