"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiAdapter, projectId, networks } from "@/lib/wagmi";
import { useState } from "react";
import { createAppKit } from "@reown/appkit/react";

// Set up app metadata
const metadata = {
  name: "Kuru Flow",
  description: "Swap any token on Monad with optimal routing powered by Kuru Flow",
  url: "https://kuruflow.com", // Update with your actual URL
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Initialize Reown AppKit
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  features: {
    analytics: true,
  },
});

export function Providers({
  children,
  cookies,
}: {
  children: React.ReactNode;
  cookies: string | null;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
