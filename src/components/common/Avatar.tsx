"use client";

import React, { useState } from "react";

/**
 * Avatar component props
 */
interface AvatarProps {
  /** Profile picture URL (optional) */
  src?: string | null;
  /** Alt text for the image (used for fallback initials) */
  alt: string;
  /** Size variant of the avatar */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size classes mapping for avatar dimensions
 */

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-32 w-32",
};

/**
 * Avatar Component
 *
 * Displays a user's profile picture with fallback to initials.
 * Features:
 * - Image loading state
 * - Error handling with fallback to initials
 * - Color-coded background based on name
 * - Multiple size variants
 * - Accessible with proper ARIA attributes
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Extracts initials from a name
   * Takes first letter of first word and first letter of last word
   * @param name - Full name string
   * @returns Two-letter initials in uppercase
   */
  const getInitials = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  /**
   * Generates a consistent background color based on the name
   * Uses the first character's ASCII code to deterministically select a color
   * @param name - Name string to generate color from
   * @returns Tailwind CSS background color class
   */
  const getBackgroundColor = (name: string): string => {
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!src || imageError) {
    return (
      <div
        className={`${sizeClasses[size]} ${getBackgroundColor(
          alt
        )} flex items-center justify-center rounded-full text-white font-semibold ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="text-xs">{getInitials(alt)}</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {isLoading && (
        <div
          className={`${sizeClasses[size]} absolute animate-pulse rounded-full bg-gray-200`}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${
          sizeClasses[size]
        } rounded-full object-cover border-2 border-gray-100 ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity`}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};
