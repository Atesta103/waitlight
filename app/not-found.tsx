import Link from "next/link";
import { getButtonClasses } from "@/components/ui/button-classes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 h-24 w-24 rounded-full bg-brand-light/30 flex items-center justify-center text-brand-dark dark:bg-brand-dark/20 dark:text-brand-light">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </div>
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-text-primary">
        Page introuvable
      </h1>
      <p className="mb-8 max-w-md text-lg text-text-secondary">
        Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      
      <div className="flex justify-center">
        <Link 
          href="/" 
          className={getButtonClasses({ variant: "primary" })}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
