import styles from './page.module.scss';
import logoImg from '../../public/logoApel1.svg';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/services/api';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function Page() {

  async function handleLogin(formData: FormData) {
    "use server"

    const email = formData.get('email');
    const password = formData.get('password');

    if (email === "" || password === "") {
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      if (!response.data.token) {
        return;
      }

      console.log(response.data);

      const expressTime = 60 * 60 * 24 *30 *1000;
      const cookiesStore = await cookies();

      cookiesStore.set("session", response.data.token, {
        maxAge: expressTime,
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production"
      })

    } catch (err) {
      console.log("Erro ao tentar fazer login:", err);
      return;
    }

    redirect("/dashboard");
  }

  return (
    <>
      <main className={styles.main}>

        <div className={styles.containerCenter}>
          <Image src={logoImg}
            alt="Logo apel"
          />

          <section className={styles.login}>
            <form action={handleLogin}>
              <label htmlFor="email" className={styles.label}>E-mail <span className={styles.required}>*</span></label>
              <input
                type="email"
                required
                placeholder="Digite seu e-mail..."
                name="email"
                className={styles.input}
              />

              <label htmlFor="password" className={styles.label}>Senha <span className={styles.required}>*</span></label>
              <input
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
