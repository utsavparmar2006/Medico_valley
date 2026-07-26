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
      const response = await fetch(getBackendUrl(`http://127.0.0.1:5000/api/public/clients?t=${Date.now()}`), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }).catch(() => null);
      if (response && response.ok) {
        const data = await response.json().catch(() => null);
        if (data && data.success) {
          setClients(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchClients().finally(() => setLoading(false));

  }, []);

  if (loading) {
    return (
      <section className={styles.clientSection}>
        <div className={styles.clientContainer}>
          <div className={styles.clientHeader}>
            <h2 className={styles.clientTitle}>Top clients</h2>
            <p className={styles.clientDesc}>Loading clients showcase...</p>
          </div>
        </div>
      </section>
    );
  }

  if (clients.length === 0) {
    return null; // Don't render empty section
  }

  // Duplicate the list to support seamless infinite auto-scrolling loop
  // Render at least twice, or more if clients list is small
  const listToRender = clients.length < 5 
    ? [...clients, ...clients, ...clients, ...clients] 
    : [...clients, ...clients];

  return (
    <section className={styles.clientSection}>
      <div className={styles.clientContainer}>
        {/* Header content */}
        <div className={styles.clientHeader}>
          <h2 className={styles.clientTitle}>Top clients</h2>
          <p className={styles.clientDesc}>
            We partner with a diverse spectrum of clients, from prestigious healthcare institutions and 
            associations to safety organizations, schools, and even airlines. Each collaboration is a step 
            towards advancing education, safety, and patient care.
          </p>
        </div>

        {/* Endless Marquee Ticker */}
        <div className={styles.clientSliderContainer}>
          <div className={styles.clientSlider}>
            {listToRender.map((client, idx) => (
              <div key={`${client._id}-${idx}`} className={styles.logoCard}>
                {/* Front: Dynamic sharp logo */}
                <div className={styles.logoFront}>
                  <img
                    src={client.logoUrl ? (client.logoUrl.startsWith('http') ? client.logoUrl : getBackendUrl(`http://127.0.0.1:5000${client.logoUrl}`)) : ''}
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
      </div>
    </section>
  );
}
