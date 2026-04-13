"use client";

import { useState } from "react";

export default function Home() {
  const [greeting, setGreeting] = useState<string>("");
  const [loading, setLoading] = useState<"greeting" | "">("");

  const callGreeting = async () => {
    setLoading("greeting");
    setGreeting("");
    try {
      const response = await fetch("/api/greeting");
      const data = await response.json();
      setGreeting(JSON.stringify(data, null, 2));
    } catch (error) {
      setGreeting(
        JSON.stringify(
          { error: error instanceof Error ? error.message : "Unknown error" },
          null,
          2
        )
      );
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans text-zinc-900">
      <main className="w-full max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-400">
              MPPX Client Test
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Test the server routes from the frontend
            </h1>
            <p className="text-base text-zinc-600">
              Use the buttons below to call the server&apos;s{" "}
              <code className="rounded bg-zinc-100 px-2 py-1 text-sm text-zinc-800">
                /greeting
              </code>{" "}
              and{" "}
              <code className="rounded bg-zinc-100 px-2 py-1 text-sm text-zinc-800">
                /premium
              </code>{" "}
              routes.
            </p>
          </div>

          <div className="mt-8">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Greeting</h2>
                <button
                  onClick={callGreeting}
                  disabled={loading === "greeting"}
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {loading === "greeting" ? "Loading..." : "Call /greeting"}
                </button>
              </div>
              <pre className="mt-4 min-h-[120px] rounded-xl bg-white p-4 text-sm text-zinc-700 shadow-inner">
                {greeting || "No response yet."}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
