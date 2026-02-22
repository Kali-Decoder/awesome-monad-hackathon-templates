import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { FontLoader } from "./components/FontLoader";
import { Navigation } from "./components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Monad Staking Demo",
  description: "Demo frontend for staking, claiming rewards, and owner reward controls on Monad Testnet.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          ${inter.variable} ${mono.variable} font-mono antialiased
          bg-background text-white
          selection:bg-monad-purple/30 selection:text-monad-purple
          min-h-screen relative overflow-x-hidden
        `}
      >
        <Providers>
          <FontLoader />
          <Navigation />
          <div className="fixed inset-0 -z-10 h-full w-full bg-background">
            <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-full -translate-x-1/2 rounded-full bg-monad-purple/5 blur-[120px]" />
          </div>
          <main>{children}</main>
          <footer className="border-t border-card-border bg-black/70 backdrop-blur-sm">
            <div className="relative overflow-hidden py-3">
              <p className="footer-marquee whitespace-nowrap text-xs font-semibold tracking-widest text-monad-purple">
                MONAD TESTNET STAKING DEMO • APPROVE • STAKE • WITHDRAW • CLAIM • OWNER REWARD CONFIG
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
