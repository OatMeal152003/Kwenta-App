import { Icon, isBrandBadge } from "@/components/icons";
import { avatarColors, initials, pastel, deep } from "@/lib/colors";

/** Pastel rounded-square icon chip, e.g. category glyphs. Brand badges render full-bleed. */
export function Chip({ icon, color, size = 52, glyph = 24 }: { icon: string; color: string; size?: number; glyph?: number }) {
  if (isBrandBadge(icon)) {
    return (
      <span className="flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
        <Icon name={icon} size={size} />
      </span>
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-[16px]"
      style={{ width: size, height: size, backgroundColor: pastel(color), color: deep(color) }}
    >
      <Icon name={icon} size={glyph} />
    </span>
  );
}

/** Circular avatar with initials for people (utang). */
export function Avatar({ name, size = 52 }: { name: string; size?: number }) {
  const c = avatarColors(name);
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-heading font-bold"
      style={{ width: size, height: size, backgroundColor: c.bg, color: c.fg, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

/** Teal-tinted month pill used as the month selector, e.g. "October 2026". */
export function MonthPill({ month, onPrev, onNext }: { month: string; onPrev: () => void; onNext: () => void }) {
  const [y, m] = month.split("-").map(Number);
  const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-PH", { month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1">
      <button onClick={onPrev} aria-label="Previous month" className="rounded-full px-2 font-bold text-primary">‹</button>
      <span className="text-sm font-bold text-primary">{label}</span>
      <button onClick={onNext} aria-label="Next month" className="rounded-full px-2 font-bold text-primary">›</button>
    </div>
  );
}

/** Teal outline pill button, e.g. "Add budget" / "Add utang". */
export function OutlineButton({ children, onClick, label }: { children: React.ReactNode; onClick?: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-full rounded-full border-2 border-primary py-3 font-heading text-lg font-bold text-primary transition-colors active:bg-primary/10"
    >
      {children}
    </button>
  );
}

/** Page header: big slate title left, optional right slot. */
export function PageHeader({ title, right, backHref }: { title: string; right?: React.ReactNode; backHref?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {backHref && (
          <a href={backHref} aria-label="Back" className="rounded-full p-2 text-ink">
            <Icon name="chev-left" size={22} />
          </a>
        )}
        <h1 className="font-heading text-3xl font-extrabold text-ink">{title}</h1>
      </div>
      {right}
    </div>
  );
}

/** Segmented control with a thumb that slides (not pops) between options. */
export function Segmented<T extends string>({ options, value, onChange, label }: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div className="relative flex rounded-full bg-slate-200/70 p-1.5 dark:bg-white/10" role="radiogroup" aria-label={label}>
      <span
        aria-hidden="true"
        className="slide-thumb absolute top-1.5 bottom-1.5 rounded-full bg-primary shadow"
        style={{ width: `calc((100% - 12px) / ${options.length})`, transform: `translateX(calc(${idx} * 100%))` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`relative z-10 flex-1 rounded-full py-2 font-bold transition-colors ${value === o.value ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
