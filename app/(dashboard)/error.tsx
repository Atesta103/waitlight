"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getButtonClasses } from "@/components/ui/button-classes";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service here
    console.error("Dashboard boundary caught an error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="flex h-full min-h-[500px] w-full flex-col items-center justify-center p-8 text-center rounded-xl bg-surface-elevated border border-border-default shadow-sm">
      <div className="mb-6 rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <AlertTriangle size={36} />
      </div>
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-text-primary">
        Erreur de chargement du tableau de bord.
      </h2>
      <p className="mb-8 max-w-md text-text-secondary">
        Le problème a été signalé, vous pouvez réessayer de charger cette section.
      </p>

      {isDev && (
        <div className="mb-8 w-full max-w-lg overflow-auto rounded-md bg-surface-default p-4 text-left text-sm text-red-500 border border-border-default">
          <p className="font-semibold mb-2">Error Details (Dev Only):</p>
          <pre>{error.message}</pre>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <Button onClick={() => reset()} variant="primary">
          Réessayer
        </Button>
        <Link 
          href="/dashboard"
          className={getButtonClasses({ variant: "secondary" })}
        >
          Rafraîchir
        </Link>
      </div>
    </div>
  );
}
