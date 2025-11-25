import { Geist, Geist_Mono, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import CookieConsentWrapper from "@/components/Cookie/CookieConsentWrapper";
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

export const generateMetadata = async () => {
  const settings = await getSettings();
  return {
    title: "Dream Science | Engineering and Technology Journals",
    description:
      "DS Journals publishes high-quality academic research papers in various fields. Submit your manuscript for peer review and get published early!",
    icons: {
      icon: [
        {
          url: settings?.icon ? `/${settings?.icon}` : "/logo.png",
        },
      ],
      apple: [
        {
          url: settings?.icon ? `/${settings?.icon}` : "/logo.png",
        },
      ],
    },
  };
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${roboto.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <CookieConsentWrapper />
      </body>
    </html>
  );
}
