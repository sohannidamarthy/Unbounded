import React from 'react';
import styles from './TrackYour.module.css';
import Container from '../../container/Container';
import SectionHeading from '../../section-heading/SectionHeading';
import { MaintainHistorical, MeasureIndividual, ReviewBet, ReviewWhat, SkipThe, TrackRunning } from '../../icon/icons';

const SportsBets = [
  {
    "icon": <TrackRunning />,
    "title": "Track Running P&L",
    "description": "Monitor your overall profit and loss as results are recorded."
  },
  {
    "icon": <ReviewBet />,
    "title": "Review Bet Results",
    "description": "See how individual logged bets performed after settlement."
  },
  {
    "icon": <MeasureIndividual />,
    "title": "Measure Individual Performance",
    "description": "Understand the outcome and performance of each betting position."
  },
  {
    "icon": <MaintainHistorical />,
    "title": "Maintain Historical Records",
    "description": "Keep a clear history of your completed sports bets."
  },
  {
    "icon": <ReviewWhat />,
    "title": "Review What Worked",
    "description": "Look back at previous results to identify useful patterns."
  },
  {
    "icon": <SkipThe />,
    "title": "Skip the Spreadsheet",
    "description": "Track your betting performance without maintaining separate spreadsheets."
  }
];

export default function TrackYour() {
  return (
    <section className={`section ${styles.TrackYourSection}`}>
      <Container>
        <div className={styles.TrackYourwrapper}>
          <SectionHeading
            highlight="Track Your Sports "
            title=" Betting P&L"
            description="Unbound helps you keep track of your betting performance after each arbitrage opportunity."
          />
          <ul>
            {SportsBets.map((feature, index) => (
              <li key={index}>
                <div className={styles.TrackYourBox}>
                  <div className={styles.TrackYourBoxHead}>
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