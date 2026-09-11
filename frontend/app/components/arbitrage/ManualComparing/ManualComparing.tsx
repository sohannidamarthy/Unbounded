import React from 'react';
import styles from './ManualComparing.module.css';
import Container from '../../container/Container';
import { CancelIcon, CheckIcon } from "../../icon/icons";
import SectionHeading from '../../section-heading/SectionHeading';

const comparisonData = [
  {
    comparison: "Compare Lines",
    manual: "Check multiple sportsbooks individually",
    cancelIcon: <CancelIcon />,
    checkIcon: <CheckIcon />,
    unbound: "Compare sportsbook lines in one workflow",
  },
  {
    comparison: "Pick the Odds",
    manual: "Manually find and pick the odds",
    cancelIcon: <CancelIcon />,
    checkIcon: <CheckIcon />,
    unbound: "Quickly identify relevant odds and pricing differences",
  },
  {
    comparison: "Spot Opportunities",
    manual: "Search manually for arbitrage gambling opportunities",
    cancelIcon: <CancelIcon />,
    checkIcon: <CheckIcon />,
    unbound: "Identify potential arbitrage opportunities more efficiently",
  },
  {
    comparison: "Calculate the Edge",
    manual: "Use separate calculators or manual calculations",
    cancelIcon: <CancelIcon />,
    checkIcon: <CheckIcon />,
    unbound: "Evaluate opportunities using built-in calculations",
  },
  {
    comparison: "Monitor Changes",
    manual: "Recheck sportsbooks as odds change",
    cancelIcon: <CancelIcon />,
    checkIcon: <CheckIcon />,
    unbound: "Keep relevant opportunities easier to review",
  },
  {
    comparison: "Betting Tools",
    manual: "Switch between multiple betting tools",
    cancelIcon: <CancelIcon />,
    checkIcon: <CheckIcon />,
    unbound: "Bring opportunity discovery and evaluation together",
  },
  {
    comparison: "Track Bets",
    manual: "Maintain separate records or spreadsheets",
    cancelIcon: <CancelIcon />,
    checkIcon: <CheckIcon />,
    unbound: "Log bets and track running P&L",
  },
];

export default function ManualComparing() {
  return (
    <section className={`section ${styles.ManualComparingSection}`}>
      <Container>
        <div className={styles.ManualComparingWrapper}>
          <SectionHeading
            highlight="Manual Comparing vs Unbound&rsquo;s"
            title=" Arbitrage Betting Tool"
          description="Unbound streamlines the sports arbitrage betting workflow by helping bettors discover, evaluate,  validate, and track potential opportunities."
          />
          <div className={styles.HowUnboundTable}>
            <table>
              <thead>
                <th>Comparison</th>
                <th>Manual Comparing</th>
                <th>Unbound&rsquo;s Arbitrage Betting Tool</th>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.comparison}</td>
                    <td><div className={styles.tdBox}>{row.cancelIcon}{row.manual}</div></td>
                    <td><div className={styles.tdBox}>{row.checkIcon}{row.unbound}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section >
  );
}