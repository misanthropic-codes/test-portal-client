'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ContentCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  metadata?: { label: string; value: string }[];
  href?: string;
  className?: string;
}

export default function ContentCard({
  icon: Icon,
  title,
  description,
  badge,
  metadata,
  href,
  className = '',
}: ContentCardProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    setDarkMode(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  const cardClasses = `
    group relative rounded-2xl border backdrop-blur-2xl shadow-lg
    transition-all duration-300 hover:scale-[1.02]
    ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'}
    ${className}
  `;

  const content = (
    <div className="p-4 sm:p-6">
      {/* Header with icon and badge */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {Icon && (
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-[#2596be]/20' : 'bg-[#2596be]/10'}`}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2596be]" />
            </div>
          )}
          {badge && (
            <span className={`
              px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
              ${darkMode ? 'bg-[#2596be]/20 text-[#60DFFF]' : 'bg-[#2596be]/10 text-[#2596be]'}
            `}>
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className={`
        text-base sm:text-lg font-bold mb-2
        line-clamp-2
        ${darkMode ? 'text-white' : 'text-gray-900'}
      `}>
        {title}
      </h3>

      {/* Description */}
      <p className={`
        text-sm mb-3 sm:mb-4
        line-clamp-2
        ${darkMode ? 'text-gray-400' : 'text-gray-600'}
      `}>
        {description}
      </p>

      {/* Metadata */}
      {metadata && metadata.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4 border-t" style={{
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}>
          {metadata.map((item, index) => (
            <div key={index} className="flex flex-col min-w-0">
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {item.label}
              </span>
              <span className={`
                text-sm font-semibold truncate
                ${darkMode ? 'text-white' : 'text-gray-900'}
              `}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}
