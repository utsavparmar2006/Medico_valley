'use client';

import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '@/utils/api';
import styles from '@/app/page.module.css';

interface Client {
  _id: string;
  name: string;
  location: string;
  testimonial: string;
  type: string;
  logoUrl: string;
}

export default function InstitutionTrustSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const response = await fetch(getBackendUrl(`http://127.0.0.1:5001/api/public/clients?t=${Date.now()}`), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }).catch(() => null);
      if (response && response.ok) {
        const data = await response.json().catch(() => null);
        if (data && data.success && Array.isArray(data.data)) {
          setClients(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Duplicate the list to support seamless infinite auto-scrolling loop
  const listToRender = clients.length > 0 
    ? [...clients, ...clients, ...clients, ...clients] 
    : [];

  return (
    <section className={styles.clientSection}>
      <div className={styles.clientContainer}>
        {/* Header content */}
        <div className={styles.clientHeader}>
          <h2 className={styles.clientTitle}>Trusted by Healthcare Education Institutions Across India</h2>
          <p className={styles.clientDesc}>
            Supporting medical colleges, universities, hospitals, nursing institutions and training centres with practical, high-quality simulation solutions.
          </p>
        </div>

        {/* Endless Marquee Ticker or Empty State */}
        {loading ? (
          <div style={{ textAlign: 'center', width: '100%', color: '#94a3b8', padding: '30px 20px', fontSize: '0.95rem' }}>
            Loading trusted institutions...
          </div>
        ) : clients.length > 0 ? (
          <div className={styles.clientSliderContainer}>
            <div className={styles.clientSlider}>
              {listToRender.map((client, idx) => (
                <div key={`${client._id}-${idx}`} className={styles.logoCard}>
                  {/* Front: Dynamic sharp logo */}
                  <div className={styles.logoFront}>
                    <img
                      src={client.logoUrl ? (client.logoUrl.startsWith('http') ? client.logoUrl : getBackendUrl(`http://127.0.0.1:5001${client.logoUrl}`)) : ''}
                      alt={client.name}
                      className={styles.clientLogoImage}
                    />
                  </div>

                  {/* Back/Hover: Testimonial details inside the card */}
                  <div className={styles.logoBackOverlay}>
                    <div className={styles.cardQuoteMark}>“</div>
                    <p className={styles.cardTestimonial}>
                      {client.testimonial}
                    </p>
                    <span className={styles.cardClientAuthor}>
                      — {client.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', width: '100%', color: '#64748b', padding: '40px 20px', fontSize: '1rem', fontWeight: 500 }}>
            No client institutions available at the moment.
          </div>
        )}
      </div>
    </section>
  );
}
