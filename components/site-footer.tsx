import { Heart } from "lucide-react";

import { PwaInstallButton } from "@/components/pwa-install-button";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t-2 border-primary/10 bg-card/70">
      <div className="container flex flex-col items-center gap-3 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="inline-flex items-center gap-1.5 font-display text-sm font-extrabold text-muted-foreground">
          <span className="text-lg">🍚</span>
          Gawa nang may pagmamahal para sa pamilyang Pilipino
          <Heart className="h-4 w-4 fill-primary text-primary" />
        </p>
        <div className="flex items-center gap-4">
          <PwaInstallButton />
          <nav className="flex items-center gap-5 font-display text-sm font-bold">
            <a
              href="#"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Terms
            </a>
          </nav>
        </div>
      </div>
      <div className="border-t-2 border-primary/10 py-3">
        <p className="container text-center text-xs font-semibold text-muted-foreground">
          © {new Date().getFullYear()} Anong Ulam? · Mula palengke hanggang
          kaldero.
        </p>
      </div>
    </footer>
  );
}
