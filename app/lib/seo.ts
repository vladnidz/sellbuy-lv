import type { Metadata } from "next";

/**
 * Shared SEO helpers for SellBuy.lv (trilingual LV/RU/EN).
 *
 * URL architecture (per SEO_STRATEGY.md §0):
 *   - LV is the default locale and lives on the unlocalized path (`/listings`)
 *   - RU and EN get locale-prefixed paths (`/ru/listings`, `/en/listings`);
 *     those routes ship with the upcoming `[locale]` segment + middleware.
 *   - Until then, hreflang alternates already declare the target URLs so the
 *     switch-over is zero-churn.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sellbuy.lv";

export const BRAND = "SellBuy.lv";

export interface TrilingualCopy {
  lv: { title: string; description: string };
  ru: { title: string; description: string };
  en: { title: string; description: string };
}

/**
 * Builds Next.js Metadata with trilingual title/description plus
 * rel="alternate" hreflang links (lv, ru, en, x-default).
 *
 * `path` is the locale-neutral path, e.g. "/listings".
 */
export function buildTrilingualMetadata(
  path: string,
  copy: TrilingualCopy
): Metadata {
  return {
    // Per-locale crawlers pick their language; default HTML is LV.
    title: copy.lv.title,
    description: copy.lv.description,
    alternates: buildAlternates(path),
    keywords: [copy.lv.description, copy.ru.description, copy.en.description],
    openGraph: {
      siteName: BRAND,
      locale: "lv_LV",
      alternateLocale: ["ru_RU", "en_GB"],
      title: copy.lv.title,
      description: copy.lv.description,
      url: `${SITE_URL}${path}`,
      type: "website",
    },
  };
}

export function buildAlternates(path: string): Metadata["alternates"] {
  const cleanPath = path === "/" ? "" : path;
  return {
    canonical: `${SITE_URL}${cleanPath || "/"}`,
    languages: {
      "x-default": `${SITE_URL}${cleanPath || "/"}`,
      lv: `${SITE_URL}${cleanPath || "/"}`,
      ru: `${SITE_URL}/ru${cleanPath}`,
      en: `${SITE_URL}/en${cleanPath}`,
    },
  };
}
