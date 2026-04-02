import '../styles/globals.css';
import { AuthProvider } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-dark text-white">
        <Navbar />
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
