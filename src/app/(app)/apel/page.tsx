import React from "react";
import styles from "./style.module.scss";
import { Globe, Phone, Instagram, Info, MessageCircle } from 'lucide-react';
import Image from 'next/image';

export default function Page() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>

        <div className={styles.titulo}>
          <Image src="/logoApel2.svg" alt="Logo Apel" width={60} height={60} className={styles.logo} />
        </div>

        <div className={styles.version}>
          <Info className={styles.icon} />
          <span className={styles.nameVersion}>Versão do Software: <strong>AP-SUP-WEB_v1</strong></span>
        </div>
      </header>

      <section className={styles.content}>
        <article className={styles.card}>
          <h2><Globe className={styles.icon} /> Site</h2>
          <p>
            Visite nosso site oficial:
            <br />
            <a href="https://www.apel.com.br" target="_blank" rel="noopener noreferrer">www.apel.com.br</a>
          </p>
        </article>

        <article className={styles.card}>
          <h2><Phone className={styles.icon} /> <MessageCircle/> Contatos</h2>
          <p>
            Telefone: <a href="tel:+558333312121">(83) 3331-2121</a>
            <br />
            <span>  WhatsApp:</span> <a href="https://wa.me/5583988250612" target="_blank" rel="noopener noreferrer">(83) 98825-0612</a>
            <br />
            Email: <a href="mailto:giovani.apel@gmail.com">giovani.apel@gmail.com</a>
            <br />
            Endereço: Av. Jorn. Assis Chateaubriand, 4193 - Distrito Industrial, Campina Grande - PB
          </p>
        </article>

        <article className={styles.card}>
          <h2><Instagram className={styles.icon} /> Redes Sociais</h2>
          <p>
            Instagram: <a href="https://www.instagram.com/apeltecnologia" target="_blank" rel="noopener noreferrer">@apeltecnologia</a>
          </p>
        </article>
      </section>
    </main>
  );
}