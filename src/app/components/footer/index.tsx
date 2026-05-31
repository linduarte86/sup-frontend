import styles from './style.module.scss';
import { Copyright } from 'lucide-react';

export function Footer() {
  return (
    <div className={styles.footerContainer}>
      <footer className={styles.footer}>
        <Copyright size={14} />
        {new Date().getFullYear()} Apel - Aplicações Eletrônicas. Todos os direitos reservados.
      </footer>
    </div>
  );
}