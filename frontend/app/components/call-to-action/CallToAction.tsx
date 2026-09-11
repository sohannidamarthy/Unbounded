import { ReactNode } from "react";
import Container from "../container/Container";
import SectionHeading from "../section-heading/SectionHeading";
import ButtonPrimary from "../button-primary/ButtonPrimary";
import styles from "./CallToAction.module.css";

type CallToActionProps = {
  highlight: string;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon?: ReactNode;
  buttonLink?: string;
};

const CallToAction = ({
  highlight,
  title,
  description,
  buttonText,
  buttonIcon,
  buttonLink,
}: CallToActionProps) => {
  return (
    <section className={`section ${styles.CallToAction}`}>
      <Container>
        <div className={styles.CallToActionBox}>
          <SectionHeading
            highlight={highlight}
            title={title}
            description={description}
          />

          <ButtonPrimary
            href={buttonLink}
            icon={buttonIcon}
          >
            {buttonText}
          </ButtonPrimary>
        </div>
      </Container>
    </section>
  );
};

export default CallToAction;