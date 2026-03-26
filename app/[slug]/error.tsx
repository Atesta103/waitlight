"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getButtonClasses } from "@/components/ui/button-classes";

export default function CheckoutCustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    console.error("Customer route boundary caught an error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900/40 dark:text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-text-primary">
        Oups, un problème est survenu
      </h2>
      <p className="mb-8 max-w-sm text-text-secondary">
        Nous n&apos;avons pas pu charger votre ticket. Une erreur réseau est peut-être survenue.
      </p>

      {isDev && (
        <div className="mb-8 w-full max-w-md overflow-auto rounded-md bg-surface-elevated border border-border-default p-4 text-left text-sm text-red-500 shadow-sm">
          <p className="font-semibold mb-2">Error Details:</p>
          <pre>{error.message}</pre>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button onClick={() => reset()} variant="primary" className="w-full">
          Réessayer
        </Button>
        <Link 
          href="/" 
          className={getButtonClasses({ variant: "secondary", className: "w-full" })}
        >
          Accueil
        </Link>
      </div>
    </div>
  );
}
