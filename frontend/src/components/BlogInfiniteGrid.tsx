'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/app/blog/blog.module.css';
import { Article } from '@/app/blog/data';

interface Props {
  allArticles: Article[];
  pageSize: number;
}

export default function BlogInfiniteGrid({ allArticles, pageSize }: Props) {
  const router = useRouter();

  if (allArticles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'rgba(255, 255, 255, 0.5)', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', margin: '40px auto', maxWidth: '600px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '56px', marginBottom: '16px', color: '#0A8D93', display: 'inline-block' }}>article</span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '8px' }}>No Blog Articles Found</h3>
        <p style={{ fontSize: '0.92rem', maxWidth: '380px', margin: '0 auto', lineHeight: '1.5' }}>We are updating our catalog with new educational resources and clinical insights. Please check back soon!</p>
      </div>
    );
  }

  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Sync state with props when Server Components refresh/revalidate
  useEffect(() => {
    setArticles(allArticles.slice(0, pageSize));
    setPage(1);
  }, [allArticles, pageSize]);



  const hasMore = articles.length < allArticles.length;

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loading) return;

        setLoading(true);
        // Add a smooth simulation delay of 600ms
        setTimeout(() => {
          const nextPage = page + 1;
          const newArticles = allArticles.slice(0, nextPage * pageSize);
          setArticles(newArticles);
          setPage(nextPage);
          setLoading(false);
        }, 600);
      },
      { rootMargin: '100px 0px' }
    );

    observer.observe(loader);

    return () => observer.disconnect();
  }, [hasMore, loading, page, pageSize, allArticles]);

  return (
    <>
      <div className={styles.blogGrid}>
        {articles.map((article) => {
          const articleId = article.id || article._id || '';
          const articleDate = article.date || (article.createdAt ? new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '');
          return (
            <Link
              key={articleId}
              href={`/blog/${article.slug}`}
              className={styles.blogCard}
              id={`article-card-${articleId}`}
            >
              {/* Normal State Layout */}
              <div className={styles.cardNormalState}>
                <div className={styles.cardImageArea}>
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 500px"
                    className={styles.cardImage}
                  />
                </div>
                <div className={styles.cardContentArea}>
                  <h3 className={styles.cardNormalTitle}>
                    {article.title}
                    <span className={styles.arrowSymbol}> &gt;</span>
                  </h3>
                </div>
              </div>

              {/* Hover State Layout */}
              <div className={styles.cardHoverState}>
                <span className={styles.hoverFormat}>BLOG</span>
                <h3 className={styles.hoverTitle}>{article.title}</h3>
                <p className={styles.hoverExcerpt}>{article.excerpt}</p>
                <div className={styles.readMoreBtn}>Read More</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div 
        ref={loaderRef} 
        style={{
          textAlign: 'center',
          padding: '40px 0',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div className="blogSpinner" style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(255, 255, 255, 0.1)',
              borderTopColor: '#ffffff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span>Loading more articles...</span>
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
