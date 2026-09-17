import React from 'react';
import styles from './SportsBetting.module.css';
import Container from '../../container/Container';
import { CompareLines, SpotDiscrepancies, FindOpportunities, ReduceChecking, ReduceCheAct } from "../../icon/icons";
import SectionHeading from '../../section-heading/SectionHeading';
import type { FeatureCard } from '../../../data/seoRichPage.types';

const icons = [<CompareLines key="0" />, <SpotDiscrepancies key="1" />, <FindOpportunities key="2" />, <ReduceChecking key="3" />, <ReduceCheAct key="4" />];

type SportsBettingProps = {
  highlight: string;
  title: string;
  description: string;
  cards: FeatureCard[];
};

export default function SportsBetting({ highlight, title, description, cards }: SportsBettingProps) {
  return (
    <Container sectionClassName={styles.SportsBettingSection}>
      <div className={styles.SportsBettingWrapper}>
        <SectionHeading
          highlight={highlight}
          title={title}
          description={description}
        />
        <ul>
          {cards.map((feature, index) => (
            <li key={index}>
              <div className={styles.SportsBettingBox}>
                <div className={styles.SportsBettingHead}>
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