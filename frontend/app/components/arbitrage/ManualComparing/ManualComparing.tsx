import React from 'react';
import styles from './ManualComparing.module.css';
import Container from '../../container/Container';
import { CancelIcon, CheckIcon } from "../../icon/icons";
import SectionHeading from '../../section-heading/SectionHeading';
import type { ComparisonRow } from '../../../data/seoRichPage.types';

type ManualComparingProps = {
  highlight: string;
  title: string;
  description: string;
  manualColumnLabel: string;
  unboundColumnLabel: string;
  rows: ComparisonRow[];
};

export default function ManualComparing({
  highlight,
  title,
  description,
  manualColumnLabel,
  unboundColumnLabel,
  rows,
}: ManualComparingProps) {
  return (
    <Container sectionClassName={styles.ManualComparingSection}>
      <div className={styles.ManualComparingWrapper}>
        <SectionHeading
          highlight={highlight}
          title={title}
          description={description}
        />
        <div className={styles.HowUnboundTable}>
          <table>
            <thead>
              <th>Comparison</th>
              <th>{manualColumnLabel}</th>
              <th>{unboundColumnLabel}</th>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>{row.comparison}</td>
                  <td><div className={styles.tdBox}><CancelIcon />{row.manual}</div></td>
                  <td><div className={styles.tdBox}><CheckIcon />{row.unbound}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}