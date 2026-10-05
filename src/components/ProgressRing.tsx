import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 56,
  strokeWidth = 5,
  showText = true,
  textColor = 'text-white',
  className = '',
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, isNaN(progress) ? 0 : progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;
  const isComplete = normalizedProgress >= 100;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg] transform"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#27272a"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isComplete ? '#10b981' : '#34d399'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {showText && (
        <span
          className={`absolute text-xs font-semibold tabular-nums ${
            isComplete ? 'text-emerald-400' : textColor
          }`}
          style={{ fontSize: size <= 48 ? '10px' : '12px' }}
        >
          {Math.round(normalizedProgress)}%
        </span>
      )}
    </div>
  );
};
