'use client';

import Image from 'next/image';
import styles from '@/app/page.module.css';

export default function InstitutionTrustSection() {
  const images = [
    { src: "/anatommy%20model/skeleton_model.png", top: "8%", left: "48%", w: 180, h: 180, rotate: "-2deg" },
    { src: "/products/medical%20simulators/patient_simulator.png", top: "4%", left: "68%", w: 220, h: 220, rotate: "3deg" },
    { src: "/anatommy%20model/heart_model.png", top: "38%", left: "48%", w: 160, h: 160, rotate: "1deg" },
    { src: "/task%20trainer/airway_trainer.png", top: "34%", left: "68%", w: 200, h: 200, rotate: "-3deg" },
    { src: "/task%20trainer/suture_board.png", top: "68%", left: "48%", w: 170, h: 170, rotate: "2deg" },
    { src: "/products/medical%20simulators/pediatric_simulator.png", top: "68%", left: "66%", w: 200, h: 200, rotate: "-1deg" },
    { src: "/task%20trainer/iv_arm.png", top: "68%", left: "82%", w: 180, h: 180, rotate: "4deg" },
    { src: "/Human Anatomy Torso model.png", top: "6%", left: "86%", w: 160, h: 190, rotate: "-2deg" },
    { src: "/products/medical%20simulators/infant_simulator.png", top: "36%", left: "86%", w: 180, h: 180, rotate: "2deg" }
  ];

  return (
    <section className={styles.institutionTrustSection}>
      {/* Background collage of medical training images */}
      <div className={styles.trustBgCollage}>
        {images.map((img, i) => (
          <div
            key={i}
            className={styles.collageCard}
            style={{
              top: img.top,
              left: img.left,
              width: `${img.w}px`,
              height: `${img.h}px`,
              transform: `rotate(${img.rotate})`
            }}
          >
            <Image
              src={img.src}
              alt="Medico Valley Training"
              fill
              sizes="(max-width: 768px) 150px, 250px"
              className={styles.collageCardImg}
            />
          </div>
        ))}
      </div>

      <div className={styles.trustContainer}>
        {/* Left Glass Panel Card */}
        <div className={styles.trustGlassCard}>
          <h2 className={styles.trustTitle}>
            Medical Simulation Solutions Trusted by 1,500+ Institutions Worldwide
          </h2>
          <p className={styles.trustDesc}>
            For over a decade, Medico Valley's pioneering and acclaimed medical simulation and training solutions have empowered thousands of students, educators, and healthcare professionals across 1,500+ medical colleges and institutions in India. Through our high-fidelity anatomical models, pediatric manikins, clinical task trainers, and immersive simulation environments, Medico Valley facilitates clinical excellence and mastery in all stages of the healthcare learning journey.
          </p>
        </div>
      </div>
    </section>
  );
}
