'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook to handle 2-step tap interactions on touch devices:
 * 1st tap -> Activates hover state (e.g. shows buttons/overlay)
 * 2nd tap -> Executes action/navigation
 * Tapping outside resets hover state.
 */
export function useTouchHover<T extends HTMLElement = HTMLDivElement>() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<T | null>(null);

  const handleTouch = useCallback(
    (e: React.TouchEvent | React.MouseEvent, actionCallback?: () => void) => {
      // If it's a touch event or touch device interaction
      const isTouchDevice =
        typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0);

      if (!isTouchDevice) {
        // Normal desktop click behavior
        actionCallback?.();
        return;
      }

      if (!isHovered) {
        // First tap: prevent default navigation & activate hover state
        e.preventDefault();
        e.stopPropagation();
        setIsHovered(true);
      } else {
        // Second tap: trigger action
        actionCallback?.();
      }
    },
    [isHovered]
  );

  // Reset hover state when clicking outside
  useEffect(() => {
    if (!isHovered) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsHovered(false);
      }
    };

    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHovered]);

  return {
    isHovered,
    setIsHovered,
    containerRef,
    handleTouch,
  };
}
