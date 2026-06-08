import { Nunito } from 'next/font/google';
import styles from './WaveFunciona.module.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['900'],
  display: 'swap',
});

export default function WaveFunciona() {
  const texto = "¿Cómo funciona?";
  return (
    <div className={`${styles.content} ${nunito.className}`}>
      <h2>{texto}</h2>
      <h2>{texto}</h2>
    </div>
  );
}
