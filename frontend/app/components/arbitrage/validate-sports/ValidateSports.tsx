import React from 'react';
import styles from './ValidateSports.module.css';
import Container from '../../container/Container';
import { EnterBetting, CheckImplied, PlanStake, CalculateArbitrage, ReviewPotential, EstimatePotential, EvaluatePositive } from "../../icon/icons";
import SectionHeading from '../../section-heading/SectionHeading';
import type { FeatureCard } from '../../../data/seoRichPage.types';

const icons = [
  <EnterBetting key="0" />,
  <CheckImplied key="1" />,
  <CalculateArbitrage key="2" />,
  <PlanStake key="3" />,
  <ReviewPotential key="4" />,
  <EstimatePotential key="5" />,
  <EvaluatePositive key="6" />,
];

type ValidateSportsProps = {
  highlight: string;
  title: string;
  description: string;
  cards: FeatureCard[];
};

export default function ValidateSports({ highlight, title, description, cards }: ValidateSportsProps) {
  return (
    <Container sectionClassName={styles.ValidateSportsSection} fullWidth>
      <SectionHeading
        highlight={highlight}
        title={title}
        description={description}
      />
      <ul>
        {cards.map((feature, index) => (
          <li key={index}>
            <div className={styles.ValidateSportsBox}>
              <div className={styles.ValidateSportsHead}>
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