import Link from "next/link";

export default function Pagination({
  basePath,
  page,
  pageSize,
  total,
  query,
}: {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  query?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(query || {}).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-5">
      <div className="text-xs text-[var(--jmb-text-mute)]">
        Page <span className="text-white font-semibold">{page}</span> of{" "}
        <span className="text-white font-semibold">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={hrefFor(prev)}
          className={`jmb-btn-ghost jmb-btn-sm ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          Prev
        </Link>
        <Link
          href={hrefFor(next)}
          className={`jmb-btn-ghost jmb-btn-sm ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
