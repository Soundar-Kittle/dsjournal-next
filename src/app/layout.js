import { Geist, Geist_Mono, Poppins, Roboto } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Providers } from "./providers";
import { getSettings } from "@/utils/getSettings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
});

export async function generateMetadata() {
  const settings = await getSettings();
  const icon = settings?.icon ? `/${settings.icon}` : "/logo.png";
  return {
    title: "Dream Science | Engineering and Technology Journals",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_BASE_URL || "https://dsjournals.com"
    ),
    description:
      "DS Journals publishes high-quality academic research papers in various fields.",
    icons: {
      icon,
      apple: icon,
    },
    openGraph: {
      title: "Dream Science Journal",
      description: "Engineering and Technology Research Publications",
      type: "website",
      siteName: "Dream Science",
      images: [{ url: icon, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Dream Science Journal",
      description: "Engineering and Technology Research Publications",
      images: [icon],
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <GoogleTagManager gtmId="GTM-TC3323V4" /> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${roboto.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
      {/* <GoogleAnalytics gaId="G-X1GJ4EE6YR" /> */}
    </html>
  );
}