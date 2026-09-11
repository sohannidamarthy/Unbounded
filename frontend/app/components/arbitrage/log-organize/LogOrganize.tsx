import React from 'react';
import styles from './LogOrganize.module.css';
import Container from '../../container/Container';
import { DocumentEach, EnterStake, MaintainBetting, PickOdds, RecordSportsbook, ReviewWithout, TrackEverything } from "../../icon/icons";
import SectionHeading from '../../section-heading/SectionHeading';

const SportsBets = [
  {
    icon: <RecordSportsbook />,
    "title": "Record the Sportsbook",
    "description": "Keep track of where each bet was placed."
  },
  {
    icon: <PickOdds />,
    "title": "Pick the Odds",
    "description": "Document the exact odds used for each position."
  },
  {
    icon: <EnterStake />,
    "title": "Enter Your Stake",
    "description": "Record the amount wagered on each bet."
  },
  {
    icon: <DocumentEach />,
    "title": "Document Each Position",
    "description": "Keep every side of an arbitrage bet clearly organized."
  },
  {
    icon: <MaintainBetting />,
    "title": "Maintain Betting History",
    "description": "Build a complete record of your past sports bets."
  },
  {
    icon: <ReviewWithout />,
    "title": "Review Without Rechecking",
    "description": "Avoid searching through notes to remember what you placed."
  },
  {
    icon: <TrackEverything />,
    "title": "Track Everything in One Place",
    "description": "Keep your sportsbook, odds, stakes, and positions together."
  }
];

export default function LogOrganize() {
  return (
    <section className={`section ${styles.LogOrganizeSection}`}>
      <Container fullWidth>
        <div className={styles.LogOrganizeWrapper}>
          <SectionHeading
            highlight="Log and Organize "
            title=" Your Sports Bets"
            description="Unbound helps you manage the opportunities you actually bet on, not just the ones you discover. Record the key details of every arbitrage position and keep your betting activity organized in one place."
          />
        </div>
        <ul>
          {SportsBets.map((feature, index) => (
            <li key={index}>
              <div className={styles.LogOrganizeBox}>
                <i>{feature.icon}</i>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section >
  );
}