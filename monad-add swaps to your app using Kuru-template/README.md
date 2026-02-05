# Kuru Flow Swap Template - Next.js

A production-ready Next.js template for integrating token swaps on Monad blockchain using the [Kuru Flow API](https://docs.kuru.io/kuru-flow/flow-overview). This template provides a complete swap interface with wallet connection, quote fetching, and transaction execution, perfect for building DeFi applications on Monad.

**Live Demo:** [example-repo-kuru-flow.vercel.app](https://example-repo-kuru-flow.vercel.app)

## 🚀 Features

- **Token Swap Interface** - Beautiful, responsive swap UI with real-time quotes
- **Native MON Support** - Swap native MON without wrapping
- **Wallet Integration** - Connect wallets via Reown AppKit (formerly WalletConnect)
- **Referral Fee System** - Earn fees on every swap through your app
- **JWT Authentication** - Secure API access with token-based auth
- **Real-time Quotes** - Automatic quote updates with debouncing
- **Transaction Tracking** - Monitor swap status with transaction receipts
- **ERC20 Token Support** - Full support for ERC20 tokens with approval flow
- **Modern UI** - Built with Tailwind CSS v4 and shadcn/ui components
- **TypeScript** - Fully typed for better developer experience

## 📋 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Wallet:** [Reown AppKit](https://appkit.reown.com/) (Wagmi + Viem)
- **State Management:** TanStack Query (React Query)
- **Blockchain:** Monad Mainnet
- **API:** Kuru Flow Aggregator

## 📁 Project Structure

```
├── app/
│   ├── globals.css          # Global styles, Tailwind config, custom fonts
│   ├── layout.tsx           # Root layout with font configuration
│   ├── page.tsx             # Main landing page
│   └── providers.tsx        # Wagmi + React Query providers setup
├── components/
│   ├── SwapCard.tsx         # Main swap component with all logic
│   └── ui/                  # shadcn/ui components
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib/
│   ├── kuru-flow.ts         # Kuru Flow API client and configuration
│   ├── wagmi.ts             # Wagmi configuration for Monad
│   └── utils.ts             # Utility functions (cn helper)
└── public/                  # Static assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A wallet address for receiving referral fees (optional but recommended)
- A Reown (WalletConnect) Project ID

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id_here
```

**Getting a Reown Project ID:**
1. Visit [cloud.reown.com](https://cloud.reown.com/)
2. Create a new project
3. Copy your Project ID
4. Add it to `.env.local`

### 3. Configure Referral Settings

Edit `lib/kuru-flow.ts` to set your referral address and fee:

```typescript
// Your wallet address to receive referral fees
export const REFERRER_ADDRESS = "0xYourWalletAddressHere";

// Fee in basis points (50 = 0.5%, 100 = 1%)
export const REFERRER_FEE_BPS = 50;
```

**Referral Fee Examples:**
| Fee (bps) | Percentage | Earnings on 100 USDC swap |
|-----------|------------|---------------------------|
| 25        | 0.25%      | 0.25 USDC                 |
| 50        | 0.50%      | 0.50 USDC                 |
| 100       | 1.00%      | 1.00 USDC                 |

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your swap interface.

## 🎨 Customization Guide

### Adding New Tokens

Edit the `TOKEN_CONFIG` object in `components/SwapCard.tsx`:

```typescript
const TOKEN_CONFIG = {
  MON: {
    address: "0x0000000000000000000000000000000000000000", // Native token
    symbol: "MON",
    decimals: 18,
    isNative: true,
  },
  USDC: {
    address: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
    symbol: "USDC",
    decimals: 6,
    isNative: false,
  },
  // Add your token here
  YOUR_TOKEN: {
    address: "0xYourTokenAddress",
    symbol: "YOUR",
    decimals: 18,
    isNative: false,
  },
};
```

### Customizing Fonts

The template uses Google Fonts. To change fonts, edit `app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap');

/* Then update the font-family in body */
body {
  font-family: 'YourFont', sans-serif;
}
```

Available fonts in this template:
- **Montserrat** (default) - Modern, versatile sans-serif
- **Anonymous Pro** - Monospace font for code/debug
- **Abel, Archivo Black, Badeen Display, Orbitron, Pixelify Sans, Science Gothic** - Available for custom use

### Styling & Theme

The app uses Tailwind CSS v4 with a Monad-inspired color palette. Customize colors in `app/globals.css`:

```css
:root {
  --primary: oklch(0.55 0.25 285); /* Monad purple */
  --background: oklch(0.985 0 0);
  /* ... more variables */
}
```

### Updating App Metadata

Edit `app/providers.tsx` to customize your app's metadata:

```typescript
const metadata = {
  name: "Your App Name",
  description: "Your app description",
  url: "https://yourapp.com",
  icons: ["https://your-icon-url.com/icon.png"],
};
```

## 🔧 How It Works

### Architecture Flow

1. **User connects wallet** → Reown AppKit handles connection
2. **JWT token generation** → API generates auth token for user address
3. **User enters swap amount** → Component fetches quote from Kuru Flow API
4. **Quote received** → Shows output amount, gas estimates, and transaction data
5. **ERC20 approval** → If swapping ERC20, user approves router contract
6. **Swap execution** → Transaction sent to Monad network
7. **Confirmation** → Transaction receipt tracked and displayed

### Key Components

#### SwapCard Component (`components/SwapCard.tsx`)

The main swap component handles:
- Wallet connection state
- Token selection and amount input
- Quote fetching with debouncing
- ERC20 approval flow
- Transaction execution
- Error handling and status updates

#### Kuru Flow Client (`lib/kuru-flow.ts`)

API client functions:
- `generateToken()` - Creates JWT for API authentication
- `getQuote()` - Fetches swap quote with routing
- `getQuoteWithReferral()` - Wrapper that includes referral fees

#### Wagmi Configuration (`lib/wagmi.ts`)

Configures:
- Monad network connection
- Reown AppKit adapter
- Cookie-based storage for SSR

## 📡 API Integration

### Base URL
```
https://ws.kuru.io
```

### Endpoints

#### Generate Token
```typescript
POST /api/generate-token
Body: { user_address: string }
Response: { token: string, expires_at: number, rate_limit: {...} }
```

#### Get Quote
```typescript
POST /api/quote
Headers: { Authorization: "Bearer <jwt_token>" }
Body: {
  userAddress: string,
  tokenIn: string,        // 0x0 for native MON
  tokenOut: string,       // 0x0 for native MON
  amount: string,         // In smallest token units
  autoSlippage?: boolean,
  slippageTolerance?: number,
  referrerAddress?: string,
  referrerFeeBps?: number
}
Response: {
  status: "success" | "error",
  output: string,
  minOut: string,
  transaction: { to, calldata, value },
  gasPrices: {...}
}
```

### Usage Example

```typescript
import { generateToken, getQuoteWithReferral } from "@/lib/kuru-flow";
import { parseUnits } from "viem";

// 1. Generate JWT token
const { token } = await generateToken(userAddress);

// 2. Get quote
const quote = await getQuoteWithReferral(
  userAddress,
  "0x0000000000000000000000000000000000000000", // MON
  "0x754704Bc059F8C67012fEd69BC8A327a5aafb603", // USDC
  parseUnits("100", 18).toString(), // 100 MON
  token
);

// 3. Execute swap
const tx = await sendTransaction({
  to: quote.transaction.to,
  data: quote.transaction.calldata,
  value: BigInt(quote.transaction.value),
});
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variable `NEXT_PUBLIC_PROJECT_ID`
4. Deploy!

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Node.js

Make sure to set `NEXT_PUBLIC_PROJECT_ID` in your deployment environment.

## 🐛 Troubleshooting

### Wallet Connection Issues

- **Problem:** Wallet won't connect
- **Solution:** Check that `NEXT_PUBLIC_PROJECT_ID` is set correctly

### Quote Errors

- **Problem:** "Failed to get quote" error
- **Solution:** 
  - Verify wallet is connected
  - Check token addresses are correct
  - Ensure sufficient balance
  - Check network is Monad Mainnet

### Transaction Failures

- **Problem:** Transaction reverts
- **Solution:**
  - Check token approval (for ERC20)
  - Verify sufficient balance
  - Ensure slippage tolerance is appropriate
  - Check gas price settings

### Build Errors

- **Problem:** Webpack/Turbopack errors
- **Solution:** The `next.config.ts` includes externals for problematic packages. If issues persist, check Node.js version (18+ required)

## 📚 Additional Resources

- [Kuru Flow Documentation](https://docs.kuru.io/kuru-flow/flow-overview)
- [Monad Developer Docs](https://docs.monad.xyz/guides/kuru-flow)
- [Reown AppKit Docs](https://docs.reown.com/appkit)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

This is a template repository. Feel free to fork and customize for your needs!

## 📄 License

MIT

---

**Built for the Monad Ecosystem** 🚀

For questions or support, visit the [Kuru Flow documentation](https://docs.kuru.io/kuru-flow/flow-overview) or check the [Monad developer community](https://docs.monad.xyz).
