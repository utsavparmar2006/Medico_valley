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

const FALLBACK_CLIENTS: Client[] = [
  {
    _id: 'client-1',
    name: 'Academia Medica University of Health & Science',
    location: 'India',
    testimonial: 'Empowering our clinical students and medical staff with standard clinical simulators. The educational impact is highly quantifiable.',
    type: 'Medical University',
    logoUrl: '/uploads/client_logo_1.png',
  },
  {
    _id: 'client-2',
    name: 'Royal Medical College',
    location: 'India',
    testimonial: 'The turnkey simulation lab planning and high-fidelity task trainers transformed our practical clinical training curriculum.',
    type: 'Medical College',
    logoUrl: '/uploads/client_logo_2.png',
  },
  {
    _id: 'client-3',
    name: 'Apollo Healthcare & Hospitals Group',
    location: 'India',
    testimonial: 'Empowering our clinical students and medical staff with standard clinical simulators. The educational impact is highly quantifiable.',
    type: 'Healthcare Institution',
    logoUrl: '/uploads/client_logo_3.png',
  },
];

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
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setClients(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  useEffect(() => {
    fetchClients().finally(() => setLoading(false));
  }, []);

  const displayClients = clients.length > 0 ? clients : FALLBACK_CLIENTS;

  // Duplicate the list to support seamless infinite auto-scrolling loop
  const listToRender = [...displayClients, ...displayClients, ...displayClients, ...displayClients];

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
