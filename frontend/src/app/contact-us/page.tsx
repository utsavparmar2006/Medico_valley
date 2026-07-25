'use client';

import React, { useState } from 'react';
import PremiumFooter from '@/components/PremiumFooter';
import { getBackendUrl } from '@/utils/api';
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
      // Submit Inquiry to MongoDB Database via public inquiries API route
      const res = await fetch(getBackendUrl('http://127.0.0.1:5000/api/public/inquiries'), {
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

        // Reload page after a delay so they see the success message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
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
        <div className={styles.container}>
          <div className={styles.grid}>
            
            {/* Left Column: Get In Touch + Watermark */}
            <div className={styles.leftContent}>
              <div className={styles.watermark}>Contact Us</div>
              <h1 className={styles.connectTitle}>Get In Touch</h1>
              <div className={styles.underline} />
              <p className={styles.leftText1}>We would love to hear from you !</p>
              <p className={styles.leftText2}>Feel free to drop a line about queries or requests.</p>
            </div>

            {/* Right Column: Form Card */}
            <div className={styles.formCard}>
              {submitStatus && (
                <div className={submitStatus.type === 'success' ? styles.alertSuccess : styles.alertError}>
                  {submitStatus.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className={styles.inputField}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSubmitting}
                  />

                  <input
                    type="text"
                    required
                    placeholder="Institution / Company"
                    className={styles.inputField}
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    disabled={isSubmitting}
                  />

                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    className={styles.inputField}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />

                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    className={styles.inputField}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                  />

                  <input
                    type="text"
                    required
                    placeholder="City / State"
                    className={styles.inputField}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isSubmitting}
                  />

                  <input
                    type="text"
                    required
                    placeholder="Subject"
                    className={styles.inputField}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <textarea
                  required
                  rows={4}
                  placeholder="Message Details"
                  className={styles.textareaField}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                />

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className={styles.spinner}></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Submit</span>
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
