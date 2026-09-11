import React from 'react';
import styles from './SportsBetting.module.css';
import Container from '../../container/Container';
import { CompareLines, SpotDiscrepancies, FindOpportunities, ReduceChecking, ReduceCheAct } from "../../icon/icons";
import SectionHeading from '../../section-heading/SectionHeading';

const features = [
  {
    title: "Compare Sportsbook Lines",
    description: "Compare lines across sportsbooks to spot potential differences quickly.",
    icon: <CompareLines />,
  },
  {
    title: "Spot Pricing Discrepancies",
    description: "Identify pricing differences that may create arbitrage opportunities.",
    icon: <SpotDiscrepancies />,
  },
  {
    title: "Find Arbitrage Opportunities",
    description: "Discover potential arbitrage setups across available sportsbook markets.",
    icon: <FindOpportunities />,
  },
  {
    title: "Reduce Manual Checking",
    description: "Cut down repetitive sportsbook monitoring and manual odds comparison.",
    icon: <ReduceChecking />,
  },
  {
    title: "Act While Odds Are Available",
    description: "Evaluate opportunities quickly before changing odds remove the edge.",
    icon: <ReduceCheAct />,
  },
];

export default function SportsBetting() {
  return (
    <section className={`section ${styles.SportsBettingSection}`}>
      <Container>
        <div className={styles.SportsBettingWrapper}>
          <SectionHeading
            highlight="Find the Edge"
            title=" in Sports Betting"
            description="Find and evaluate arbitrage betting opportunities across sports with Unbound."
          />
          <ul>
            {features.map((feature, index) => (
              <li key={index}>
                <div className={styles.SportsBettingBox}>
                  <div className={styles.SportsBettingHead}>
                    <i>{feature.icon}</i>
                    <h3>{feature.title}</h3>
                  </div>
                  <p>{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}