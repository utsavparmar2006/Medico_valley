'use client';

import React, { useState } from 'react';
import GlobalNavbar from '@/components/GlobalNavbar';
import PremiumFooter from '@/components/PremiumFooter';
import RequestQuoteModal from '@/components/RequestQuoteModal';
import styles from './SimulationCentre.module.css';

export default function SimulationCentrePage() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'skills' | 'icu' | 'debrief' | 'seminar'>('skills');

  const labZones = {
    skills: {
      title: 'Skills Lab & Task Trainer Zone',
      tagline: 'Foundational clinical procedure training for medical & nursing students.',
      features: [
        'Multi-station procedure tables for IV, CPR, and catheterization trainers',
        'Ergonomic storage carts for seamless consumable replenishment',
        'High-durability easy-clean flooring and task lighting',
      ],
      icon: '💉',
      accentColor: '#0a8d93',
      lightBg: '#e6f7f4',
      stats: [
        { label: 'Training Stations', value: '12+' },
        { label: 'Skill Modules', value: '30+' },
        { label: 'Setup Days', value: '3–5' },
      ],
    },
    icu: {
      title: 'High-Fidelity ICU & Operating Theater',
      tagline: 'Realistic critical care environment for team-based emergency simulations.',
      features: [
        'Pendant-mounted medical gas lines and surgical booms',
        'Full-body wireless patient simulators with realistic vitals streaming',
        'Ceiling-mounted multi-angle HD cameras with motorized zoom',
      ],
      icon: '🏥',
      accentColor: '#0B6FAD',
      lightBg: '#e0f2fe',
      stats: [
        { label: 'HD Cameras', value: '6–8' },
        { label: 'Simulator Beds', value: '2–4' },
        { label: 'Fidelity Level', value: 'High' },
      ],
    },
    debrief: {
      title: 'Control Room & Video Debriefing Studio',
      tagline: 'Centralized command center for real-time scenario control & video analysis.',
      features: [
        'One-way acoustic glass window overlooking simulation suites',
        'Multi-channel video recorder with synchronized patient vitals overlay',
        'Comfortable debriefing lounge for reflective team discussions',
      ],
      icon: '🎥',
      accentColor: '#6d28d9',
      lightBg: '#ede9fe',
      stats: [
        { label: 'Video Channels', value: '4–8' },
        { label: 'Viewing Seats', value: '10–20' },
        { label: 'Sync Latency', value: '<200ms' },
      ],
    },
    seminar: {
      title: 'Multidisciplinary Seminar Suite',
      tagline: 'Flexible didactic classroom space integrated with live lab streaming.',
      features: [
        'Interactive smart displays for live case study reviews',
        'Modular reconfigurable seating for small-group discussions',
        'Direct low-latency audio link to simulation control consoles',
      ],
      icon: '🏫',
      accentColor: '#b45309',
      lightBg: '#fef3c7',
      stats: [
        { label: 'Seating Capacity', value: '30–60' },
        { label: 'Display Screens', value: '2–4' },
        { label: 'Live Streams', value: 'Real-time' },
      ],
    },
  };

  const expertiseItems = [
    {
      num: '01',
      title: 'Space Planning & Layout Design',
      desc: 'Zonal partitioning and architectural spatial flow optimization engineered specifically for healthcare education.',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Skills Lab & Simulation Planning',
      desc: 'Turnkey layouts for task training, nursing skill suites, and advanced clinical simulation environments.',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Equipment Selection & Procurement',
      desc: 'Unbiased guidance in selecting international-standard mannequins, simulators, and task trainers.',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      num: '04',
      title: 'AV & Networking Infrastructure',
      desc: 'High-definition camera positioning, synchronized audio-video recording, and server architecture.',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      ),
    },
    {
      num: '05',
      title: 'Debriefing & Control Room Setup',
      desc: 'Observation windows, multi-screen control stations, and comfortable video debriefing studios.',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      num: '06',
      title: 'Furniture & Ergonomic Workflow',
      desc: 'Clinical medical grade furniture, mobile storage, and obstacle-free movement paths for trainees.',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 21a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2" />
          <path d="M4 11V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
        </svg>
      ),
    },
    {
      num: '07',
      title: 'Future Expansion Readiness',
      desc: 'Scalable modular designs ready for future technology upgrades and curriculum expansion.',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      ),
    },
    {
      num: '08',
      title: 'Faculty & Student-Centric Ergonomics',
      desc: 'Intuitive operational controls for instructors and stress-free learning environments for trainees.',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
      ),
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'Need Assessment', desc: 'Analyzing curriculum goals, space dimensions, and target student capacity.' },
    { step: '02', title: '3D Blueprinting', desc: 'Designing 3D floor plans, electrical networks, and AV camera line-of-sights.' },
    { step: '03', title: 'Equipment Curation', desc: 'Selecting high-fidelity simulators, task trainers, and medical furniture.' },
    { step: '04', title: 'Execution & Handover', desc: 'Turnkey installation, AV calibration, and faculty operational training.' },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Global Navigation Bar */}
      <GlobalNavbar />

      <main className={styles.mainContainer}>
        {/* ==================================================================
            HERO SECTION: DARK CYAN ARCHITECTURAL STUDIO
           ================================================================== */}
        <section className={styles.heroBanner}>
          <div className={styles.heroContainer}>
            <div className={styles.heroTextCol}>
              <div className={styles.heroKicker}>
                <span className={styles.sparkle}>✦</span> Architectural &amp; Simulation Excellence
              </div>
              <h1 className={styles.heroHeadline}>
                Design A <span className={styles.highlightText}>Simulation Centre</span> That Inspires Better Learning
              </h1>
              <p className={styles.heroSubline}>
                A well-designed simulation center is more than a space — it’s a high-impact learning environment that elevates clinical skills, faculty engagement, and student outcomes.
              </p>

              <div className={styles.heroStatsRow}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>100+</div>
                  <div className={styles.statLabel}>Labs Planned</div>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>Global</div>
                  <div className={styles.statLabel}>Brand Solutions</div>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>100%</div>
                  <div className={styles.statLabel}>Customized Design</div>
                </div>
              </div>

              <div className={styles.heroCtaGroup}>
                <button
                  type="button"
                  className={styles.heroBtnPrimary}
                  onClick={() => setIsQuoteModalOpen(true)}
                >
                  <span>Book Free Consultation</span>
                  <span className={styles.arrowIcon}>→</span>
                </button>
              </div>
            </div>

            {/* Right Simulation Training Visual */}
            <div className={styles.heroGraphicBox}>
              <div className={styles.heroImageWrapper}>
                <img
                  src="/uploads/1783083309596-994279147.png"
                  alt="Clinical Simulation Training Centre"
                  className={styles.heroImage}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            INTERACTIVE LAB ZONE EXPLORER
           ================================================================== */}
        <section className={styles.labExplorerSection}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.badgeTeal}>LAB ZONE BLUEPRINTS</span>
            <h2 className={styles.sectionTitle}>Explore Customized Simulation Zones</h2>
            <p className={styles.sectionSub}>Select a zone to preview spatial architecture and equipment requirements.</p>
          </div>

          <div className={styles.zoneExplorerLayout}>
            {/* Vertical Tab Sidebar */}
            <div className={styles.zoneSidebar}>
              {(['skills', 'icu', 'debrief', 'seminar'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.zoneTabBtn} ${activeTab === key ? styles.zoneTabBtnActive : ''}`}
                  onClick={() => setActiveTab(key)}
                  style={activeTab === key ? { borderLeftColor: labZones[key].accentColor, color: labZones[key].accentColor } : {}}
                >
                  <span
                    className={styles.zoneTabIcon}
                    style={activeTab === key ? { background: labZones[key].lightBg } : {}}
                  >
                    {labZones[key].icon}
                  </span>
                  <span className={styles.zoneTabLabel}>{labZones[key].title}</span>
                  {activeTab === key && <span className={styles.zoneTabArrow}>›</span>}
                </button>
              ))}
            </div>

            {/* Zone Detail Card */}
            <div className={styles.zoneDetailCard}>
              {/* Top accent bar */}
              <div className={styles.zoneAccentBar} style={{ background: labZones[activeTab].accentColor }} />

              <div className={styles.zoneDetailInner}>
                {/* Header row */}
                <div className={styles.zoneDetailHeader}>
                  <span
                    className={styles.zoneIconLarge}
                    style={{ background: labZones[activeTab].lightBg }}
                  >
                    {labZones[activeTab].icon}
                  </span>
                  <div>
                    <h3 className={styles.zoneTitle}>{labZones[activeTab].title}</h3>
                    <p className={styles.zoneTagline} style={{ color: labZones[activeTab].accentColor }}>
                      {labZones[activeTab].tagline}
                    </p>
                  </div>
                </div>

                {/* Features + Stats two-column */}
                <div className={styles.zoneDetailBody}>
                  <div className={styles.featureList}>
                    {labZones[activeTab].features.map((feat, idx) => (
                      <div key={idx} className={styles.featureRow}>
                        <span className={styles.featureCheck} style={{ color: labZones[activeTab].accentColor }}>✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats strip */}
                  <div className={styles.zoneStatsStrip}>
                    {labZones[activeTab].stats.map((stat, i) => (
                      <div key={i} className={styles.zoneStat}>
                        <span className={styles.zoneStatValue} style={{ color: labZones[activeTab].accentColor }}>
                          {stat.value}
                        </span>
                        <span className={styles.zoneStatLabel}>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            8 CORE EXPERTISE PILLARS (REFINED GLASS GRID)
           ================================================================== */}
        <section className={styles.expertiseSection}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.badgeTeal}>END-TO-END CAPABILITIES</span>
            <h2 className={styles.sectionTitle}>OUR PLANNING &amp; DESIGN EXPERTISE</h2>
            <div className={styles.titleLine}></div>
          </div>

          <div className={styles.expertiseGrid}>
            {expertiseItems.map((item) => (
              <div key={item.num} className={styles.expertiseGlassCard}>
                <div className={styles.cardTopRow}>
                  <div className={styles.iconCircle}>{item.icon}</div>
                  <span className={styles.numBadge}>{item.num}</span>
                </div>
                <h3 className={styles.cardHeading}>{item.title}</h3>
                <p className={styles.cardBody}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================================
            WORKFLOW PROCESS TIMELINE
           ================================================================== */}
        <section className={styles.workflowSection}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.badgeTeal}>HOW WE WORK</span>
            <h2 className={styles.sectionTitle}>Our 4-Step Design &amp; Execution Process</h2>
          </div>

          <div className={styles.workflowGrid}>
            {workflowSteps.map((w, index) => (
              <div key={w.step} className={styles.workflowCard}>
                <div className={styles.workflowStepNum}>{w.step}</div>
                <h4 className={styles.workflowTitle}>{w.title}</h4>
                <p className={styles.workflowDesc}>{w.desc}</p>
                {index < workflowSteps.length - 1 && <div className={styles.connectorArrow}>→</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================================
            VALUE GUARANTEE & SINGLE HIGH-IMPACT DIRECT CTA
           ================================================================== */}
        <section className={styles.finalCtaSection}>
          <div className={styles.finalCtaBox}>
            <div className={styles.finalCtaLeft}>
              <div className={styles.targetBadge}>
                🎯 Avoid Costly Redesigns &amp; Maximize Space
              </div>
              <h2 className={styles.finalCtaTitle}>
                Ready To Build Your World-Class Simulation Center?
              </h2>
              <p className={styles.finalCtaDesc}>
                Schedule a free consultation with our planning experts today. Receive customized spatial recommendations, equipment curation, and practical design insights with zero obligation.
              </p>
              <div className={styles.contactChips}>
                <span>🌐 medicovalley.in</span>
                <span>✉️ info@medicovalley.in</span>
                <span>📞 +91 98209 39391</span>
              </div>
            </div>

            <div className={styles.finalCtaRight}>
              <button
                type="button"
                className={styles.finalActionBtn}
                onClick={() => setIsQuoteModalOpen(true)}
              >
                <span>Request Consultation &amp; Quote</span>
                <span className={styles.btnArrow}>→</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <PremiumFooter />

      {/* Request Quotation Modal Trigger */}
      <RequestQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        productId="60d21b4667d0d8992e610c89"
        productName="Simulation Centre Planning & Design Consultation"
        productSlug="simulation-centre-planning"
        categoryName="Simulation Centre Design"
      />
    </div>
  );
}
