import React from 'react';
import styles from './HowUnbound.module.css';
import Container from '../../container/Container';
import { CaculateEdge, CompareOdds, LogBet, ScanBoards, TrackResults, ValidateOpportunity } from "../../icon/icons";
import SectionHeading from '../../section-heading/SectionHeading';
import type { FeatureCard } from '../../../data/seoRichPage.types';

const icons = [
  <ScanBoards key="0" />,
  <CompareOdds key="1" />,
  <CaculateEdge key="2" />,
  <ValidateOpportunity key="3" />,
  <LogBet key="4" />,
  <TrackResults key="5" />,
];

type HowUnboundProps = {
  highlight: string;
  title: string;
  description: string;
  cards: FeatureCard[];
};

export default function HowUnbound({ highlight, title, description, cards }: HowUnboundProps) {
  return (
    <Container sectionClassName={styles.HowUnboundSection}>
      <div className={styles.HowUnboundWrapper}>
        <SectionHeading
          highlight={highlight}
          title={title}
          description={description}
        />
        <ul>
          {cards.map((feature, index) => (
            <li key={index}>
              <div className={styles.HowUnboundBox}>
                <i>{icons[index % icons.length]}</i>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}