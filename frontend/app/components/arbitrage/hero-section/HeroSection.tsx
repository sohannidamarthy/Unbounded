import React from 'react';
import Image from 'next/image';
import styles from './HeroSection.module.css';
import Container from '../../container/Container';
import SmartArbitrage from '../../../../public/SmartArbitrage.jpg'
import ButtonPrimary from '../../button-primary/ButtonPrimary';

import { UserSearchIcon, OfferIcon } from "../../icon/icons";


export default function HeroSection() {
  return (    
    <section className={`section ${styles.smarterArbitrage}`}>
      <Container>
        <div className={styles.smarterArbitrageBox}>
          <div className={styles.smarterArbitrageContent}>
            <h1 className={styles.title}>
              <span>Smarter Arbitrage</span> Betting
              Starts with <span className={styles.highlight}>Unbound.</span>
            </h1>
            <p>Find and evaluate arbitrage betting opportunities across sports with Unbound. Scan sportsbook odds for pricing differences, validate potential arbitrage positions with built-in calculations, and understand your potential returns before placing your bets. <br /> <br /> Unbound brings opportunity discovery, bet validation, position tracking, and results management into one streamlined sports betting workflow.</p>

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
    </section>
  );
}