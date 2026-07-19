import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import PremiumFooter from '@/components/PremiumFooter';
import styles from '../blog-detail.module.css';
import { Article } from '../data';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/public/blogs/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.data as Article) || null;
  } catch (err) {
    console.error('Error fetching blog details:', err);
    return null;
  }
}

// Generate dynamic SEO metadata for each blog page using the slug
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (article) {
    return {
      title: `${article.title} | Medico Valley Blog`,
      description: article.excerpt,
      openGraph: {
        title: article.title,
        description: article.excerpt,
        images: [
          {
            url: article.imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
      },
    };
  }

  return {
    title: 'Article Not Found | Medico Valley Blog',
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return (
      <div className={styles.blogDetailPage}>
        <div className={styles.emptyState}>
          <h1>Article Not Found</h1>
          <p>We could not find the article matching the URL path: <strong>{slug}</strong>.</p>
          <Link href="/blog" className={styles.breadcrumbLink} style={{ margin: '0 auto' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span>Back to Blog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.blogDetailPage} animate-fade-in`}>
      <div className={styles.blogDetailShell}>
        
        {/* Back navigation */}
        <Link href="/blog" className={styles.breadcrumbLink}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <span>Back to Blog</span>
        </Link>

        {/* Hero Section */}
        <div className={styles.heroArea}>
          <div className={styles.heroBgWrapper}>
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1000px) 100vw, 1000px"
              className={styles.heroImage}
            />
            <div className={styles.heroOverlay} />
          </div>

          {/* Floating Premium Glass Card */}
          <div className={styles.glassCard}>
            <div className={styles.modalGlassShine} />
            <div className={styles.glassBreadcrumbs}>
              <Link href="/">Home</Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <Link href="/blog">Blog</Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>Article</span>
            </div>

            {/* Title with last word highlighted in teal */}
            <h1 className={styles.glassTitle}>
              {(() => {
                const words = article.title.split(' ');
                if (words.length <= 1) {
                  return <span className={styles.tealAccentText}>{article.title}</span>;
                }
                const lastWord = words.pop();
                const remainingText = words.join(' ');
                return (
                  <>
                    {remainingText}{' '}
                    <span className={styles.tealAccentText}>{lastWord}</span>
                  </>
                );
              })()}
            </h1>
            <div className={styles.titleUnderline} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className={styles.articleBody}>
          <div className={styles.metaRow}>
            <span>{article.date}</span>
            <div className={styles.metaDot} />
            <span>{article.readTime}</span>
          </div>

          {/* Highlights panel */}
          {article.highlights && article.highlights.length > 0 && (
            <div className={styles.highlights}>
              <h4 className={styles.highlightsTitle}>Key Takeaways</h4>
              <ul>
                {article.highlights.map((highlight, idx) => (
                  <li key={idx}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Body Paragraphs */}
          <div className={styles.contentParagraphs}>
            {article.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

      </div>

      {/* Premium Footer */}
      <div style={{ marginTop: '120px' }}>
        <PremiumFooter />
      </div>
    </div>
  );
}
