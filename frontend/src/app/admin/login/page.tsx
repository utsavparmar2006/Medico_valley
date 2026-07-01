'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getBackendUrl } from '@/utils/api';
import styles from './login.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(getBackendUrl('http://localhost:5000/api/admin/login'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          // Crucial: allow browser to receive and save the httpOnly refreshToken cookie!
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Store access token in localStorage for auth calls
          localStorage.setItem('adminAccessToken', data.accessToken);
          localStorage.setItem('adminUser', JSON.stringify(data.admin));
          
          // Redirect to dashboard
          router.push('/admin/dashboard');
        } else {
          setErrorMsg(data.message || 'Invalid email or password.');
        }
      } catch (err: any) {
        console.error('Login request error:', err);
        setErrorMsg('Could not connect to the authentication server.');
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* Background glow layers */}
      <div className={styles.glowCircle} style={{ top: '10%', left: '15%' }} />
      <div className={styles.glowCircle} style={{ bottom: '15%', right: '10%' }} />

      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            ⊕ <span className={styles.highlight}>Medico Valley Admin</span>
          </div>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Log in to manage categories and products.</p>
        </div>

        {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="admin@medicovalley.com"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <button type="submit" className={styles.button} disabled={isPending}>
            {isPending ? (
              <div className={styles.spinner}></div>
            ) : (
              <>
                <span>Secure Log In</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
