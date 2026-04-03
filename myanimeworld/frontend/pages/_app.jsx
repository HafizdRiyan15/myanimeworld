import '../styles/globals.css';
import Head from 'next/head';
import { AuthProvider } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div className="min-h-screen bg-dark text-white">
        <Navbar />
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
