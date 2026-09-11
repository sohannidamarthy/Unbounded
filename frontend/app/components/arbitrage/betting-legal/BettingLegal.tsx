import React from 'react';
import styles from './BettingLegal.module.css';
import Container from '../../container/Container';
import SectionHeading from '../../section-heading/SectionHeading';

const countries = [
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "New Zealand",
  "Ireland",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Denmark",
  "South Africa",
];

export default function BettingLegal() {
  return (
    <section className={`section ${styles.BettingLegalSection}`}>
      <Container>
        <SectionHeading
          highlight="Is Arbitrage Betting "
          title=" Legal?"
          description=" Arbitrage betting is generally not prohibited as a betting strategy. However, its legality depends on the gambling laws and licensed betting options available in the bettor’s jurisdiction. Regulations can also differ between states, provinces, or territories."
        />

        <div className={styles.BettingLegalBox}>
          <p>Countries and markets where sports betting is generally regulated include:</p>
          <ul>
            {countries.map((country, index) => (
              <li className={styles.countryItem} key={index}>
                {country}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}