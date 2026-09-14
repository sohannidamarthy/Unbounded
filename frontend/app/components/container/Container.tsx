import { PropsWithChildren, ComponentPropsWithoutRef } from "react";
import styles from "./Container.module.css";

type ContainerProps = PropsWithChildren<
  Omit<ComponentPropsWithoutRef<"section">, "className"> & {
    className?: string;
    sectionClassName?: string;
    containerClassName?: string;
    fullWidth?: boolean;
    noFullWidthPadding?: boolean;
  }
>;

const Container = ({
  children,
  id,
  className = "",
  sectionClassName = "",
  containerClassName = "",
  fullWidth = false,
  noFullWidthPadding = false,
  ...sectionProps
}: ContainerProps) => {
  return (
    <section
      id={id}
      {...sectionProps}
      className={`${styles.section} ${sectionClassName}`}
    >
      {fullWidth ? (
        <div
          className={`${styles.fullWidth} ${noFullWidthPadding ? styles.noFullWidthPadding : ""
            } ${className}`}
        >
          {children}
        </div>
      ) : (
        <div className={`${styles.container} ${containerClassName}`}>
          {children}
        </div>
      )}
    </section>
  );
};

export default Container;