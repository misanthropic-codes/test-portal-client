'use client';

import katex from 'katex';
import { useEffect, useRef } from 'react';

// Add KaTeX CSS to head
if (typeof window !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
  link.integrity = 'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV';
  link.crossOrigin = 'anonymous';
  if (!document.querySelector('link[href*="katex"]')) {
    document.head.appendChild(link);
  }
}

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders question content that may contain:
 * - HTML from TipTap editor (<p>, <strong>, <em>, <ul>, etc.)
 * - LaTeX math delimiters ($...$ for inline, $$...$$ for display)
 * - TipTap math-block divs with data-latex attributes
 */
export function MathRenderer({ content, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    // Check if the content contains HTML tags
    const hasHtml = /<[a-z][\s\S]*>/i.test(content);
    // Check if the content contains LaTeX delimiters
    const hasLatex = /\$[\s\S]+?\$/.test(content);

    if (hasHtml && !hasLatex) {
      // Pure HTML content from TipTap — render directly
      containerRef.current.innerHTML = content;
    } else if (hasLatex) {
      // Content has LaTeX — parse and render math + HTML segments
      containerRef.current.innerHTML = '';
      const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/);

      parts.forEach((part) => {
        if (!part) return;

        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Display math (block)
          const span = document.createElement('span');
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
          containerRef.current?.appendChild(span);
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Inline math
          const span = document.createElement('span');
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
          containerRef.current?.appendChild(span);
        } else {
          // Non-math segment — may contain HTML, render it
          const span = document.createElement('span');
          span.innerHTML = part;
          containerRef.current?.appendChild(span);
        }
      });
    } else {
      // Plain text — render as HTML in case it has simple formatting
      containerRef.current.innerHTML = content;
    }

    // Process TipTap math-block divs (data-type="math-block" with data-latex)
    const mathBlocks = containerRef.current.querySelectorAll(
      'div[data-type="math-block"]'
    );
    mathBlocks.forEach((block) => {
      const latex = block.getAttribute('data-latex');
      if (latex) {
        try {
          const rendered = katex.renderToString(latex, {
            throwOnError: false,
            displayMode: true,
          });
          block.innerHTML = rendered;
        } catch (error) {
          block.innerHTML = `<span class="text-red-500 text-sm">Invalid LaTeX: ${latex}</span>`;
        }
      }
    });
  }, [content]);

  if (!content) {
    return <div className="text-gray-400 text-sm">No content</div>;
  }

  return <div ref={containerRef} className={`question-content ${className}`} />;
}
