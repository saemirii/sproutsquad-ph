import React from 'react';
import { LessonIllustrationKey } from '../../../types';

/** Hand-built diagrams matching the app's own visual language — built after
 * sourcing real stock images/charts twice produced mismatches (wrong
 * language, unrelated data) that only turned up on close inspection. These
 * have no licensing risk and are drawn to say exactly what each exercise
 * needs, nothing more. */

const ProblemCustomerSolution: React.FC = () => (
  <svg viewBox="0 0 340 120" className="w-full h-auto" role="img" aria-label="Problem leads to Customer leads to Solution">
    {[
      { x: 8, label: 'Problem', fill: '#FDEEF3', stroke: '#F3B8CB', text: '#8C2F52' },
      { x: 125, label: 'Customer', fill: '#EAF3FB', stroke: '#A8D8EA', text: '#1B4E6B' },
      { x: 242, label: 'Solution', fill: '#F0FDF4', stroke: '#B8E6D5', text: '#194E3B' },
    ].map((box) => (
      <g key={box.label}>
        <rect x={box.x} y="30" width="90" height="60" rx="14" fill={box.fill} stroke={box.stroke} strokeWidth="2" />
        <text x={box.x + 45} y="65" textAnchor="middle" fontSize="13" fontWeight="800" fill={box.text}>{box.label}</text>
      </g>
    ))}
    {[108, 225].map((x) => (
      <path key={x} d={`M${x} 60 L${x + 16} 60`} stroke="#C4A876" strokeWidth="2.5" markerEnd="url(#arrow)" />
    ))}
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#C4A876" />
      </marker>
    </defs>
  </svg>
);

const StpFunnel: React.FC = () => {
  const rows = [
    { label: 'Segment the market', w: 300, fill: '#EAF3FB', stroke: '#A8D8EA', text: '#1B4E6B' },
    { label: 'Target one group', w: 210, fill: '#FFF3E8', stroke: '#F8BA9E', text: '#7A341A' },
    { label: 'Position your brand', w: 120, fill: '#F0FDF4', stroke: '#B8E6D5', text: '#194E3B' },
  ];
  return (
    <svg viewBox="0 0 320 150" className="w-full h-auto" role="img" aria-label="Segment, then target, then position — narrowing funnel">
      {rows.map((row, i) => (
        <g key={row.label} transform={`translate(${(320 - row.w) / 2}, ${i * 48 + 6})`}>
          <rect width={row.w} height="38" rx="10" fill={row.fill} stroke={row.stroke} strokeWidth="2" />
          <text x={row.w / 2} y="24" textAnchor="middle" fontSize="12" fontWeight="800" fill={row.text}>{row.label}</text>
        </g>
      ))}
    </svg>
  );
};

const ConversionFunnel: React.FC = () => {
  const stages = [
    { label: 'Views', value: 800, fill: '#EAF3FB', stroke: '#A8D8EA', text: '#1B4E6B' },
    { label: 'Clicks', value: 120, fill: '#F0FDF4', stroke: '#B8E6D5', text: '#194E3B' },
    { label: 'Messages', value: 30, fill: '#FFF3E8', stroke: '#F8BA9E', text: '#7A341A' },
    { label: 'Orders', value: 3, fill: '#FDEEF3', stroke: '#F3B8CB', text: '#8C2F52' },
  ];
  const maxW = 300;
  const minW = 70;
  const top = stages[0].value;
  return (
    <svg viewBox="0 0 320 220" className="w-full h-auto" role="img" aria-label="Funnel narrowing from Views to Clicks to Messages to Orders">
      {stages.map((stage, i) => {
        const ratio = stage.value / top;
        const w = Math.max(minW, maxW * ratio);
        return (
          <g key={stage.label} transform={`translate(${(320 - w) / 2}, ${i * 52 + 6})`}>
            <rect width={w} height="42" rx="10" fill={stage.fill} stroke={stage.stroke} strokeWidth="2" />
            <text x={w / 2} y="19" textAnchor="middle" fontSize="11" fontWeight="800" fill={stage.text}>{stage.label}</text>
            <text x={w / 2} y="34" textAnchor="middle" fontSize="10" fill={stage.text}>{stage.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

const BudgetAllocation: React.FC = () => {
  const slices = [
    { label: 'Ingredients', pct: 40, color: '#207559' },
    { label: 'Marketing', pct: 25, color: '#F7C948' },
    { label: 'Packaging', pct: 20, color: '#A8D8EA' },
    { label: 'Savings', pct: 15, color: '#F3B8CB' },
  ];
  const r = 45;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-24 h-24 shrink-0" role="img" aria-label="Example budget split across four categories">
        <g transform="rotate(-90 60 60)">
          {slices.map((slice) => {
            const len = (slice.pct / 100) * circumference;
            const el = (
              <circle
                key={slice.label}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke={slice.color}
                strokeWidth="20"
                strokeDasharray={`${len} ${circumference - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </g>
      </svg>
      <div className="space-y-1">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#54453C]">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
            {slice.label} — {slice.pct}%
          </div>
        ))}
      </div>
    </div>
  );
};

const ILLUSTRATIONS: Record<LessonIllustrationKey, React.FC> = {
  'problem-customer-solution': ProblemCustomerSolution,
  'stp-funnel': StpFunnel,
  'conversion-funnel': ConversionFunnel,
  'budget-allocation': BudgetAllocation,
};

const CAPTIONS: Record<LessonIllustrationKey, string> = {
  'problem-customer-solution': 'Example layout — draw your own three boxes with your own labels.',
  'stp-funnel': 'Each step narrows the one before it — segment, then target, then position.',
  'conversion-funnel': "PixelPop's real numbers from this exercise, drawn to scale.",
  'budget-allocation': 'An example split — your own numbers will look different.',
};

export const LessonIllustration: React.FC<{ name: LessonIllustrationKey }> = ({ name }) => {
  const Diagram = ILLUSTRATIONS[name];
  return (
    <figure className="pt-1">
      <div className="p-3 bg-white/60 rounded-xl border border-black/5">
        <Diagram />
      </div>
      <figcaption className="mt-1 text-[10px] text-[#A39284]">{CAPTIONS[name]}</figcaption>
    </figure>
  );
};
