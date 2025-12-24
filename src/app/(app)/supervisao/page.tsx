import React from 'react';
//import SupMonitor1 from '@/app/components/supMonitor/monitor1';
import styles from './style.module.scss';
import SupMonitor2 from '@/app/components/supMonitor/monitor2';

export default function Page() {
  return (
    <main className={styles.page}>

      <div className={styles.title}>
        <h1>Monitor de Status</h1>
      </div>

      <div className={styles.container}>
        <SupMonitor2 />
      </div>

    </main>
  )
}