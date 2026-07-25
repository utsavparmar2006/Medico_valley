'use client';

import React, { useState } from 'react';

interface Props {
  description: string;
  productName: string;
  categoryName?: string;
  keyFeatures?: string[];
}

export default function ProductDetailsTabs({ description, productName, categoryName, keyFeatures }: Props) {
  const [activeTab, setActiveTab] = useState<'features' | 'details'>('details');

  // Generate high-quality key features list dynamically based on product context or saved data
  const getFeaturesList = () => {
    // If manual key features exist, use them
    if (keyFeatures && keyFeatures.length > 0) {
      return keyFeatures;
    }

    const list: string[] = [];
    
    // Parse sentences from description
    const sentences = description
      .split(/(?<=[.?!])\s+/)
      .filter((s) => s.trim().length > 10 && !s.toLowerCase().includes('for over a decade'));

    // Map sentences to bullets
    sentences.forEach((s) => {
      list.push(s.trim());
    });

    // Add generic professional backup bullets based on category
    if (list.length < 3) {
      list.push('Developed by globally renowned healthcare technology manufacturers.');
      if (categoryName?.toLowerCase().includes('anatomy')) {
        list.push('High-grade medical replica ideal for classroom demonstration.');
        list.push('Accurately colored anatomical divisions for easy identification of structures.');
      } else if (categoryName?.toLowerCase().includes('simulator')) {
        list.push('High-fidelity patient response indicators for hands-on clinical settings.');
        list.push('Promotes quantifiable training standards and procedures.');
      } else {
        list.push('Modular, repeat-mode practice trainer for building muscle memory.');
        list.push('Replicates life-like tactile skin resistance and tissue layers.');
      }
    }

    return list.slice(0, 6); // limit to 6 key bullets for clean UI
  };

  const features = getFeaturesList();

  return (
    <div style={{
      marginTop: '56px',
      borderTop: '1px solid #e2e8f0',
      paddingTop: '32px',
      width: '100%',
    }}>
      {/* ── Tabs Navigation ── */}
      <div style={{
        display: 'flex',
        gap: '40px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '28px',
        paddingBottom: '0.1px',
      }}>
        <button
          onClick={() => setActiveTab('features')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 4px',
            fontSize: '0.88rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: activeTab === 'features' ? '#0f172a' : '#94a3b8',
            cursor: 'pointer',
            borderBottom: activeTab === 'features' ? '2.5px solid #0f172a' : '2.5px solid transparent',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            fontFamily: 'inherit',
          }}
        >
          Key Features
        </button>
        <button
          onClick={() => setActiveTab('details')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 4px',
            fontSize: '0.88rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: activeTab === 'details' ? '#0f172a' : '#94a3b8',
            cursor: 'pointer',
            borderBottom: activeTab === 'details' ? '2.5px solid #0f172a' : '2.5px solid transparent',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            fontFamily: 'inherit',
          }}
        >
          Product Details
        </button>
      </div>

      {/* ── Tabs Content Panel ── */}
      <div style={{ minHeight: '160px' }}>
        {activeTab === 'features' ? (
          <div style={{ animation: 'fadeInTab 0.3s ease both' }}>
            <ul style={{
              listStyleType: 'disc',
              paddingLeft: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              color: '#334155',
              fontSize: '0.94rem',
              lineHeight: '1.6',
            }}>
              {features.map((feat, idx) => (
                <li key={idx} style={{ paddingLeft: '4px' }}>
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div style={{
            color: '#334155',
            fontSize: '0.94rem',
            lineHeight: '1.7',
            animation: 'fadeInTab 0.3s ease both',
          }}>
            <p style={{ marginBottom: '16px' }}>{description}</p>
            <p style={{ fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic', marginTop: '16px' }}>
              This professional {productName.toLowerCase()} is a great addition to any medical laboratory or classroom study of healthcare disciplines.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInTab {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
