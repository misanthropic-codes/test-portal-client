'use client';

import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Split content by LaTeX delimiters
    const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/);

    parts.forEach((part) => {
      if (!part) return;

      const span = document.createElement('span');

      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Display math (block)
        const math = part.slice(2, -2);
        try {
          katex.render(math, span, {
            displayMode: true,
            throwOnError: false,
            output: 'html',
          });
        } catch (e) {
          span.textContent = math;
          span.className = 'text-red-500';
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        const math = part.slice(1, -1);
        try {
          katex.render(math, span, {
            displayMode: false,
            throwOnError: false,
            output: 'html',
          });
        } catch (e) {
          span.textContent = math;
          span.className = 'text-red-500';
        }
      } else {
        // Regular text
        span.textContent = part;
      }

      containerRef.current?.appendChild(span);
    });
  }, [content]);

  return <div ref={containerRef} className={className} />;
}
