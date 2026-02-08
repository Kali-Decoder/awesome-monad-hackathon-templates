# Privy Smart Wallets Template for Monad Testnet

A production-ready Next.js template for using smart wallets with [**Privy Auth**](https://www.privy.io/) on **Monad Testnet**. This template demonstrates how to integrate Privy's smart wallet functionality, enabling seamless user onboarding and transaction execution without requiring users to manage private keys.

## 🚀 Features

- **🔐 Smart Wallet Integration** - Automatic smart wallet creation for all users via Privy
- **💼 Embedded Wallets** - No need for users to install browser extensions
- **🔄 Batch Transactions** - Execute multiple transactions in a single batch
- **📝 Transaction Examples** - Complete examples for minting NFTs, approvals, and batch operations
- **🌐 Monad Testnet Support** - Pre-configured for Monad Testnet (Chain ID: 10143)
- **🔒 Server-Side Auth** - Secure authentication with server-side token verification
- **📱 Responsive Design** - Modern UI built with Tailwind CSS
- **⚡ TypeScript** - Fully typed for better developer experience
- **🎨 Beautiful UI** - Custom graphics and styling

## 📋 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (Pages Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** [Privy Auth](https://www.privy.io/)
- **Smart Wallets:** [Privy Smart Wallets](https://docs.privy.io/guide/react/wallets/smart-wallets/)
- **Blockchain:** Monad Testnet (Chain ID: 10143)
- **Blockchain Library:** Viem
- **UI Components:** Headless UI, Heroicons

## 📁 Project Structure

```
Smart-Wallet-Privy-Template/
├── pages/
│   ├── _app.tsx              # Root app component with PrivyProvider and SmartWalletsProvider
│   ├── index.tsx             # Login page with server-side auth check
│   ├── dashboard.tsx         # Dashboard with smart wallet transaction examples
│   └── api/
│       └── verify.ts         # API route for token verification
├── components/
│   ├── graphics/
│   │   ├── login.tsx         # Login page graphics
│   │   └── portal.tsx        # Portal graphics component
│   ├── lib/
│   │   └── abis/
│   │       └── mint.ts       # NFT mint ABI
│   ├── formatted-date.tsx    # Date formatting component
│   ├── layout.tsx            # Layout component
│   ├── logo.tsx              # Logo component
│   └── navbar.tsx            # Navigation bar
├── styles/
│   └── globals.css           # Global styles
├── public/
│   ├── fonts/                # Custom fonts
│   ├── images/               # Static images
│   └── logos/                # Logo assets
├── .env.local                # Environment variables (create this)
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** 9+ (or yarn/pnpm)
- A [**Privy account**](https://privy.io) with an app created
- **Smart wallets configured** in your Privy dashboard
- **Monad Testnet** configured in your wallet (Chain ID: 10143)
- Testnet tokens from the [Monad Faucet](https://faucet.monad.xyz)

### 1. Clone or Use This Template

```bash
# If cloning from a repository
git clone <repository-url>
cd Smart-Wallet-Privy-Template

# Or use this as a template for your project
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Privy App ID (public, safe to expose)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Privy App Secret (server-side only, keep private!)
PRIVY_APP_SECRET=your_privy_app_secret_here
```

#### Getting Your Privy Credentials

1. **Sign up/Login** to [Privy Dashboard](https://dashboard.privy.io/)
2. **Create a new app** or select an existing one
3. **Get your App ID**:
   - Go to Settings → API Keys
   - Copy your **App ID** (this is public and safe to expose)
4. **Get your App Secret**:
   - In the same section, copy your **App Secret** (keep this private!)
   - Only use this server-side, never expose it to the client

#### Configure Smart Wallets

1. In your Privy dashboard, navigate to **Wallets** → **Smart Wallets**
2. Enable smart wallets for your app
3. Configure your smart wallet settings:
   - Choose your smart wallet provider (e.g., Privy's default)
   - Set up gas sponsorship if desired
   - Configure wallet creation settings

### 4. Update Contract Address (Optional)

The template includes example transactions with an NFT contract. Update the contract address in `pages/dashboard.tsx`:

```typescript
const NFT_CONTRACT_ADDRESS = "0xYourContractAddressOnMonadTestnet" as const;
```

> **Note:** You'll need to deploy your own contract on Monad Testnet or use an existing contract address.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How It Works

### Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │────────▶│   Next.js    │────────▶│    Privy    │
│  (Browser)  │         │   Server     │         │   Service   │
└─────────────┘         └──────────────┘         └─────────────┘
     │                          │                         │
     │  1. Login Request        │                         │
     ├─────────────────────────▶│                         │
     │                          │  2. Authenticate        │
     │                          ├────────────────────────▶│
     │                          │                         │
     │                          │  3. Auth Token          │
     │                          │◀────────────────────────┤
     │                          │                         │
     │  4. Auth Cookie          │                         │
     │◀─────────────────────────┤                         │
     │                          │                         │
     │  5. Smart Wallet Created │                         │
     │                          │                         │
     │  6. Execute Transaction  │                         │
     ├─────────────────────────▶│                         │
     │                          │  7. Send to Monad       │
     │                          ├────────────────────────▶│
     │                          │                         │
     │  8. Transaction Receipt  │                         │
     │◀─────────────────────────┤                         │
```

### Authentication Flow

1. **User Login**: User clicks "Log in" button on the home page
2. **Privy Modal**: Privy authentication modal opens
3. **Authentication**: User authenticates via email, social login, or wallet
4. **Smart Wallet Creation**: Privy automatically creates a smart wallet for the user
5. **Server Verification**: Server verifies the auth token and sets a cookie
6. **Dashboard Access**: User is redirected to the dashboard

### Smart Wallet Transactions

The template demonstrates three types of transactions:

1. **Single Transaction (Mint NFT)**:
   ```typescript
   smartWalletClient.sendTransaction({
     to: NFT_CONTRACT_ADDRESS,
     data: encodeFunctionData({ abi: mintAbi, functionName: "mint", args: [...] }),
   });
   ```

2. **Single Transaction (Approve)**:
   ```typescript
   smartWalletClient.sendTransaction({
     to: NFT_CONTRACT_ADDRESS,
     data: encodeFunctionData({ abi: erc721Abi, functionName: "setApprovalForAll", args: [...] }),
   });
   ```

3. **Batch Transaction**:
   ```typescript
   smartWalletClient.sendTransaction({
     account: smartWalletClient.account,
     calls: [
       { to: NFT_CONTRACT_ADDRESS, data: mintData },
       { to: NFT_CONTRACT_ADDRESS, data: approveData },
     ],
   });
   ```

### Key Components

#### App Setup (`pages/_app.tsx`)

- **PrivyProvider**: Wraps the app with Privy authentication
- **SmartWalletsProvider**: Enables smart wallet functionality
- **Monad Testnet Configuration**: Defines the Monad testnet chain

#### Login Page (`pages/index.tsx`)

- **Server-Side Auth Check**: Verifies existing auth tokens
- **Login Flow**: Handles user authentication
- **Redirect Logic**: Redirects authenticated users to dashboard

#### Dashboard (`pages/dashboard.tsx`)

- **Smart Wallet Client**: Uses `useSmartWallets` hook to get the smart wallet client
- **Transaction Examples**: Demonstrates minting, approvals, and batch transactions
- **User Info Display**: Shows the authenticated user object

## 🔧 Customization

### Changing the Network

The template is configured for Monad Testnet. To change networks, update `pages/_app.tsx`:

```typescript
// Define your chain
const yourChain = defineChain({
  id: YOUR_CHAIN_ID,
  name: "Your Chain Name",
  // ... chain configuration
});

// Update PrivyProvider config
<PrivyProvider
  config={{
    defaultChain: yourChain,
    supportedChains: [yourChain],
    // ...
  }}
>
```

### Adding Custom Transactions

Add new transaction functions in `pages/dashboard.tsx`:

```typescript
const onCustomTransaction = () => {
  if (!smartWalletClient) return;

  smartWalletClient.sendTransaction({
    to: YOUR_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: yourAbi,
      functionName: "yourFunction",
      args: [/* your args */],
    }),
  });
};
```

### Customizing UI

The template uses Tailwind CSS for styling. Modify components to customize the appearance:

- **Colors**: Update Tailwind classes in components
- **Layout**: Modify component structure in `pages/` and `components/`
- **Graphics**: Replace graphics in `components/graphics/`

### Adding More Pages

Create new pages in the `pages/` directory:

```typescript
// pages/your-page.tsx
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";

export default function YourPage() {
  const { authenticated } = usePrivy();
  const { client } = useSmartWallets();
  
  // Your page content
}
```

## 🐛 Troubleshooting

### "NEXT_PUBLIC_PRIVY_APP_ID is not set"

- ✅ Check `.env.local` exists in root directory
- ✅ Verify variable name is exactly `NEXT_PUBLIC_PRIVY_APP_ID`
- ✅ Restart dev server after adding env vars

### "PRIVY_APP_SECRET is not set"

- ✅ Ensure variable name is exactly `PRIVY_APP_SECRET`
- ✅ Check `.env.local` file (not `.env`)
- ✅ Restart dev server

### Smart Wallet Not Creating

- ✅ Verify smart wallets are enabled in Privy dashboard
- ✅ Check smart wallet configuration in dashboard
- ✅ Ensure you're using the correct App ID
- ✅ Check browser console for errors

### Transactions Failing

- ✅ Verify contract address is correct for Monad Testnet
- ✅ Ensure contract exists on Monad Testnet
- ✅ Check smart wallet has sufficient balance
- ✅ Verify ABI matches your contract
- ✅ Check browser console for detailed error messages

### Authentication Not Working

- ✅ Verify Privy App ID is correct
- ✅ Check Privy dashboard for app status
- ✅ Ensure cookies are enabled in browser
- ✅ Check server logs for authentication errors

### Network Issues

- ✅ Verify Monad Testnet is correctly configured
- ✅ Check RPC endpoint is accessible: `https://testnet-rpc.monad.xyz`
- ✅ Ensure wallet is connected to Monad Testnet
- ✅ Verify Chain ID is 10143

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Add Environment Variables**
   - `NEXT_PUBLIC_PRIVY_APP_ID`: Your Privy App ID
   - `PRIVY_APP_SECRET`: Your Privy App Secret

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Other Platforms

This is a standard Next.js app and can be deployed to any platform supporting Next.js:

- **Netlify**: Set build command to `npm run build` and publish directory to `.next`
- **Railway/Render**: Set build command to `npm run build` and start command to `npm start`
- **AWS Amplify**: Follow Next.js deployment guide
- **Self-hosted**: Run `npm run build` and `npm start`

### Environment Variables

**Required for Production:**
- `NEXT_PUBLIC_PRIVY_APP_ID`: Public App ID (exposed to browser)
- `PRIVY_APP_SECRET`: Private App Secret (server-side only)

**Security Notes:**
- ✅ Never commit `.env.local` to git
- ✅ Use platform-specific env var management
- ✅ `PRIVY_APP_SECRET` should never be exposed client-side
- ✅ `NEXT_PUBLIC_*` variables are exposed to browser

## 📚 Additional Resources

- **[Privy Documentation](https://docs.privy.io/)** - Complete Privy Auth and Smart Wallets guide
- **[Privy Smart Wallets Docs](https://docs.privy.io/guide/react/wallets/smart-wallets/)** - Smart wallet implementation guide
- **[Monad Documentation](https://docs.monad.xyz/)** - Official Monad blockchain docs
- **[Monad Testnet Documentation](https://docs.monad.xyz/developer-essentials/testnets)** - Testnet information
- **[Monad Explorer](https://testnet.monadvision.com)** - Explore Monad Testnet transactions
- **[Monad Faucet](https://faucet.monad.xyz)** - Get testnet tokens
- **[Monad Discord](https://discord.gg/monad)** - Community support
- **[Viem Documentation](https://viem.sh)** - Blockchain interaction library
- **[Next.js Documentation](https://nextjs.org/docs)** - Next.js framework guide

## 🤝 Contributing

This is a template repository. Feel free to fork and customize for your needs!

If you have improvements or find issues:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This template is provided as-is for educational and development purposes.

## ⚠️ Important Notes

- **Testnet Only**: This template is configured for Monad Testnet - use testnet tokens only
- **Contract Address**: The NFT contract address in `dashboard.tsx` is a placeholder - update it with your own contract
- **Smart Wallet Configuration**: Ensure smart wallets are properly configured in your Privy dashboard
- **API Keys**: Keep your `PRIVY_APP_SECRET` secure and never commit it to version control
- **Gas Sponsorship**: Configure gas sponsorship in Privy dashboard if you want to sponsor user transactions
- **Rate Limits**: Be aware of Privy API rate limits for production use

## 🌐 Monad Testnet Configuration

This template is pre-configured for **Monad Testnet**:

- **Chain ID:** 10143
- **RPC URL:** https://testnet-rpc.monad.xyz
- **Block Explorers:**
  - [MonadVision](https://testnet.monadvision.com)
  - [Monadscan](https://testnet.monadscan.com)
- **Faucet:** [Get testnet tokens](https://faucet.monad.xyz)
- **Native Currency:** MON (18 decimals)

---

**Built for the Monad Ecosystem** 🚀

**Happy Building! 🎉**
