import React from 'react';
import styles from './TrackYour.module.css';
import Container from '../../container/Container';
import SectionHeading from '../../section-heading/SectionHeading';
import { MaintainHistorical, MeasureIndividual, ReviewBet, ReviewWhat, SkipThe, TrackRunning } from '../../icon/icons';
import type { FeatureCard } from '../../../data/seoRichPage.types';

const icons = [
  <TrackRunning key="0" />,
  <ReviewBet key="1" />,
  <MeasureIndividual key="2" />,
  <MaintainHistorical key="3" />,
  <ReviewWhat key="4" />,
  <SkipThe key="5" />,
];

type TrackYourProps = {
  highlight: string;
  title: string;
  description: string;
  cards: FeatureCard[];
};

export default function TrackYour({ highlight, title, description, cards }: TrackYourProps) {
  return (
    <Container sectionClassName={styles.TrackYourSection}>
      <div className={styles.TrackYourwrapper}>
        <SectionHeading
          highlight={highlight}
          title={title}
          description={description}
        />
        <ul>
          {cards.map((feature, index) => (
            <li key={index}>
              <div className={styles.TrackYourBox}>
                <div className={styles.TrackYourBoxHead}>
                  <i>{icons[index % icons.length]}</i>
                  <h3>{feature.title}</h3>
                </div>
                <p>{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}