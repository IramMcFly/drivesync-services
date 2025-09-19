
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import ProvidersWrapper from "../components/ProvidersWrapper";
import DarkModeForcer from "../components/ui/DarkModeForcer";
import PWAInstallPrompt from "../components/ui/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata = {
  title: "DriveSync Services",
  description: "Todo en la palma de tu mano",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DriveSync"
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#0f172a",
    "msapplication-tap-highlight": "no"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DriveSync" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased bg-gray-900 text-white safe-area-inset`}>
        <DarkModeForcer />
        <ProvidersWrapper>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </ProvidersWrapper>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
