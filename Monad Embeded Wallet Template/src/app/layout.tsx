import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/providers/Providers";
import { ToastContainer } from "react-toastify";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#04050b",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Monad Embedded Wallet Example",
  description:
    "A Monad Testnet counter application template with Privy wallet login, deposit, withdraw, and on-chain counter actions.",
  keywords: ["monad", "counter", "template", "privy", "wagmi", "viem", "web3"],
  authors: [{ name: "Monad Embedded Wallet Example" }],
  openGraph: {
    title: "Monad Embedded Wallet Example",
    description:
      "Start from a production-ready Monad counter template with wallet UX and contract integration.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Monad Embedded Wallet Example",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Monad Embedded Wallet Example",
    description:
      "Monad counter template with wallet login, deposit/withdraw, and on-chain increment.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          {children}
           <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="dark"
          toastClassName={ "bg-zinc-900 border-2 border-main rounded-md text-white shadow-brutal-sm font-medium font-sans"}
        />
        </Providers>
      </body>
    </html>
  );
}
