import React from 'react';
import LogsTable from '@/app/components/logs/LogsTable';
import styles from './style.module.scss';

export default function Page() {
  return (
    <main className={styles.container}>
      <h1>Logs</h1>
      <LogsTable />
    </main>
  );
}