'use client';

import React, { useState } from 'react';
import RequestQuoteModal from './RequestQuoteModal';
import ShareProductButton from './ShareProductButton';

interface Props {
  productId: string;
  productName: string;
  productSlug: string;
  categoryName: string;
  catalogUrl?: string;
}

export default function ProductActionButtons({
  productId,
  productName,
  productSlug,
  categoryName,
  catalogUrl,
}: Props) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '20px',
      width: '100%',
      alignItems: 'center',
    }}>
      {/* Request Quote Button — outlined, no filled background */}
      <button
        onClick={() => setIsQuoteOpen(true)}
        style={{
          background: 'transparent',
          border: '1.5px solid #0a8d93',
          color: '#0a8d93',
          padding: '12px 24px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(10, 141, 147, 0.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="15" y2="16" />
          <line x1="9" y1="8" x2="13" y2="8" />
        </svg>
        <span>Request Quote</span>
      </button>

      {/* Catalog Download Link */}
      {catalogUrl && (
        <a
          href={catalogUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'transparent',
            border: '1.5px solid #0a8d93',
            color: '#0a8d93',
            padding: '12px 16px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(10, 141, 147, 0.08)';
            e.currentTarget.style.borderColor = '#0a8d93';
            e.currentTarget.style.color = '#0b6f78';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#0a8d93';
            e.currentTarget.style.color = '#0a8d93';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 3v12" />
          </svg>
          <span>Download Catalog</span>
        </a>
      )}

      {/* Share Button — icon only, placed after Download Catalog */}
      <ShareProductButton productName={productName} />

      {/* Quotation Modal Popup */}
      <RequestQuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        productId={productId}
        productName={productName}
        productSlug={productSlug}
        categoryName={categoryName}
      />
    </div>
  );
}
