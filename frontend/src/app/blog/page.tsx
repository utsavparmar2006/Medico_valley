import Image from 'next/image';
import Link from 'next/link';
import PremiumFooter from '@/components/PremiumFooter';
import styles from './blog.module.css';
import { ARTICLES_DATABASE } from './data';

export default function BlogHubPage() {
  return (
    <div className={styles.blogWrapper}>
      {/* ── Hero Section ── */}
      <section className={styles.hero}>
        {/* Anatomy Watermark Overlay */}
        <div className={styles.heroWatermark} />
        
        <div className={styles.heroContent}>
          <span className={styles.heroPill}>Clinical Education &amp; Insights</span>
          <h1 className={styles.title}>
            Medico Valley's{' '}
            <span className={styles.titleAccent}>Anatomy Blog</span>
          </h1>
          <div className={styles.titleRule} />
          <p className={styles.subtitle}>
            Real-life application of A&P learning, clinical simulation resource updates, analysis & more
          </p>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <div className={styles.blogContainer}>
        {/* Main Column: Centered Grid */}
        <main className={styles.gridSection}>
          <div className={styles.blogGrid}>
            {ARTICLES_DATABASE.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className={styles.blogCard}
                id={`article-card-${article.id}`}
              >
                {/* Absolute Background Image */}
                <div className={styles.cardImageArea}>
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 500px"
                    className={styles.cardImage}
                  />
                </div>

                {/* Dark Transparent Mask Overlay */}
                <div className={styles.cardOverlay} />

                {/* Foreground Content */}
                <div className={styles.cardContent}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardFormat}>Blog</span>
                    
                    {/* Text Swapping Area */}
                    <div className={styles.textWrapper}>
                      <h3 className={styles.cardTitle}>{article.title}</h3>
                      <p className={styles.cardHoverText}>{article.excerpt}</p>
                    </div>
                  </div>

                  {/* Bottom Row: Date / Continue Reading Swap */}
                  <div className={styles.bottomRow}>
                    <span className={styles.cardDate}>{article.date}</span>
                    <span className={styles.continueReading}>Continue Reading</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>

      {/* ── Premium Footer ── */}
      <div style={{ marginTop: '120px' }}>
        <PremiumFooter />
      </div>
    </div>
  );
}
