"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getButtonClasses } from "@/components/ui/button-classes";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service here (scope out of current sprint but logging it)
    console.error("Global boundary caught an error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <AlertTriangle size={48} />
      </div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-text-primary">
        Quelque chose s&apos;est cassé.
      </h1>
      <p className="mb-8 max-w-md text-text-secondary">
        Nous sommes désolés, une erreur inattendue s&apos;est produite. L&apos;équipe a été notifiée.
      </p>

      {isDev && (
        <div className="mb-8 w-full max-w-2xl overflow-auto rounded-md bg-surface-elevated p-4 text-left text-sm text-red-500 shadow-sm border border-border-default">
          <p className="font-semibold mb-2">Error Details (Dev Only):</p>
          <pre>{error.message}</pre>
          {error.stack && <pre className="mt-2 text-xs opacity-80">{error.stack}</pre>}
        </div>
      )}

      <div className="flex gap-4 items-center">
        <Button onClick={() => reset()} variant="primary">
          Réessayer
        </Button>
        <Link 
          href="/" 
          className={getButtonClasses({ variant: "secondary" })}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
