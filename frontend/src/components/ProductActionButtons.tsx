'use client';

import React, { useState } from 'react';
import RequestQuoteModal from './RequestQuoteModal';
import ShareProductButton from './ShareProductButton';

import styles from './ProductActionButtons.module.css';

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
    <>
      <div className={styles.actionButtonsContainer}>
        {/* Row 1: Primary CTA (Request Quote & Pricing) + Share Button side-by-side */}
        <div className={styles.primaryRow}>
          <button
            type="button"
            onClick={() => setIsQuoteOpen(true)}
            className={styles.quoteBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="9" y1="16" x2="15" y2="16" />
              <line x1="9" y1="8" x2="13" y2="8" />
            </svg>
            <span className={styles.quoteBtnText}>Request Quote &amp; Pricing</span>
            <span className={styles.quoteArrow}>&rarr;</span>
          </button>

          <div className={styles.shareBtnWrap}>
            <ShareProductButton productName={productName} />
          </div>
        </div>

        {/* Row 2 (Optional): Download Catalog PDF button if catalogUrl exists */}
        {catalogUrl && (
          <a
            href={catalogUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className={styles.catalogBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 3v12" />
            </svg>
            <span>Download Catalog PDF</span>
          </a>
        )}
      </div>

      {/* Quotation Modal Popup */}
      <RequestQuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        productId={productId}
        productName={productName}
        productSlug={productSlug}
        categoryName={categoryName}
      />
    </>
  );
}
