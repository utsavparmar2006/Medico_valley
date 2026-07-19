'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getBackendUrl } from '@/utils/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productSlug: string;
  categoryName: string;
}

export default function RequestQuoteModal({
  isOpen,
  onClose,
  productId,
  productName,
  productSlug,
  categoryName,
}: Props) {
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName || !institution || !email || !city) {
      setErrorMsg('Please fill in all required fields (*)');
      return;
    }

    setIsSubmitting(true);

    try {
      const productUrl = window.location.href;

      // 1. Save Inquiry to MongoDB
      const res = await fetch(getBackendUrl('http://127.0.0.1:5000/api/public/inquiries'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productName,
          category: categoryName,
          customerName: fullName,
          institution,
          email,
          phone: phone || '',
          city,
          quantity,
          message,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Quotation submission failed.');
      }

      const inquiry = result.data;
      const inquiryId = inquiry.inquiryId;

      // If a phone number is provided, formulate WhatsApp redirect
      const hasPhone = phone && phone.trim();

      // Reset form input states immediately
      setFullName('');
      setInstitution('');
      setEmail('');
      setPhone('');
      setCity('');
      setQuantity(1);
      setMessage('');

      if (hasPhone) {
        // 2. Formulate WhatsApp Message Template
        const submissionDate = inquiry && inquiry.createdAt ? new Date(inquiry.createdAt) : new Date();
        const dateStr = submissionDate.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        const timeStr = submissionDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        const formattedPhone = phone.trim().startsWith('+')
          ? phone.trim()
          : (phone.trim().startsWith('91') && phone.trim().length > 10
            ? `+${phone.trim()}`
            : `+91 ${phone.trim()}`);

        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost'))
          ? process.env.NEXT_PUBLIC_SITE_URL
          : 'https://medicovalley.com';
        const absoluteProductUrl = `${siteUrl.replace(/\/$/, '')}${window.location.pathname}`;

        const emojiMail = '📩';
        const emojiHospital = '🏥';
        const emojiId = '🆔';
        const emojiCalendar = '📅';
        const emojiUser = '👤';
        const emojiBox = '📦';
        const emojiLink = '🔗';
        const emojiMemo = '📝';
        const separator = '----------------------------------------';
        const emDash = '-';

        const whatsappText = `${emojiMail} *NEW QUOTATION REQUEST*

${emojiHospital} *Medico Valley*

${separator}

${emojiId} *Inquiry ID*
${inquiryId}

${emojiCalendar} *Submitted*
${dateStr} - ${timeStr} IST

${separator}

${emojiUser} *Customer Details*

- Name: ${fullName}
- Institution: ${institution}
- City: ${city}
- Email: ${email}
- Phone: ${formattedPhone}

${separator}

${emojiBox} *Requested Product*

- Product:
${productName}

- Category:
${categoryName}

- Quantity:
${quantity} Unit(s)

${emojiLink} Product Page:
${absoluteProductUrl}

${separator}

${emojiMemo} *Customer Notes*

${message.trim() || 'No customer notes.'}

${separator}

Please review this quotation request and share pricing, availability, and delivery details with the customer at your earliest convenience.

Thank you.

${emDash} Medico Valley Website`;

        console.log('Generated WhatsApp message:\n', whatsappText);

        // 3. Trigger WhatsApp Redirect
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
        const encodedText = encodeURIComponent(whatsappText);
        const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${encodedText}`;

        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');
        onClose();
        window.location.reload();
      } else {
        // If email only, show inline success template
        setSubmittedInquiryId(inquiryId);
        setIsSubmitted(true);
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      {/* Modal Card with light theme premium glass design */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        style={{
          width: '100%',
          maxWidth: '580px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          color: '#1e293b',
          fontFamily: 'var(--font-sans), sans-serif',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 32px 18px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#0f172a', fontFamily: 'inherit' }}>Request Quotation</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0', fontFamily: 'inherit' }}>{productName}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        {isSubmitted ? (
          <div style={{
            padding: '40px 32px 48px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}>
            {/* Checked icon circle with bounce/pulse styling */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#e6f7f4',
              color: '#0a8d93',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              boxShadow: '0 10px 25px rgba(10, 141, 147, 0.15)',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}>
              ✓
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                Quotation Request Submitted!
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                Thank you! Your quotation request has been successfully registered. We have sent a confirmation email containing the product details to your inbox.
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '0.9rem',
              color: '#475569',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Inquiry ID:</span>
              <span style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '0.95rem' }}>{submittedInquiryId}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #0a8d93, #0b6f78)',
                border: 'none',
                color: '#ffffff',
                padding: '12px 32px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(10, 141, 147, 0.25)',
                transition: 'all 0.2s',
                marginTop: '12px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMsg && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 500,
                fontFamily: 'inherit',
              }}>
                {errorMsg}
              </div>
            )}

            {/* Inline CSS style for flat, borderless, underline inputs */}
            <style>{`
              .modal-label {
                font-size: 0.85rem !important;
                font-weight: 600 !important;
                color: var(--secondary-text) !important;
                font-family: var(--font-sans), sans-serif !important;
                margin-bottom: 2px !important;
              }
              .modal-input, .modal-textarea {
                background: transparent !important;
                border: none !important;
                border-bottom: 1.5px solid var(--secondary-text) !important;
                border-radius: 0 !important;
                padding: 10px 0 !important;
                color: var(--secondary-text) !important;
                font-size: 0.95rem !important;
                font-family: var(--font-sans), sans-serif !important;
                outline: none !important;
                transition: border-color 0.25s ease !important;
                width: 100% !important;
              }
              .modal-textarea {
                resize: vertical !important;
                height: 100px !important;
              }
              .modal-input::placeholder, .modal-textarea::placeholder {
                color: #b8c5d6 !important;
                opacity: 1 !important;
              }
              .modal-input:focus, .modal-textarea:focus {
                border-bottom-color: var(--primary) !important;
              }
            `}</style>

            {/* Grid fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="modal-label" htmlFor="quote-fullName">Full Name *</label>
                <input
                  id="quote-fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="modal-input"
                  placeholder="Rahul Patel"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="modal-label" htmlFor="quote-institution">Institution / Company *</label>
                <input
                  id="quote-institution"
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="modal-input"
                  placeholder="ABC Medical College"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="modal-label" htmlFor="quote-email">Email *</label>
                <input
                  id="quote-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="modal-input"
                  placeholder="rahul@gmail.com"
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: '1.2' }}>
                  For quotations and official communications.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="modal-label" htmlFor="quote-phone">Phone Number (Optional)</label>
                <input
                  id="quote-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="modal-input"
                  placeholder="9876543210"
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: '1.2' }}>
                  Enter number to get updates via WhatsApp.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="modal-label" htmlFor="quote-city">City *</label>
                <input
                  id="quote-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="modal-input"
                  placeholder="Ahmedabad"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="modal-label" htmlFor="quote-quantity">Quantity *</label>
                <input
                  id="quote-quantity"
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="modal-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="modal-label" htmlFor="quote-message">Message (Optional)</label>
              <textarea
                id="quote-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="modal-textarea"
                placeholder="Please send quotation, brochure and delivery timeline."
              />
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '12px',
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: phone.trim()
                    ? 'linear-gradient(135deg, #128c7e, #075e54)'
                    : 'linear-gradient(135deg, #0a8d93, #0b6f78)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: phone.trim()
                    ? '0 8px 20px rgba(18, 140, 126, 0.25)'
                    : '0 8px 20px rgba(10, 141, 147, 0.25)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = phone.trim()
                      ? '0 12px 24px rgba(18, 140, 126, 0.35)'
                      : '0 12px 24px rgba(10, 141, 147, 0.35)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = phone.trim()
                      ? '0 8px 20px rgba(18, 140, 126, 0.25)'
                      : '0 8px 20px rgba(10, 141, 147, 0.25)';
                  }
                }}
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : phone.trim() ? (
                  <>
                    <span style={{ fontSize: '1.1rem' }}>💬</span>
                    <span>Request via WhatsApp</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '1.1rem' }}>📩</span>
                    <span>Request via Email</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  color: '#0f172a',
  padding: '10px 14px',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const textareaStyle: React.CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  color: '#0f172a',
  padding: '10px 14px',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s',
  resize: 'vertical',
};
