import styles from './style.module.scss';
import { BtCadastrar } from '@/app/components/button/btCadastrar';
import ContatosTable from '@/app/components/contatos/ContatosTable';


export default function Contatos() {
  return (

    <main className={styles.container}>

      <div className={styles.btCadastrar}>
        <BtCadastrar name='Cadastrar' endpoint='contatos'/>
      </div>

      <div className={styles.divTable}>
        <ContatosTable/>
      </div>

    </main>
  )
}