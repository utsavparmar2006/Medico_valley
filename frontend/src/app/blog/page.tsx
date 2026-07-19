import PremiumFooter from '@/components/PremiumFooter';
import styles from './blog.module.css';
import BlogInfiniteGrid from '@/components/BlogInfiniteGrid';

async function getArticles() {
  try {
    const res = await fetch('http://localhost:5000/api/public/blogs', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return [];
  }
}

export default async function BlogHubPage() {
  const articles = await getArticles();

  return (
    <div className={styles.blogWrapper}>
      {/* ── Hero Section ── */}
      <section className={styles.hero}>
        {/* Anatomy Watermark Overlay */}
        <div className={styles.heroWatermark} />
        
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Simulation Resources &amp; Insights
          </h1>
          <p className={styles.subtitle}>
            Stay updated with the latest in healthcare. Our blog features expert insights, breakthrough stories, and essential resources to keep you in the know.
          </p>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <div className={styles.blogContainer}>
        {/* Main Column: Centered Grid */}
        <main className={styles.gridSection}>
          <BlogInfiniteGrid allArticles={articles} pageSize={4} />
        </main>
      </div>

      {/* ── Premium Footer ── */}
      <div style={{ marginTop: '120px' }}>
        <PremiumFooter />
      </div>
    </div>
  );
}
