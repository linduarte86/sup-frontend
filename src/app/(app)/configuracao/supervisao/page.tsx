import styles from './style.module.scss';
import { BtCadastrar } from '@/app/components/button/btCadastrar';
import SupTable from '@/app/components/supervisao/SupTable';


export default function Contatos() {
  return (

    <main className={styles.container}>

      <div className={styles.btCadastrar}>
        <BtCadastrar name='Cadastrar' endpoint='equipamentos'/>
      </div>

      <div className={styles.divTable}>
        <SupTable/>
      </div>

    </main>
  )
}