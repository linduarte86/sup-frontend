import styles from './style.module.scss';

export function Footer() {
  return (
    <div className={styles.footerContainer}>
      <footer className={styles.footer}>
        <p>Apel - Aplicações Eletrônicas</p>
      </footer>
    </div>
  );
}