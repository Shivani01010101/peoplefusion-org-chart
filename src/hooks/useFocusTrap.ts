"use client";

import { useEffect, useRef, RefObject } from "react";

/**
 * Hook to trap focus within a container element
 * Implements WCAG 2.1 AA focus management for modals and sidebars
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Focus will be managed by the component that handles close
        const closeButton = container.querySelector<HTMLElement>(
          '[aria-label*="Close"], [aria-label*="close"]'
        );
        closeButton?.focus();
      }
    };

    // Focus first element when trap is activated
    firstElement?.focus();

    container.addEventListener("keydown", handleTabKey);
    container.addEventListener("keydown", handleEscape);

    return () => {
      container.removeEventListener("keydown", handleTabKey);
      container.removeEventListener("keydown", handleEscape);
    };
  }, [isActive]);

  return containerRef;
};
