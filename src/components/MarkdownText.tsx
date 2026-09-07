import React from 'react';

// Renders a small, safe subset of Markdown (bold, italic, inline code,
// bullet/numbered lists, paragraphs) as JSX — used for AI coach chat
// replies. A full markdown library is unnecessary for this handful of
// formatting needs, so this stays dependency-free.

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      parts.push(<strong key={`${keyPrefix}-b-${i}`}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      parts.push(<em key={`${keyPrefix}-i-${i}`}>{match[2]}</em>);
    } else if (match[3] !== undefined) {
      parts.push(
        <code key={`${keyPrefix}-c-${i}`} className="px-1 py-0.5 rounded bg-black/5 text-[0.92em] font-mono">
          {match[3]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
    i++;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
};

interface ListBuffer {
  ordered: boolean;
  items: string[];
}

export const MarkdownText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let listBuffer: ListBuffer | null = null;

  const flushList = (key: string) => {
    if (!listBuffer) return;
    const items = listBuffer.items;
    const ordered = listBuffer.ordered;
    blocks.push(
      ordered ? (
        <ol key={key} className="list-decimal pl-4 space-y-0.5">
          {items.map((item, idx) => <li key={idx}>{renderInline(item, `${key}-${idx}`)}</li>)}
        </ol>
      ) : (
        <ul key={key} className="list-disc pl-4 space-y-0.5">
          {items.map((item, idx) => <li key={idx}>{renderInline(item, `${key}-${idx}`)}</li>)}
        </ul>
      )
    );
    listBuffer = null;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    const bulletMatch = /^[-*]\s+(.*)/.exec(line);
    const numberedMatch = /^\d+\.\s+(.*)/.exec(line);
    const headingMatch = /^#{1,6}\s+(.*)/.exec(line);

    if (bulletMatch) {
      if (!listBuffer || listBuffer.ordered) { flushList(`list-${idx}`); listBuffer = { ordered: false, items: [] }; }
      listBuffer.items.push(bulletMatch[1]);
    } else if (numberedMatch) {
      if (!listBuffer || !listBuffer.ordered) { flushList(`list-${idx}`); listBuffer = { ordered: true, items: [] }; }
      listBuffer.items.push(numberedMatch[1]);
    } else {
      flushList(`para-${idx}`);
      if (headingMatch) {
        blocks.push(<p key={idx} className="font-bold">{renderInline(headingMatch[1], `h-${idx}`)}</p>);
      } else if (line.length > 0) {
        blocks.push(<p key={idx}>{renderInline(line, `p-${idx}`)}</p>);
      }
    }
  });
  flushList('list-end');

  return <div className={`space-y-1.5 ${className || ''}`}>{blocks}</div>;
};
