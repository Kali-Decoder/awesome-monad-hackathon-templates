import { monad } from "@monad-crypto/mpp/client";
import { Mppx } from "mppx/client";
import { privateKeyToAccount } from "viem/accounts";
import { NextResponse } from "next/server";

const SERVER_URL = process.env.MPPX_SERVER_URL ?? "http://localhost:8080";

function createMppx() {
  const privateKey = process.env.CLIENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("CLIENT_PRIVATE_KEY is not set");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  return Mppx.create({
    methods: [monad({ account })],
    polyfill: false,
  });
}

export async function GET() {
  try {
    const mppx = createMppx();
    const response = await mppx.fetch(`${SERVER_URL}/greeting`);
    const contentType = response.headers.get("content-type") ?? "";
    let data: unknown;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : { message: "" };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
