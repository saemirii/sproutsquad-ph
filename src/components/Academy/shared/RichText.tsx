import React from 'react';

/** Parses inline **bold** markers into <strong> — the one bit of "markdown"
 * lesson content is allowed, so authors can highlight key terms without a
 * full markdown pipeline. Everything else renders as plain text. */
export const RichText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-extrabold text-[#3B2F27]">{part.slice(2, -2)}</strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};
