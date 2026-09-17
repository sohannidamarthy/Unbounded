import React, { ReactNode } from 'react';
import Image from 'next/image';
import styles from './HeroSection.module.css';
import Container from '../../container/Container';
import ButtonPrimary from '../../button-primary/ButtonPrimary';

type HeroButton = {
  label: string;
  href?: string;
  icon?: ReactNode;
};

type HeroSectionProps = {
  titleLead: string;
  titleMiddle: string;
  titleHighlight: string;
  description: string;
  primaryButton: HeroButton;
  secondaryButton?: HeroButton;
  image: { src: string; alt: string };
};

export default function HeroSection({
  titleLead,
  titleMiddle,
  titleHighlight,
  description,
  primaryButton,
  secondaryButton,
  image,
}: HeroSectionProps) {
  return (
    <Container sectionClassName={styles.smarterArbitrage}>
      <div className={styles.smarterArbitrageBox}>
        <div className={styles.smarterArbitrageContent}>
          <h1 className={styles.title}>
            <span>{titleLead}</span>{titleMiddle}<span className={styles.highlight}>{titleHighlight}</span>
          </h1>
          <p>
            {description.split('\n\n').map((paragraph, index, all) => (
              <React.Fragment key={index}>
                {paragraph}
                {index < all.length - 1 && (
                  <>
                    <br /> <br />
                  </>
                )}
              </React.Fragment>
            ))}
          </p>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <ButtonPrimary href={primaryButton.href} icon={primaryButton.icon}>
              {primaryButton.label}
            </ButtonPrimary>
            {secondaryButton && (
              <ButtonPrimary variant="secondary" href={secondaryButton.href} icon={secondaryButton.icon}>
                {secondaryButton.label}
              </ButtonPrimary>
            )}
          </div>
        </div>

        <div className={styles.smarterArbitrageMedia}>
          <Image
            src={image.src}
            alt={image.alt}
            width={600}
            height={436}
            className={styles.cardImage}
            priority
          />
        </div>
      </div>
    </Container>
  );
}