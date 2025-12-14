"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

export interface ContentCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  href?: string;
  badge?: string;
  metadata?: { label: string; value: string }[];
  action?: { label: string; onClick: () => void };
  className?: string;
}

export default function ContentCard({
  title,
  description,
  icon: Icon,
  href,
  badge,
  metadata,
  action,
  className = "",
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

  const CardContent = (
    <div
      className={`relative p-6 rounded-2xl border backdrop-blur-2xl hover:scale-[1.02] transition-all duration-300 h-full ${
        darkMode
          ? "bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-2xl hover:shadow-[#2596be]/20"
          : "bg-white/80 border-gray-200 hover:bg-white hover:shadow-2xl hover:shadow-[#2596be]/10"
      } ${className}`}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              darkMode
                ? "bg-[#2596be]/20 text-[#60DFFF]"
                : "bg-[#2596be]/10 text-[#2596be]"
            }`}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Icon */}
      {Icon && (
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            darkMode ? "bg-[#2596be]/20" : "bg-[#2596be]/10"
          }`}
        >
          <Icon
            className={darkMode ? "text-[#60DFFF]" : "text-[#2596be]"}
            size={24}
          />
        </div>
      )}

      {/* Title */}
      <h3
        className={`text-xl font-bold mb-2 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={`text-sm mb-4 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {description}
        </p>
      )}

      {/* Metadata */}
      {metadata && metadata.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-4">
          {metadata.map((item, idx) => (
            <div key={idx}>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {item.label}
              </p>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            darkMode
              ? "bg-[#2596be]/20 text-[#60DFFF] hover:bg-[#2596be]/30"
              : "bg-[#2596be]/10 text-[#2596be] hover:bg-[#2596be]/20"
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
