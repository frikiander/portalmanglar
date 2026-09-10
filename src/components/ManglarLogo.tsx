import React from 'react';

interface ManglarEmblemProps {
  className?: string;
  withShadow?: boolean;
}

export const ManglarEmblem: React.FC<ManglarEmblemProps> = ({ 
  className = 'w-9 h-9',
  withShadow = true 
}) => {
  return (
    <svg 
      viewBox="0 0 200 170" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Emblema Colegio Integral El Manglar"
    >
      <defs>
        {withShadow && (
          <filter id="manglar-emblem-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.32" />
          </filter>
        )}
      </defs>

      {/* Institutional Green Square */}
      <rect
        x="48"
        y="16"
        width="100"
        height="100"
        fill="none"
        stroke="#5EA832"
        strokeWidth="13"
        strokeLinejoin="miter"
        rx="2"
      />

      {/* Institutional Yellow Circle */}
      <circle
        cx="74"
        cy="72"
        r="58"
        fill="none"
        stroke="#F8CB0A"
        strokeWidth="13"
      />

      {/* White Triangle with drop shadow */}
      <polygon
        points="148,10 86,132 196,132"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="11"
        strokeLinejoin="miter"
        filter={withShadow ? 'url(#manglar-emblem-shadow)' : undefined}
      />
    </svg>
  );
};

interface ManglarBrandProps {
  isCollapsed?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const ManglarBrand: React.FC<ManglarBrandProps> = ({
  isCollapsed = false,
  showSubtitle = true,
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-3 overflow-hidden ${className}`}>
      {/* Emblem container with clean white background and subtle institutional border */}
      <div className="w-10 h-10 rounded-xl bg-white p-1 border border-emerald-100/80 shadow-xs flex items-center justify-center shrink-0">
        <ManglarEmblem className="w-full h-full" />
      </div>

      {!isCollapsed && (
        <div className="min-w-0 transition-opacity duration-200">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-slate-900 tracking-tight text-base leading-none">
              Portal <span className="text-[#5EA832]">Manglar</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F8CB0A]/20 text-[#A67C00] border border-[#F8CB0A]/40">
              Oficial
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5 tracking-tight">
              Colegio Integral El Manglar
            </p>
          )}
        </div>
      )}
    </div>
  );
};
