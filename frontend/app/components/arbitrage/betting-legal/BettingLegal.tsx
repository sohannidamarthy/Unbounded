import React from 'react';
import styles from './BettingLegal.module.css';
import Container from '../../container/Container';
import SectionHeading from '../../section-heading/SectionHeading';

type BettingLegalProps = {
  highlight: string;
  title: string;
  description: string;
  marketsIntro: string;
  countries: string[];
};

export default function BettingLegal({ highlight, title, description, marketsIntro, countries }: BettingLegalProps) {
  return (
    <Container sectionClassName={styles.BettingLegalSection}>
      <SectionHeading
        highlight={highlight}
        title={title}
        description={description}
      />

      <div className={styles.BettingLegalBox}>
        <p>{marketsIntro}</p>
        <ul>
          {countries.map((country, index) => (
            <li className={styles.countryItem} key={index}>
              {country}
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
