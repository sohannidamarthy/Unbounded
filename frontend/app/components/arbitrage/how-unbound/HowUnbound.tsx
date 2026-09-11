import React from 'react';
import styles from './HowUnbound.module.css';
import Container from '../../container/Container';
import { CaculateEdge, CompareOdds, LogBet, ScanBoards, TrackResults, ValidateOpportunity } from "../../icon/icons";
import SectionHeading from '../../section-heading/SectionHeading';

const howUnbound = [
  {
    title: "Scan the Boards",
    description: "Monitor sportsbook boards to find potential arbitrage opportunities across changing odds.",
    icon: <ScanBoards />,
  },
  {
    title: "Compare the Odds",
    description: "Review different sportsbook prices for the same sporting event or market.",
    icon: <CompareOdds />,
  },
  {
    title: "Calculate the Edge",
    description: "Use the calculator to assess implied probability, arbitrage percentage, stake allocation, and potential returns.",
    icon: <CaculateEdge />,
  },
  {
    title: "Validate the Opportunity",
    description: "Confirm the available odds and calculations before deciding to place the bets.",
    icon: <ValidateOpportunity />,
  },
  {
    title: "Log the Bet",
    description: "Record validated arbitrage bets and keep your betting activity organized.",
    icon: <LogBet />,
  },
  {
    title: "Track Results",
    description: "Monitor completed bets and running P&L to understand your overall betting performance.",
    icon: <TrackResults />,
  },
];

export default function HowUnbound() {
  return (
    <section className={`section ${styles.HowUnboundSection}`}>
      <Container>
        <div className={styles.HowUnboundWrapper}>
          <SectionHeading
            highlight="How Unbound"
            title=" Works"
            description="Unbound streamlines the sports arbitrage betting workflow by helping bettors discover, evaluate, validate, and track potential opportunities."
          />
          <ul>
            {howUnbound.map((feature, index) => (
              <li key={index}>
                <div className={styles.HowUnboundBox}>
                  <i>{feature.icon}</i>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section >
  );
}