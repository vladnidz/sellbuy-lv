import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/lib/auth";
import { BRAND, SITE_URL, buildAlternates } from "@/app/lib/seo";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/app/lib/theme-context";
import { LocaleProvider } from "@/app/lib/locale-context";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SellBuy.lv — Droši darījumi Latvijā",
    template: `%s | ${BRAND}`,
  },
  description:
    "Meklē un atrod labākos sludinājumus Latvijā. Transports, nekustamie īpašumi, elektronika un daudz kas cits.",
  alternates: buildAlternates("/"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#e8e8ed] light:bg-[#f8f8fa] light:text-[#1a1a25]">
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
