const KURU_FLOW_API = "https://ws.kuru.io";

export interface QuoteParams {
  userAddress: string;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  autoSlippage?: boolean;
  slippageTolerance?: number;
  referrerAddress?: string;
  referrerFeeBps?: number;
}

export interface QuoteResponse {
  type: string;
  status: "success" | "error";
  output: string;
  minOut: string;
  transaction: {
    to: string;
    calldata: string;
    value: string;
  };
  gasPrices: {
    slow: string;
    standard: string;
    fast: string;
    rapid: string;
    extreme: string;
  };
  message?: string;
}

export interface TokenGenerateResponse {
  token: string;
  expires_at: number;
  rate_limit: {
    rps: number;
    burst: number;
  };
}

// ============================================================
// Configuration - Update these for your integration
// ============================================================

// Your wallet address to receive referral fees
// TODO: Replace with your own address to receive referral fees
export const REFERRER_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

// Referral fee in basis points (50 = 0.5%, 100 = 1%)
export const REFERRER_FEE_BPS = 50;

// ============================================================
// API Functions
// ============================================================

/**
 * Generate JWT token for API authentication
 */
export async function generateToken(
  userAddress: string
): Promise<TokenGenerateResponse> {
  const response = await fetch(`${KURU_FLOW_API}/api/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_address: userAddress }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate token: ${response.status}`);
  }

  return response.json();
}

/**
 * Get swap quote with optional referral fee
 */
export async function getQuote(
  params: QuoteParams,
  token: string
): Promise<QuoteResponse> {
  const response = await fetch(`${KURU_FLOW_API}/api/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limited. Please wait before making another request.");
    }
    throw new Error(`Quote request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get quote with referral fee included
 */
export async function getQuoteWithReferral(
  userAddress: string,
  tokenIn: string,
  tokenOut: string,
  amount: string,
  token: string,
  options?: { slippageTolerance?: number }
): Promise<QuoteResponse> {
  const params: QuoteParams = {
    userAddress,
    tokenIn,
    tokenOut,
    amount,
    ...(options?.slippageTolerance
      ? { slippageTolerance: options.slippageTolerance }
      : { autoSlippage: true }),
    referrerAddress: REFERRER_ADDRESS,
    referrerFeeBps: REFERRER_FEE_BPS,
  };

  return getQuote(params, token);
}
