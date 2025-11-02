import TimePage from '@/app/components/timer/index';
import styles from './style.module.scss';

export default function Page() {

  return (

    <main className={styles.container}>
      <div className={styles.titulo}>
        <h1>Configuração de Timer</h1>
      </div>

      <div className={styles.divCard}>
       <TimePage/>
      </div>
    </main>
  )
}