import "@/styles/globals.css";
import { MusicProvider } from '@/MusicContext.js';

export default function App({ Component, pageProps }) {
  return <MusicProvider>
    <Component {...pageProps} />
  </MusicProvider>;
}
