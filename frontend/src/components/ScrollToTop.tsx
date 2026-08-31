'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Industry-Standard Navigation Scroll Manager
 * Ensures that whenever a user navigates to a new page or category,
 * the viewport instantly resets to the very top (0, 0) instead of
 * retaining the previous page's scroll position.
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Disable browser's native automatic scroll restoration which causes jumpiness
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Instantly reset scroll to the top of the new page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname, searchParams]);

  return null;
}
