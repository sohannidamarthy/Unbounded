import React from 'react';
import styles from './ExploreArbitrage.module.css';
import { CrossSports, LiveSports, PreMatch, WayArbitrage, WayArbitrageBatting } from "../../icon/icons";
import Container from '../../container/Container';
import SectionHeading from '../../section-heading/SectionHeading';
import type { FeatureCard } from '../../../data/seoRichPage.types';

const icons = [
  <WayArbitrage key="0" />,
  <WayArbitrageBatting key="1" />,
  <CrossSports key="2" />,
  <LiveSports key="3" />,
  <PreMatch key="4" />,
];

type ExploreArbitrageProps = {
  highlight: string;
  title: string;
  description: string;
  cards: FeatureCard[];
};

export default function ExploreArbitrage({ highlight, title, description, cards }: ExploreArbitrageProps) {
  return (
    <Container sectionClassName={styles.ExploreArbitrageSection} fullWidth>
      <div className={styles.ExploreArbitrageWrapper}>
        <SectionHeading
          highlight={highlight}
          title={title}
          description={description}
        />
      </div>
      <ul>
        {cards.map((feature, index) => (
          <li key={index}>
            <div className={styles.ExploreArbitrageBox}>
              <div className={styles.ExploreArbitrageHead}>
                <i>{icons[index % icons.length]}</i>
                <h3>{feature.title}</h3>
              </div>
              <p>{feature.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Container>

  );
}