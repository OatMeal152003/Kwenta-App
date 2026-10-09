"use client";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** Bottom tab bar like the mockups, with a pill that glides to the active tab. */
export default function TabBar() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [ind, setInd] = useState({ x: 0, w: 0, show: false });
  const isAdd = pathname === "/add" || pathname.startsWith("/add/");

  useLayoutEffect(() => {
    const update = () => {
      const order = ["/", "/stats", "/budgets", "/me"];
      const idx = order.findIndex((h) => isActive(pathname, h));
      const bar = barRef.current;
      const el = idx >= 0 ? tabRefs.current[idx] : null;
      if (!bar || !el) {
        setInd((s) => ({ ...s, show: false }));
        return;
      }
      const b = bar.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setInd({ x: r.left - b.left + r.width / 2, w: r.width + 8, show: true });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [pathname]);

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-carddark/95"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      <div ref={barRef} className="relative mx-auto flex max-w-md items-end justify-around px-2 pb-1 pt-1">
        {ind.show && !isAdd && (
          <span
            aria-hidden="true"
            className="slide-thumb pointer-events-none absolute left-0 top-1 bottom-1 rounded-2xl bg-primary/10 dark:bg-white/10"
            style={{ width: ind.w, transform: `translateX(${ind.x - ind.w / 2}px)` }}
          />
        )}
        <TabLink
          refFn={(el) => { tabRefs.current[0] = el; }}
          href="/"
          icon="home"
          label="Home"
          active={isActive(pathname, "/")}
        />
        <TabLink
          refFn={(el) => { tabRefs.current[1] = el; }}
          href="/stats"
          icon="chart"
          label="Stats"
          active={isActive(pathname, "/stats")}
        />
        <Link
          href="/add"
          aria-label="Add transaction"
          aria-current={isAdd ? "page" : undefined}
          className={`relative z-10 -mt-8 flex h-16 w-16 items-center justify-center rounded-full transition-transform active:scale-95 ${isAdd ? "scale-105 bg-accentdark text-ink shadow-xl shadow-accent/50 ring-4 ring-primary/40" : "bg-accent text-ink shadow-lg shadow-accent/40 ring-4 ring-bg dark:ring-bgdark"}`}
        >
          <Icon name="plus" size={30} strokeWidth={2.5} />
        </Link>
        <TabLink
          refFn={(el) => { tabRefs.current[2] = el; }}
          href="/budgets"
          icon="target"
          label="Budgets"
          active={isActive(pathname, "/budgets")}
        />
        <TabLink
          refFn={(el) => { tabRefs.current[3] = el; }}
          href="/me"
          icon="user"
          label="Me"
          active={isActive(pathname, "/me")}
        />
      </div>
    </nav>
  );
}

function TabLink({ href, icon, label, active, refFn }: {
  href: string; icon: string; label: string; active: boolean;
  refFn: (el: HTMLAnchorElement | null) => void;
}) {
  return (
    <Link
      key={href}
      ref={refFn}
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`relative flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-0.5 transition-transform active:scale-95 ${active ? "text-primary" : "text-slate-500"}`}
    >
      <Icon name={icon} size={24} />
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}
