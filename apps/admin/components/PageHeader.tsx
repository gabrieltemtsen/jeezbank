import React from "react";

export default function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-4 mb-7 flex-wrap">
      <div>
        <h1 className="text-[28px] leading-none font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <div className="text-sm text-[var(--jmb-text-dim)] mt-2">{subtitle}</div>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </header>
  );
}
