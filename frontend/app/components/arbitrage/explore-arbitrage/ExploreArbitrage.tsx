import React from 'react';
import styles from './ExploreArbitrage.module.css';
import Container from '../../container/Container';
import { CrossSports, LiveSports, PreMatch, WayArbitrage, WayArbitrageBatting } from "../../icon/icons";
import SectionHeading from '../../section-heading/SectionHeading';


const BettingStrategies = [
  {
    icon: <WayArbitrage />,
    "title": "2-Way Arbitrage Betting",
    "description": "Two-way arbitrage covers markets with two possible outcomes, such as moneyline bets in certain sports or over/under markets. Bettors compare prices across sportsbooks and look for odds that can cover both outcomes."
  },
  {
    icon: <WayArbitrageBatting />,
    "title": "3-Way Arbitrage Betting",
    "description": "Three-way arbitrage applies to markets with three possible outcomes, commonly including soccer match results: home win, draw, or away win. Different sportsbook prices are compared to identify potential pricing discrepancies across all three outcomes."
  },
  {
    icon: <CrossSports />,
    "title": "Cross-Sportsbook Arbitrage",
    "description": "Cross-sportsbook arbitrage involves comparing odds offered by multiple sportsbooks for the same event and market. Differences in pricing can create potential arbitrage opportunities when the combined implied probabilities meet the required conditions."
  },
  {
    icon: <LiveSports />,
    "title": "Live Sports Arbitrage",
    "description": "Live arbitrage involves evaluating changing odds while a sporting event is in progress. Since prices can move quickly, opportunities may appear and disappear within a short period."
  },
  {
    icon: <PreMatch />,
    "title": "Pre-Match Arbitrage",
    "description": "Pre-match arbitrage focuses on opportunities available before an event begins. Bettors have more time to compare sportsbook lines, calculate positions, and evaluate the available prices."
  }
];

export default function ExploreArbitrage() {
  return (
    <section className={`section ${styles.ExploreArbitrageSection}`}>
      <Container fullWidth>
        <div className={styles.ExploreArbitrageWrapper}>
          <SectionHeading
            highlight="Explore Arbitrage "
            title=" Betting Strategies"
            description="Arbitrage betting can take several forms depending on the number of outcomes, sportsbook prices, and timing of the wager. Understanding these approaches can help bettors recognize potential opportunities and choose the right odds for each position."
          />
        </div>
        <ul>
          {BettingStrategies.map((feature, index) => (
            <li key={index}>
              <div className={styles.ExploreArbitrageBox}>
                <div className={styles.ExploreArbitrageHead}>
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