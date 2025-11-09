import React from 'react';
import SupMonitor from '@/app/components/supMonitor';
import styles from './style.module.scss';

export default function Page() {
  return (
    <main>
      <div className={styles.page}>
        <h1>Supervisão</h1>
      </div>

      <SupMonitor />
    </main>
  )
}