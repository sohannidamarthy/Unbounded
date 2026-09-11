import { PropsWithChildren } from "react";
import styles from "./Container.module.css";

type ContainerProps = PropsWithChildren<{
  className?: string;
  fullWidth?: boolean;
}>;

const Container = ({
  children,
  className = "",
  fullWidth = false,
}: ContainerProps) => {
  if (fullWidth) {
    return <div className={`${styles.fullWidth} ${className}`}>{children}</div>;
  }

  return (
    <div className={styles.container}>
      {children}
    </div>
  );
};

export default Container;