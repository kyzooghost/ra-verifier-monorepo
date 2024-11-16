'use client';

import { useState } from 'react';

interface TimeDisplayProps {
  isoString: string;
  className?: string;
}

export function TimeDisplay({ isoString, className = '' }: TimeDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Base formatting function that works on both server and client
  const formatDateTime = (isoString: string): {
    friendly: string;
    detailed: string;
  } => {
    try {
      const date = new Date(isoString);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      // Get current time and calculate time differences
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      // Generate user-friendly format
      let friendly: string;
      if (diffMinutes < 60) {
        friendly = diffMinutes <= 1 ? 'just now' : `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        friendly = `${diffHours}h ago`;
      } else if (diffDays < 7) {
        friendly = `${diffDays}d ago`;
      } else {
        friendly = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        });
      }

      // Generate detailed format
      const detailed = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'long'
      });

      return { friendly, detailed };
    } catch (error) {
      return {
        friendly: 'Invalid date',
        detailed: 'Invalid date'
      };
    }
  };

  const { friendly, detailed } = formatDateTime(isoString);

  return (
    <span
      className={`inline-block relative cursor-help ${className}`}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <time dateTime={isoString} suppressHydrationWarning>{friendly}</time>
      {showDetails && (
        <span className="absolute left-0 top-full mt-1 px-2 py-1 text-sm bg-gray-800 text-white rounded shadow-lg whitespace-nowrap z-10">
          {detailed}
        </span>
      )}
    </span>
  );
}
