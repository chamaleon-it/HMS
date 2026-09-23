import React from "react";

interface BrandingFooterProps {
  services?: string[];
  advertisement?: string;
  className?: string;
}

export default function BrandingFooter({
  services = [],
  advertisement = "",
  className = "",
}: BrandingFooterProps) {
  if (services.length === 0 && !advertisement) return null;

  return (
    <div className={`select-none space-y-0.5 ${className}`}>
      {services.length > 0 && (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-black">
          Services: <span className="font-medium">{services.join(" · ")}</span>
        </p>
      )}
      {advertisement && (
        <p className="text-[10px] font-medium italic text-gray-600">
          {advertisement}
        </p>
      )}
    </div>
  );
}
