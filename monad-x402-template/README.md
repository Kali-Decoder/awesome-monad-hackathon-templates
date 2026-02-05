# Monad x402 Payment Template

A Next.js template demonstrating the **x402 Payment Protocol** using **Thirdweb Facilitator** on **Monad Testnet**. This template provides a complete implementation of HTTP 402 Payment Required, enabling pay-per-use API endpoints with seamless crypto payments.

## 🚀 What is x402?

The [x402 protocol](https://www.x402.org/) is an HTTP extension that enables pay-per-use APIs. When a client requests a premium resource, the server responds with a `402 Payment Required` status code, including payment requirements. The client then pays and includes a payment proof header (`x-payment`) in subsequent requests.

## ✨ Features

- **Complete x402 Implementation**: Full client and server-side x402 protocol support
- **Thirdweb Facilitator Integration**: Uses Thirdweb's facilitator service for payment settlement
- **Monad Testnet Support**: Configured for Monad testnet payments
- **Interactive Demo UI**: Real-time logging interface showing the entire payment flow
- **Wallet Integration**: MetaMask wallet connection and payment signing
- **TypeScript**: Fully typed for better developer experience
- **Tailwind CSS**: Modern, responsive UI styling

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- A **Thirdweb account** ([Sign up here](https://thirdweb.com))
- **MetaMask** or compatible wallet installed in your browser
- **Monad Testnet** configured in your wallet
- Some **testnet tokens** for payments (USDC on Monad Testnet)

## 🛠️ Setup Instructions

### 1. Clone or Use This Template

```bash
# If cloning from a repository
git clone <repository-url>
cd monad-x402-template

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

Create a `.env.local` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Thirdweb Secret Key (from Thirdweb Dashboard)
SECRET_KEY=your_thirdweb_secret_key_here

# Server Wallet Address (your wallet address that receives payments)
SERVER_WALLET=0xYourServerWalletAddress

# Thirdweb Client ID (public, safe to expose)
NEXT_PUBLIC_CLIENT_ID=your_thirdweb_client_id_here
```

#### Getting Your Thirdweb Credentials

1. **Sign up/Login** to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. **Create a new project** or select an existing one
3. **Get your Client ID**:
   - Go to Settings → API Keys
   - Copy your **Client ID** (public key)
4. **Get your Secret Key**:
   - In the same section, copy your **Secret Key** (keep this private!)
5. **Create/Import a Server Wallet**:
   - Go to Wallets section
   - Create a new wallet or import an existing one
   - Copy the wallet address for `SERVER_WALLET`

### 4. Update Production URL (Optional)

In `src/app/api/premium/route.ts`, update the `resourceUrl` for production:

```typescript
resourceUrl: "https://your-production-domain.com/api/premium",
```

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
│   Client    │────────▶│   Server     │────────▶│ Thirdweb    │
│  (Browser)  │         │  (Next.js)   │         │ Facilitator │
└─────────────┘         └──────────────┘         └─────────────┘
     │                          │                         │
     │  1. Request (no payment) │                         │
     ├─────────────────────────▶│                         │
     │                          │                         │
     │  2. 402 Payment Required │                         │
     │◀─────────────────────────┤                         │
     │                          │                         │
     │  3. Sign payment         │                         │
     │                          │                         │
     │  4. Request (with x-payment header)                │
     ├─────────────────────────▶│                         │
     │                          │  5. Settle payment      │
     │                          ├────────────────────────▶│
     │                          │                         │
     │                          │  6. Payment receipt     │
     │                          │◀────────────────────────┤
     │                          │                         │
     │  7. Success + Receipt    │                         │
     │◀─────────────────────────┤                         │
```

### Payment Flow

1. **Client Request**: User clicks "RUN" button, triggering a request to `/api/premium`
2. **402 Response**: Server responds with `402 Payment Required` and payment requirements
3. **Wallet Connection**: Client connects MetaMask wallet
4. **Payment Signing**: Client signs the payment transaction using Thirdweb's `wrapFetchWithPayment`
5. **Paid Request**: Client sends request with `x-payment` header containing payment proof
6. **Payment Settlement**: Server uses Thirdweb facilitator to settle the payment on-chain
7. **Success Response**: Server returns the premium content along with payment receipt

### Key Components

#### Client Side (`src/app/page.tsx`)

- **Wallet Connection**: Uses `createWallet("io.metamask")` to connect MetaMask
- **Payment Wrapper**: Uses `wrapFetchWithPayment()` to automatically handle payment signing
- **UI Logger**: Real-time logging interface showing each step of the payment flow

#### Server Side (`src/app/api/premium/route.ts`)

- **Facilitator Setup**: Configures Thirdweb facilitator with server wallet
- **Payment Settlement**: Uses `settlePayment()` to process incoming payments
- **402 Handling**: Returns `402` status when no payment header is present

## 🔧 Customization

### Changing Payment Amount

Edit `src/app/api/premium/route.ts`:

```typescript
price: "$0.001", // Change to your desired amount
```

### Changing Network

Currently configured for Monad Testnet. To change:

```typescript
import { yourChain } from "thirdweb/chains";

// In settlePayment()
network: yourChain,
```

### Adding More Premium Endpoints

Create new API routes following the same pattern:

```typescript
// src/app/api/your-endpoint/route.ts
import { settlePayment } from "thirdweb/x402";
// ... same setup as premium/route.ts
```

### Customizing UI

The UI is built with Tailwind CSS. Modify `src/app/page.tsx` to customize the appearance and add features.

## 📚 Resources

- **[x402 Protocol Specification](https://www.x402.org/)** - Official x402 protocol docs
- **[Thirdweb x402 Documentation](https://portal.thirdweb.com/payments/x402)** - Thirdweb's x402 implementation guide
- **[Monad Explorer](https://testnet.monadexplorer.com/)** - Explore Monad testnet transactions
- **[Thirdweb Dashboard](https://thirdweb.com/dashboard)** - Manage your Thirdweb project
- **[Next.js Documentation](https://nextjs.org/docs)** - Next.js framework docs

## 🐛 Troubleshooting

### "Payment failed" Error

- Ensure your wallet has sufficient testnet tokens (USDC on Monad Testnet)
- Check that `SERVER_WALLET` is correctly set
- Verify `SECRET_KEY` is valid and has proper permissions

### "Wallet connection failed"

- Make sure MetaMask is installed and unlocked
- Ensure Monad Testnet is added to MetaMask
- Check browser console for detailed error messages

### "402 Payment Required" but payment not working

- Verify `NEXT_PUBLIC_CLIENT_ID` is set correctly
- Check that Thirdweb facilitator is properly configured
- Review server logs for detailed error messages

### Environment Variables Not Loading

- Ensure `.env.local` is in the root directory
- Restart the development server after changing `.env.local`
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `SECRET_KEY`
   - `SERVER_WALLET`
   - `NEXT_PUBLIC_CLIENT_ID`
4. Update `resourceUrl` in `route.ts` to your production URL
5. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Next.js:
- **Netlify**
- **Railway**
- **Render**
- **AWS Amplify**
- Any Node.js hosting platform

## 📝 License

This template is provided as-is for educational and development purposes.

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## ⚠️ Important Notes

- This template uses **Monad Testnet** - use testnet tokens only
- The facilitator handles on-chain transactions - you don't need to manage blockchain interactions manually
- The `transaction` field in receipts is a facilitator reference ID, not an on-chain transaction hash
- Check the Thirdweb dashboard for actual on-chain transaction details
- Keep your `SECRET_KEY` secure and never commit it to version control

---

**Happy Building! 🎉**
