import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/lib/auth";
import { BRAND, SITE_URL, buildAlternates } from "@/app/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SellBuy.lv — Droši darījumi Latvijā",
    template: `%s | ${BRAND}`,
  },
  description:
    "Meklē un atrod labākos sludinājumus Latvijā. Transports, nekustamie īpašumi, elektronika un daudz kas cits. Smart-ID verifikācija, Escrow aizsardzība, Omniva/DPD piegāde.",
  alternates: buildAlternates("/"),
  keywords: [
    "sludinājumi Latvijā",
    "pārdošana",
    "pirkšana",
    "auto",
    "nekustamie īpašumi",
    "elektronika",
    "Smart-ID",
    "Escrow",
    "Omniva",
    "DPD",
  ],
  openGraph: {
    siteName: BRAND,
    locale: "lv_LV",
    alternateLocale: ["ru_RU", "en_GB"],
    title: "SellBuy.lv — Droši darījumi Latvijā",
    description:
      "Meklē un atrod labākos sludinājumus Latvijā. Smart-ID verifikācija, Escrow aizsardzība, Omniva/DPD piegāde.",
    url: SITE_URL,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="lv"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}