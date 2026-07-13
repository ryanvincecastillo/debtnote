import type { Metadata } from "next";
import { Crimson_Text, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const crimson = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://debtnote.app"),
  title: {
    default: "DebtNote — Let the notebook do the talking",
    template: "%s · DebtNote",
  },
  description:
    "Personal utang/pautang collection for Filipinos. Dual ledger, automated email nudges, signed promissory agreements, and paluwagan pools.",
  icons: {
    icon: [{ url: "/debtnote-app.png", type: "image/png" }],
    apple: [{ url: "/debtnote-app.png", type: "image/png" }],
  },
  openGraph: {
    title: "DebtNote",
    description: "Let the notebook do the talking.",
    type: "website",
    images: [{ url: "/og-banner.png", width: 1376, height: 768, alt: "DebtNote" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DebtNote",
    description: "Let the notebook do the talking.",
    images: ["/og-banner.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${crimson.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
