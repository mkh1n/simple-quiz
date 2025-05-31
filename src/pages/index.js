import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import { useMusic } from '@/MusicContext.js';

export default function Home() {
  const { toggleSound, isSoundOn } = useMusic();
  const router = useRouter();

  const handleButtonClick = () => {
    router.push('/main-game-page');
  };

  return (
    <>
      <Head>
        <title>Викторина</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.page}>
        <main className={styles.main}>
          <h1 className={styles.title}>Викторина</h1>
          <p>Проверь свои знания гениальной игры Undertale</p>
          <button className={styles.mainButton} onClick={handleButtonClick}>Начать</button>
        </main>
      </div>
    </>
  );
}
