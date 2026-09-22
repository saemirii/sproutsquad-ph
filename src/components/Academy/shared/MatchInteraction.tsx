import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface MatchInteractionProps {
  pairs: { left: string; right: string }[];
  disabled: boolean;
  onSubmit: (isCorrect: boolean) => void;
}

function shuffledIndices(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Tap-left-then-tap-right pairing grid. `pairs[i]` is a correct pair by
 * construction, so a match is correct iff matches[leftIdx] === leftIdx. */
export const MatchInteraction: React.FC<MatchInteractionProps> = ({ pairs, disabled, onSubmit }) => {
  const [rightOrder] = useState<number[]>(() => shuffledIndices(pairs.length));
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);

  const matchedRightIndices = new Set(Object.values(matches));
  const allMatched = Object.keys(matches).length === pairs.length;

  const handleLeftClick = (leftIdx: number) => {
    if (disabled || matches[leftIdx] !== undefined) return;
    setSelectedLeft(leftIdx === selectedLeft ? null : leftIdx);
  };

  const handleRightClick = (rightIdx: number) => {
    if (disabled || selectedLeft === null || matchedRightIndices.has(rightIdx)) return;
    setMatches((prev) => ({ ...prev, [selectedLeft]: rightIdx }));
    setSelectedLeft(null);
  };

  const handleUnmatch = (leftIdx: number) => {
    if (disabled) return;
    setMatches((prev) => {
      const next = { ...prev };
      delete next[leftIdx];
      return next;
    });
  };

  const handleCheck = () => {
    const isCorrect = pairs.every((_, leftIdx) => matches[leftIdx] === leftIdx);
    onSubmit(isCorrect);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {pairs.map((p, leftIdx) => {
            const isMatched = matches[leftIdx] !== undefined;
            const isSelected = selectedLeft === leftIdx;
            return (
              <button
                key={leftIdx}
                type="button"
                onClick={() => (isMatched ? handleUnmatch(leftIdx) : handleLeftClick(leftIdx))}
                disabled={disabled}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
                  isMatched
                    ? 'bg-[#EBFBF0] border-[#10B981] text-[#065F46]'
                    : isSelected
                    ? 'bg-[#B8E6D5]/60 border-[#207559] text-[#194E3B]'
                    : 'bg-[#FAF7F2] border-[#E5DACD] text-[#3B2F27] hover:bg-[#F2EAE0]'
                }`}
              >
                {p.left}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {rightOrder.map((rightIdx) => {
            const p = pairs[rightIdx];
            const isMatched = matchedRightIndices.has(rightIdx);
            return (
              <button
                key={rightIdx}
                type="button"
                onClick={() => handleRightClick(rightIdx)}
                disabled={disabled || isMatched}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
                  isMatched ? 'bg-[#EBFBF0] border-[#10B981] text-[#065F46]' : 'bg-[#FAF7F2] border-[#E5DACD] text-[#3B2F27] hover:bg-[#F2EAE0]'
                }`}
              >
                {p.right}
              </button>
            );
          })}
        </div>
      </div>
      {!disabled && (
        <button
          type="button"
          disabled={!allMatched}
          onClick={handleCheck}
          className="w-full px-5 py-2.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] disabled:opacity-40 text-[#194E3B] font-extrabold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer btn-bouncy flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Check Matches
        </button>
      )}
    </div>
  );
};
