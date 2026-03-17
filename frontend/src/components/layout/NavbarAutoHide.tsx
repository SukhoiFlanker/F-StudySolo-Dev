'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface NavbarAutoHideProps {
  children: React.ReactNode;
}

/**
 * NavbarAutoHide — Navbar floats ABOVE content as an overlay.
 * When hidden, content fills the full viewport.
 * When hovered, navbar slides down over the content.
 *
 * Uses pointerenter/pointerleave for reliable tracking (no stuck state).
 * Short 120ms retract delay for snappy feel.
 */
export default function NavbarAutoHide({ children }: NavbarAutoHideProps) {
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearHideTimer();
    setVisible(true);
  }, [clearHideTimer]);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, 120);
  }, [clearHideTimer]);

  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  return (
    <>
      {/* Hover trigger zone — invisible strip at the very top */}
      <div
        className="fixed left-0 right-0 top-0 z-[60] h-1.5"
        onPointerEnter={show}
        aria-hidden="true"
      />

      {/* Navbar container — fixed overlay */}
      <div
        className="fixed left-0 right-0 top-0 z-50 transition-transform duration-200 ease-out"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        }}
        onPointerEnter={show}
        onPointerLeave={scheduleHide}
      >
        {children}
      </div>
    </>
  );
}
