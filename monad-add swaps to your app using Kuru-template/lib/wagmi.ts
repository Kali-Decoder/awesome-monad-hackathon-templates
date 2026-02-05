import { cookieStorage, createStorage } from "wagmi";
import { monad } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";

// Get project ID from environment
const envProjectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!envProjectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
}

export const projectId: string = envProjectId;

// Define networks - using Monad chain
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [monad];

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

// Re-export for use in components
export { monad };

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
