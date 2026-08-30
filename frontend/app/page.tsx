import NextLink from "next/link";
import { Button } from "@heroui/react";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold">DawgDecision</h1>

      <p className="mt-4 max-w-xl text-default-500">
        Compare housing options, understand financial tradeoffs, and build
        financial plans with confidence.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <NextLink href="/login">
          <Button variant="primary">Sign In</Button>
        </NextLink>

        <NextLink href="/dashboard">
          <Button variant="secondary">Dashboard</Button>
        </NextLink>
      </div>
    </div>
  );
}
