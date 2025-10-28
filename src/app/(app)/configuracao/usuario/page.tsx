import styles from './style.module.scss';
import { BtCadastrar } from '@/app/components/button/btCadastrar';
import UsersTable from '@/app/components/users/UsersTable';

export default function Usuario() {
  return (

    <main className={styles.container}>

      <div className={styles.btCadastrar}>
        <BtCadastrar name='Cadastrar' endpoint='users'/>
      </div>

      <div className={styles.divTable}>
        <UsersTable />
      </div>

    </main>
  )
}