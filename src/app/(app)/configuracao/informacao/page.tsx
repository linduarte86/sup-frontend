import Informacao from '@/app/components/informacao';
import styles from './style.module.scss';
export default function Page() {

  return (
    <main className={styles.container}>
      <div className={styles.titulo}>
        <h1>Informações do Sistema</h1>
      </div>
     <div>
       <Informacao />
     </div>
    </main>
  )
}
