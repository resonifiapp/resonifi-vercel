import React from 'react';
import { motion } from 'framer-motion';

const ProgressRing = ({ value, size = 160, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(100, Math.max(0, value || 0));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center select-none" aria-label="Today's Wellness Index">
      <svg width={size} height={size} role="img">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-neutral-200 dark:text-neutral-800"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-indigo-500"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
      <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">Today's Wellness Index</div>
      <div className="text-3xl md:text-4xl font-semibold mt-1 text-white" aria-live="polite" aria-atomic="true">
        {Math.round(progress)}
        <span className="sr-only"> percent</span>
      </div>
    </div>
  );
};

export default ProgressRing;