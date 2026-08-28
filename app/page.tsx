import { UtensilsCrossed } from "lucide-react";

import { UlamGenerator } from "@/components/ulam-generator";
import { SiteFooter } from "@/components/site-footer";
import { KusinaStickers } from "@/components/kusina-stickers";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full bg-accent/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-28 top-24 -z-10 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[34rem] -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-leaf/15 blur-3xl"
        />
        <KusinaStickers />

        <div className="container flex flex-col items-center px-4 pb-10 pt-14 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-card/80 px-4 py-1.5 text-sm font-bold text-primary shadow-sm backdrop-blur">
            <UtensilsCrossed className="h-4 w-4" />
            Mula Palengke Hanggang Kaldero
          </span>

          {/* chalkboard / carinderia sign */}
          <div className="relative mt-6 rotate-[-1.2deg]">
            <div className="chalkboard px-8 py-6 sm:px-14 sm:py-8">
              <span className="mb-1 block font-display text-xs font-semibold uppercase tracking-[0.35em] text-gold/80">
                Ang tanong ng bayan
              </span>
              <h1 className="font-display text-5xl font-extrabold leading-none text-[#FDFBF7] drop-shadow-[0_2px_0_rgba(0,0,0,0.35)] sm:text-7xl">
                Anong Ulam?
              </h1>
            </div>
            {/* steaming ulam badge pinned to the board */}
            <div className="absolute -right-5 -top-6 rotate-12 rounded-2xl border-4 border-white/90 bg-primary px-3 py-2 text-3xl shadow-sticker">
              <span className="relative block">
                🍲
                <span className="absolute -top-3 left-1/2 h-3 w-[3px] -translate-x-1/2 rounded-full bg-white/70 animate-steam" />
                <span className="absolute -top-3 left-[35%] h-3 w-[3px] rounded-full bg-white/60 animate-steam [animation-delay:-1s]" />
              </span>
            </div>
          </div>

          <p className="mt-6 max-w-xl text-balance text-lg font-semibold text-foreground/80">
            Sabihin lang ang budget mo sa piso — bibigyan ka namin ng ulam na
            kaya ng bulsa, kasama na ang listahan ng sangkap at presyo.
          </p>
          <p className="mt-1 font-display text-lg font-bold text-primary">
            Kaya pa ba ng budget? Alamin natin. 👇
          </p>

          <div className="mt-10 w-full">
            <UlamGenerator />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
