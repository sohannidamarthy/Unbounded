import React from 'react';
import styles from './ValidateSports.module.css';
import Container from '../../container/Container';
import { EnterBetting, CheckImplied, PlanStake, CalculateArbitrage, ReviewPotential, EstimatePotential, EvaluatePositive } from "../../icon/icons";
import SectionHeading from '../../section-heading/SectionHeading';

const steps = [
  {
    title: "Enter Betting Odds",
    description: "Add available decimal or American odds to evaluate the opportunity.",
    icon: <EnterBetting />,
  },
  {
    title: "Check Implied Probability",
    description: "Understand the probability represented by available sportsbook odds.",
    icon: <CheckImplied />,
  },
  {
    title: "Calculate Arbitrage Percentage",
    description: "Review the arbitrage percentage to assess the potential betting edge.",
    icon: <CalculateArbitrage />,
  },
  {
    title: "Plan Stake Allocation",
    description: "Determine how to distribute stakes across the relevant outcomes.",
    icon: <PlanStake />,
  },
  {
    title: "Review Potential Payout",
    description: "See the potential payout based on the calculated stake amounts.",
    icon: <ReviewPotential />,
  },
  {
    title: "Estimate Potential Return",
    description: "Understand the potential return associated with the arbitrage position.",
    icon: <EstimatePotential />,
  },
  {
    title: "Evaluate Positive EV",
    description: "Review positive EV opportunities alongside potential arbitrage positions.",
    icon: <EvaluatePositive />,
  },
];

export default function ValidateSports() {
  return (
    <section className={`section ${styles.ValidateSportsSection}`}>
      <Container fullWidth>
        <SectionHeading
          highlight="Validate Your Sports "
          title=" Betting Opportunities"
          description="Use Unbound&apos;s Arbitrage betting calculator to evaluate potential arbitrage opportunities before placing bets. Enter the available sportsbook odds and review key calculations to understand the strength and potential outcomes of each  opportunity. This helps bettors validate pricing differences, determine appropriate stake allocation, and assess potential  returns before committing funds."
        />
        <ul>
          {steps.map((feature, index) => (
            <li key={index}>
              <div className={styles.ValidateSportsBox}>
                <div className={styles.ValidateSportsHead}>
                  <i>{feature.icon}</i>
                  <h3>{feature.title}</h3>
                </div>
                <p>{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>

    </section >
  );
}