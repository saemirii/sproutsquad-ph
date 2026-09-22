import React, { useState } from 'react';
import { ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';

interface SortInteractionProps {
  items: string[];
  /** Indices into `items`, in correct order. */
  correctOrder: number[];
  /** True once this question has been answered — locks reordering and hides the check button. */
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

/** Tap-to-reorder rather than drag-and-drop, for reliable mobile + a11y. */
export const SortInteraction: React.FC<SortInteractionProps> = ({ items, correctOrder, disabled, onSubmit }) => {
  const [arrangement, setArrangement] = useState<number[]>(() => shuffledIndices(items.length));

  const move = (pos: number, dir: -1 | 1) => {
    const target = pos + dir;
    if (target < 0 || target >= arrangement.length) return;
    setArrangement((prev) => {
      const next = [...prev];
      [next[pos], next[target]] = [next[target], next[pos]];
      return next;
    });
  };

  const handleCheck = () => {
    const isCorrect = arrangement.length === correctOrder.length && arrangement.every((v, i) => v === correctOrder[i]);
    onSubmit(isCorrect);
  };

  return (
    <div className="space-y-2">
      {arrangement.map((itemIdx, pos) => (
        <div key={itemIdx} className="flex items-center gap-2 p-3 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl">
          <span className="w-5 h-5 rounded-full bg-[#207559] text-white text-[10px] font-black flex items-center justify-center shrink-0">{pos + 1}</span>
          <span className="flex-1 text-xs font-semibold text-[#3B2F27]">{items[itemIdx]}</span>
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              type="button"
              disabled={disabled || pos === 0}
              onClick={() => move(pos, -1)}
              className="p-1 rounded-md text-[#8C7A6D] hover:bg-[#F2EAE0] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled || pos === arrangement.length - 1}
              onClick={() => move(pos, 1)}
              className="p-1 rounded-md text-[#8C7A6D] hover:bg-[#F2EAE0] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
      {!disabled && (
        <button
          type="button"
          onClick={handleCheck}
          className="w-full mt-1 px-5 py-2.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-extrabold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer btn-bouncy flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Check Order
        </button>
      )}
    </div>
  );
};
