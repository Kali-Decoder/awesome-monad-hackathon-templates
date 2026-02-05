import { SwapCard } from "@/components/SwapCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-dot-pattern">
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Kuru Flow</h1>
            <p className="text-muted-foreground">
              Swap any token on Monad
            </p>
          </div>

          <SwapCard />

          <p className="text-muted-foreground text-sm text-center">
            Powered by{" "}
            <a
              href="https://docs.kuru.io/kuru-flow/flow-overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline underline-offset-4"
            >
              Kuru Flow API
            </a>
            <span className="mx-2 text-muted-foreground/50">•</span>
            <a
              href="https://github.com/monad-developers/kuru-flow-example-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline underline-offset-4"
            >
              Project Code
            </a>
            <span className="mx-2 text-muted-foreground/50">•</span>
            <a
              href="https://docs.monad.xyz/guides/kuru-flow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline underline-offset-4"
            >
              Monad developer docs
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
