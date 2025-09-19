
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import ProvidersWrapper from "../components/ProvidersWrapper";
import DarkModeForcer from "../components/ui/DarkModeForcer";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased bg-gray-900 text-white`}>
        <DarkModeForcer />
        <ProvidersWrapper>
          {children}
        </ProvidersWrapper>
      </body>
    </html>
  );
}
