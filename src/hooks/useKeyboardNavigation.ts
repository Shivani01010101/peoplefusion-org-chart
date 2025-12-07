"use client";

import { useEffect, useRef, useCallback } from "react";

interface KeyboardNavigationOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

/**
 * Hook for keyboard navigation in org chart
 * Supports arrow keys for hierarchical navigation
 */
export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
  const {
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't interfere with input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          onArrowUp?.();
          break;
        case "ArrowDown":
          e.preventDefault();
          onArrowDown?.();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onArrowLeft?.();
          break;
        case "ArrowRight":
          e.preventDefault();
          onArrowRight?.();
          break;
        case "Enter":
          e.preventDefault();
          onEnter?.();
          break;
        case "Escape":
          e.preventDefault();
          onEscape?.();
          break;
      }
    },
    [
      enabled,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onEnter,
      onEscape,
    ]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);
};
