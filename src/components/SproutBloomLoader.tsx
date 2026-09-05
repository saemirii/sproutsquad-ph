import React from 'react';

// A seamless-loop animation of a sprout growing into a bloomed flower.
// Every element's timing is keyed against the same 6s clock (no animation-delay
// tricks) so the loop point never visibly jumps: everything fades out by 96%
// and the reset to 0% (also faded out) is invisible.
export const SproutBloomLoader: React.FC = () => (
  <div className="sprout-bloom-sway">
    <svg viewBox="0 0 200 200" className="w-32 h-32 sprout-bloom-fade" aria-hidden="true">
      <ellipse cx="100" cy="176" rx="26" ry="6" fill="#0E2B25" opacity="0.4" />

      <path
        className="sprout-stem"
        d="M100,172 C96,140 104,110 100,60"
        fill="none"
        stroke="#8FE3B0"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength={1}
      />

      <g className="sprout-leaf-left" style={{ transformOrigin: '92px 128px' }}>
        <path d="M92,128 C68,124 58,104 66,86 C88,90 98,110 92,128 Z" fill="#7CC79A" />
      </g>

      <g className="sprout-leaf-right" style={{ transformOrigin: '104px 96px' }}>
        <path d="M104,96 C128,90 140,70 134,52 C110,58 98,78 104,96 Z" fill="#8FE3B0" />
      </g>

      <g className="sprout-bud" style={{ transformOrigin: '100px 58px' }}>
        <circle cx="100" cy="58" r="9" fill="#FFD166" />
      </g>

      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <g key={deg} transform={`rotate(${deg} 100 58)`}>
          <ellipse
            className={`sprout-petal sprout-petal-${i % 3}`}
            cx="100"
            cy="40"
            rx="9"
            ry="15"
            fill="#FFC2D1"
            style={{ transformOrigin: '100px 58px' }}
          />
        </g>
      ))}
    </svg>
  </div>
);
