import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "Anong Ulam? — Budget-friendly meal ideas for every Filipino home",
  description:
    "Ilagay ang iyong budget sa piso at agad kang bibigyan ng mga mungkahing ulam na kaya ng bulsa. Mula palengke hanggang kaldero.",
  applicationName: "Anong Ulam?",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Anong Ulam?",
    statusBarStyle: "default",
  },
  keywords: [
    "anong ulam",
    "ulam ideas",
    "Filipino recipes",
    "budget meal Philippines",
    "murang ulam",
    "carinderia",
  ],
};

export const viewport: Viewport = {
  themeColor: "#C84B31",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // translate="no" keeps browser auto-translation from rewriting the DOM
    // underneath React (the intentionally Taglish copy is meant to stay as-is).
    <html lang="fil" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
