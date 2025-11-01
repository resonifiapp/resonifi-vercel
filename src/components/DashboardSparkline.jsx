import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardSparkline({ data, width = 200, height = 40 }) {
  if (data.length < 2) return <div className={`w-[${width}px] h-[${height}px]`} />;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y, value };
  });

  const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  
  // Today is the last point
  const todayPoint = points[points.length - 1];
  
  // Calculate average
  const average = data.reduce((sum, val) => sum + val, 0) / data.length;
  const todayBeatsAverage = data[data.length - 1] > average;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={width} height={height} className="inline-block">
        {/* Sparkline */}
        <polyline
          fill="none"
          stroke="#2DD4BF"
          strokeWidth="2"
          points={pathPoints}
        />
        
        {/* Today's dot */}
        <motion.circle
          cx={todayPoint.x}
          cy={todayPoint.y}
          r="4"
          fill="#2DD4BF"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        />
        
        {/* Celebratory pulse ring if today beats average */}
        {todayBeatsAverage && (
          <motion.circle
            cx={todayPoint.x}
            cy={todayPoint.y}
            r="4"
            fill="none"
            stroke="#2DD4BF"
            strokeWidth="2"
            initial={{ r: 4, opacity: 0.7 }}
            animate={{ r: 12, opacity: 0 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </svg>
      
      <div className="text-center">
        <p className="text-xs text-gray-400">Last 7 days</p>
        {todayBeatsAverage && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-[#2DD4BF] font-medium"
          >
            ✨ Above average!
          </motion.p>
        )}
      </div>
    </div>
  );
}