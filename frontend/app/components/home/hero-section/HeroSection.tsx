import React from 'react';
import Image from 'next/image';
import styles from './HeroSection.module.css';
import Container from '../../container/Container';
import SmartArbitrage from '../../../../public/SmartArbitrage.jpg'
import ButtonPrimary from '../../button-primary/ButtonPrimary';

import { UserSearchIcon, OfferIcon } from "../../icon/icons";


export default function HeroSection() {
  return (
    <Container sectionClassName={styles.smarterArbitrage}>
      <div className={styles.smarterArbitrageBox}>
        <div className={styles.smarterArbitrageContent}>
          <h1 className={styles.title}>
            Unlock sharper market <span> insight.</span>
          </h1>
          <p>A focused workspace for odds, alerts, and edge tracking. Create an account or explore the pricing tiers to get started.</p>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <ButtonPrimary href='/arbitrage-bets' icon={<UserSearchIcon />}>
              Open arbitrage board
            </ButtonPrimary>
            <ButtonPrimary variant="secondary" icon={<OfferIcon />}>
              Join newsletter
            </ButtonPrimary>
          </div>
        </div>

        <div className={styles.smarterArbitrageMedia}>
          <Image
            src={SmartArbitrage}
            alt="Unbound Dashboard Preview"
            width={600}
            height={436}
            className={styles.cardImage}
            priority
          />
        </div>
      </div>
    </Container>
  );
}