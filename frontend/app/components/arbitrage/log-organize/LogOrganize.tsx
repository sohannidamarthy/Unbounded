import React from 'react';
import styles from './LogOrganize.module.css';
import Container from '../../container/Container';
import { DocumentEach, EnterStake, MaintainBetting, PickOdds, RecordSportsbook, ReviewWithout, TrackEverything } from "../../icon/icons";
import SectionHeading from '../../section-heading/SectionHeading';
import type { FeatureCard } from '../../../data/seoRichPage.types';

const icons = [
  <RecordSportsbook key="0" />,
  <PickOdds key="1" />,
  <EnterStake key="2" />,
  <DocumentEach key="3" />,
  <MaintainBetting key="4" />,
  <ReviewWithout key="5" />,
  <TrackEverything key="6" />,
];

type LogOrganizeProps = {
  highlight: string;
  title: string;
  description: string;
  cards: FeatureCard[];
};

export default function LogOrganize({ highlight, title, description, cards }: LogOrganizeProps) {
  return (
    <Container sectionClassName={styles.LogOrganizeSection} fullWidth>
      <div className={styles.LogOrganizeWrapper}>
        <SectionHeading
          highlight={highlight}
          title={title}
          description={description}
        />
      </div>
      <ul>
        {cards.map((feature, index) => (
          <li key={index}>
            <div className={styles.LogOrganizeBox}>
              <i>{icons[index % icons.length]}</i>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}