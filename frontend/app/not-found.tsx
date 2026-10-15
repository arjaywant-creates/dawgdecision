import NextLink from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center py-16 px-4">
      <span className="text-sm font-semibold tracking-wider uppercase text-primary mb-2">
        404 Error
      </span>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
        Page Not Found
      </h1>

      <p className="mt-4 max-w-md text-default-500 text-sm sm:text-base leading-relaxed">
        Sorry, we couldn&apos;t find the page you were looking for. It might
        have been moved, deleted, or never existed.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <NextLink
          className="button button--primary flex items-center gap-2"
          href="/dashboard"
        >
          <Home className="size-4" />
          Go to Dashboard
        </NextLink>

        <NextLink
          className="button button--outline flex items-center gap-2 border-default-200"
          href="/compare"
        >
          <ArrowLeft className="size-4" />
          Compare Housing
        </NextLink>
      </div>
    </div>
  );
}
