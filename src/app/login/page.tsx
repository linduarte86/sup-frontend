"use client";

import styles from './style.module.scss';
import logoImg from '../../../public/logoApel1.svg';
import Image from 'next/image';
import { api } from '@/services/apiClient';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { toast } from 'sonner';

export default function Page() {

  const router = useRouter();

  async function handleLogin(formData: FormEvent<HTMLFormElement>) {

    formData.preventDefault();

    const formDataObj = new FormData(formData.currentTarget);
    const email = formDataObj.get('email');
    const password = formDataObj.get('password');

    if (!email || !password) {
      return;
    }

    try {
      const res = await api.post('/auth/login', {
        email,
        password
      });
      console.log("Login realizado com sucesso:", res.data.name);
      toast.success(`Bem-vindo, ${res.data.name}!`);

    } catch (err) {
      console.log("Erro ao tentar fazer login:", err);
      toast.error('Falha ao fazer login. Verifique suas credenciais.');
      return;
    }
    // Redirecionar para dashboard após o cookies ser setado
    router.push('/dashboard');
  }

  return (
    <>
      <main className={styles.main}>

        <div className={styles.containerCenter}>
          <Image src={logoImg}
            alt="Logo apel"
          />

          <section className={styles.login}>
            <form onSubmit={handleLogin}>
              <label htmlFor="email" className={styles.label}>E-mail <span className={styles.required}>*</span></label>
              <input
                id="email"
                type="email"
                required
                placeholder="Digite seu e-mail..."
                name="email"
                className={styles.input}
              />

              <label htmlFor="password" className={styles.label}>Senha <span className={styles.required}>*</span></label>
              <input
                id="password"
                type="password"
                required
                placeholder="**********"
                name="password"
                className={styles.input}
              />

              <button type='submit'>
                Entrar
              </button>
            </form>
          </section>
        </div>

      </main>
    </>
  );
}
