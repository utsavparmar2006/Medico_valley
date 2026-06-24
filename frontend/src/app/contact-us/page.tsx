'use client';

import React, { useState } from 'react';
import PremiumFooter from '@/components/PremiumFooter';
import styles from './contact.module.css';

export default function ContactUs() {
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!fullName || !institution || !email || !phone || !city || !subject || !message) {
      setSubmitStatus({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit Inquiry to MongoDB Database via existing public route
      const res = await fetch('http://127.0.0.1:5000/api/public/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: '60d21b4667d0d8992e610c85', // Static mock ObjectId for general inquiries
          productName: 'General Inquiry Form',
          category: 'General Inquiry',
          customerName: fullName,
          institution,
          email,
          phone,
          city,
          quantity: 1,
          message: `Subject: ${subject}\n\nMessage: ${message}`,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitStatus({
          type: 'success',
          text: 'Thank you! Your message has been sent successfully. Our team will contact you shortly.',
        });
        // Reset form fields
        setFullName('');
        setInstitution('');
        setEmail('');
        setPhone('');
        setCity('');
        setSubject('');
        setMessage('');
      } else {
        throw new Error(data.message || 'Failed to submit contact request.');
      }
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setSubmitStatus({
        type: 'error',
        text: err.message || 'Could not connect to the server. Please try again or chat with us on WhatsApp.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <div className={styles.wrapper}>
      {/* Soft background ambient glow circles */}
      <div className={styles.glowCircle} style={{ top: '-10%', right: '5%' }} />
      <div className={styles.glowCircle} style={{ bottom: '10%', left: '5%' }} />

      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Get In Touch</span>
          <h1 className={styles.title}>Contact Medico Valley</h1>
          <p className={styles.subtitle}>
            Have questions about our medical simulators, anatomy models, or training equipment? Reach out to our technical team today.
          </p>
        </header>

        <div className={styles.grid}>
          {/* Left Column - Contact Details & Mock Map */}
          <div className={styles.infoColumn}>
            <div className={styles.cardsGrid}>
              <div className={styles.infoCard}>
                <div className={styles.cardIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div className={styles.cardContent}>
                  <h3>Phone Support</h3>
                  <p style={{ fontWeight: 600, color: '#0A8D93', marginTop: '4px' }}>+91 98765 43210</p>
                  <p>Mon - Sat, 9:00 AM to 6:00 PM</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.cardIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <div className={styles.cardContent}>
                  <h3>Email Addresses</h3>
                  <p style={{ fontWeight: 600, color: '#0A8D93', marginTop: '4px' }}>info@medicovalley.com</p>
                  <p>support@medicovalley.com</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.cardIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className={styles.cardContent}>
                  <h3>Office Location</h3>
                  <p style={{ marginTop: '4px' }}>402, Medico Plaza, Ring Road</p>
                  <p>Surat, Gujarat - 395002, India</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.cardIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className={styles.cardContent}>
                  <h3>Business Hours</h3>
                  <p style={{ marginTop: '4px' }}>Monday - Friday: 9 AM - 6 PM</p>
                  <p>Saturday: 9 AM - 2 PM (Sunday Closed)</p>
                </div>
              </div>
            </div>

            {/* Stylized Visual Map */}
            <div className={styles.mapCard}>
              <h3 className={styles.mapTitle}>Our Location</h3>
              <div className={styles.mapVisual}>
                {/* SVG mock map demonstrating clean premium aesthetics */}
                <svg width="100%" height="100%" viewBox="0 0 400 200" style={{ background: '#f1f5f9' }}>
                  <path d="M 0 50 Q 100 40 200 60 T 400 30" fill="none" stroke="#cbd5e1" strokeWidth="6" />
                  <path d="M 0 120 Q 150 140 250 110 T 400 130" fill="none" stroke="#cbd5e1" strokeWidth="8" />
                  <path d="M 120 0 L 120 200" fill="none" stroke="#cbd5e1" strokeWidth="5" />
                  <path d="M 280 0 L 280 200" fill="none" stroke="#cbd5e1" strokeWidth="6" />
                  
                  {/* Grid lines */}
                  <line x1="50" y1="0" x2="50" y2="200" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="200" y1="0" x2="200" y2="200" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="350" y1="0" x2="350" y2="200" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#e2e8f0" strokeDasharray="3,3" />
                  
                  {/* Location Pin */}
                  <g transform="translate(280, 110)">
                    <circle cx="0" cy="0" r="16" fill="rgba(10, 141, 147, 0.2)" />
                    <circle cx="0" cy="0" r="8" fill="rgba(10, 141, 147, 0.4)" />
                    <path d="M 0 -22 C -6 -16 -8 -12 -8 -8 C -8 -3 -3 1 0 1 C 3 1 8 -3 8 -8 C 8 -12 6 -16 0 -22 Z" fill="#0A8D93" />
                    <circle cx="0" cy="-10" r="3" fill="#ffffff" />
                  </g>
                  
                  <text x="295" y="105" fill="#0f172a" fontSize="11" fontWeight="700" fontFamily="sans-serif">Medico Valley Plaza</text>
                  <text x="295" y="120" fill="#64748b" fontSize="9" fontFamily="sans-serif">HQ Location</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Send a Message</h3>
            
            {submitStatus && (
              <div className={submitStatus.type === 'success' ? styles.alertSuccess : styles.alertError}>
                {submitStatus.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="contact-name">Full Name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="E.g., Dr. Amit Sharma"
                    className={styles.input}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="contact-institution">Institution / Company *</label>
                  <input
                    id="contact-institution"
                    type="text"
                    required
                    placeholder="E.g., City Medical College"
                    className={styles.input}
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="contact-email">Email Address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="E.g., amit.sharma@college.edu"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="contact-phone">Phone Number *</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    placeholder="E.g., +91 98989 89898"
                    className={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="contact-city">City / State *</label>
                  <input
                    id="contact-city"
                    type="text"
                    required
                    placeholder="E.g., Ahmedabad, Gujarat"
                    className={styles.input}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="contact-subject">Subject *</label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    placeholder="E.g., Inquiry regarding CPR Simulators"
                    className={styles.input}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="contact-message">Message Details *</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="Tell us about your requirements in detail..."
                  className={styles.input}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner}></div>
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Message</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
    <PremiumFooter />
  </>
  );
}
