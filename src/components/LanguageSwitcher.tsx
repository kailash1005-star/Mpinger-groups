"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Locale switcher for the four supported languages.
 *
 * `usePathname` here is next-intl's, not Next's: it returns the path *without*
 * the locale segment, so pairing it with `locale` on <Link> re-renders the
 * current page in the target language. The previous inline version hardcoded
 * href="/", which sent anyone switching language from /contact or a legal page
 * back to the homepage and lost their place.
 */
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const active = useLocale();
  const t = useTranslations("language");

  return (
    <nav
      aria-label={t("label")}
      className="fixed right-4 top-24 z-50 flex items-center gap-2 rounded-full border border-neutral-900/10 bg-white/90 px-3 py-2 font-mono text-[10px] uppercase tracking-wider shadow-lg backdrop-blur-md"
    >
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          hrefLang={locale}
          aria-current={locale === active ? "true" : undefined}
          className={
            locale === active
              ? "font-bold text-[#e2551c]"
              : "text-neutral-500 hover:text-[#e2551c]"
          }
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
