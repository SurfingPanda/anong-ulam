"use client";

import * as React from "react";
import {
  Sparkles,
  Database,
  Bot,
  Info,
  ArrowDownWideNarrow,
  Timer,
  Target,
  ClipboardList,
  RefreshCw,
} from "lucide-react";

import { BudgetForm } from "@/components/budget-form";
import { PantryCheck } from "@/components/pantry-check";
import { PriceModeToggle } from "@/components/price-mode-toggle";
import { RegionSelect } from "@/components/region-select";
import { UlamFilters } from "@/components/ulam-filters";
import { UlamCard } from "@/components/ulam-card";
import { UlamLoading } from "@/components/ulam-loading";
import { DishDetailDrawer } from "@/components/dish-detail-drawer";
import { CookingModeModal } from "@/components/cooking-mode-modal";
import { TipidShareCard } from "@/components/tipid-share-card";
import {
  PalengkeChecklist,
  type ChecklistEntry,
} from "@/components/palengke-checklist";
import { cn, formatPHP } from "@/lib/utils";
import {
  priceDish,
  regionMultiplier,
  type PriceMode,
  type PricedDish,
  type RegionId,
} from "@/lib/pricing-engine";
import { filterDishes, type FilterId } from "@/lib/ulam-filters";
import type { ShareCardInput } from "@/lib/share-card";
import {
  generateUlam,
  type GenerateUlamResult,
} from "@/app/actions/generate-ulam";
import { streamAiUlam } from "@/app/actions/stream-ulam-ai";
import { saveAiDishes } from "@/app/actions/save-ai-dishes";
import { readStreamableValue } from "@ai-sdk/rsc";
import { MOCK_DISHES, type Dish } from "@/lib/mock-ulam-data";

/** Client-side fallback used when the server action can't be reached (offline). */
function offlineGenerateUlam(
  budget: number,
  region: RegionId,
): GenerateUlamResult {
  const rounded = Math.round(budget);
  const eff = Math.round(rounded / regionMultiplier(region));
  const ranked = [...MOCK_DISHES]
    .filter((d) => d.est_total_cost <= eff)
    .sort(
      (a, b) =>
        b.est_total_cost - a.est_total_cost ||
        a.prep_time_mins - b.prep_time_mins,
    )
    .slice(0, 6);
  const dishes =
    ranked.length >= 2
      ? ranked
      : [...MOCK_DISHES]
          .sort((a, b) => a.est_total_cost - b.est_total_cost)
          .slice(0, 3);
  return {
    ok: true,
    budget: rounded,
    region,
    source: "mock",
    streaming: false,
    excludeNames: [],
    note: "Offline ka ngayon — ito ang mga ulam mula sa naka-save na listahan.",
    dishes,
  };
}

type SortKey = "sulit" | "cheapest" | "quickest";

const SORTS: { key: SortKey; label: string; icon: typeof Target }[] = [
  { key: "sulit", label: "Sulit (dulot ng budget)", icon: Target },
  { key: "cheapest", label: "Cheapest First", icon: ArrowDownWideNarrow },
  { key: "quickest", label: "Quickest to Cook", icon: Timer },
];

const SOURCE_LABEL: Record<GenerateUlamResult["source"], string> = {
  database: "Mula sa Supabase database",
  mock: "Mula sa built-in na dataset",
  ai: "Binuo ng AI",
  staples: "Hyper-budget staples",
};

export function UlamGenerator() {
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<GenerateUlamResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [sortKey, setSortKey] = React.useState<SortKey>("sulit");
  const [filters, setFilters] = React.useState<FilterId[]>([]);

  const [pantry, setPantry] = React.useState<string[]>([]);
  const [priceMode, setPriceMode] = React.useState<PriceMode>("palengke");
  const [region, setRegion] = React.useState<RegionId>("ncr");
  const [lastBudget, setLastBudget] = React.useState<number | null>(null);
  // Every dish name shown so far for the current budget/region — sent back on
  // "Ibang ulam naman" so each refresh returns a different set.
  const [seenNames, setSeenNames] = React.useState<string[]>([]);
  const [servingsByDish, setServingsByDish] = React.useState<
    Record<string, number>
  >({});
  const [swapsByDish, setSwapsByDish] = React.useState<Record<string, number[]>>(
    {},
  );
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const [selected, setSelected] = React.useState<Dish | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [checklistOpen, setChecklistOpen] = React.useState(false);
  const [cookingDish, setCookingDish] = React.useState<Dish | null>(null);
  const [shareData, setShareData] = React.useState<ShareCardInput | null>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // AI streaming — extra dishes generated on top of the instant dataset results.
  const [aiStreamDishes, setAiStreamDishes] = React.useState<Dish[]>([]);
  const [aiStreaming, setAiStreaming] = React.useState(false);
  const streamRunRef = React.useRef(0);

  // Grid = instant dataset dishes + any AI dishes streamed in (deduped by name).
  const activeDishes = React.useMemo<Dish[]>(() => {
    if (!result) return [];
    if (aiStreamDishes.length === 0) return result.dishes;
    const seen = new Set(result.dishes.map((d) => d.name.toLowerCase()));
    const extra = aiStreamDishes.filter((d) => !seen.has(d.name.toLowerCase()));
    return [...result.dishes, ...extra];
  }, [result, aiStreamDishes]);

  const aiExtraCount = React.useMemo(() => {
    if (!result || aiStreamDishes.length === 0) return 0;
    const seen = new Set(result.dishes.map((d) => d.name.toLowerCase()));
    return aiStreamDishes.filter((d) => !seen.has(d.name.toLowerCase())).length;
  }, [result, aiStreamDishes]);

  const servingsFor = React.useCallback(
    (dish: Dish) => servingsByDish[dish.id] ?? dish.servings,
    [servingsByDish],
  );
  const swapsFor = React.useCallback(
    (id: string) => swapsByDish[id] ?? [],
    [swapsByDish],
  );

  // One priced view per dish — recomputed instantly on any control change.
  const pricedMap = React.useMemo(() => {
    const map = new Map<string, PricedDish>();
    for (const dish of activeDishes) {
      map.set(
        dish.id,
        priceDish(dish, {
          servings: servingsByDish[dish.id] ?? dish.servings,
          priceMode,
          region,
          pantryKeywords: pantry,
          appliedSwaps: swapsByDish[dish.id] ?? [],
        }),
      );
    }
    return map;
  }, [activeDishes, priceMode, region, pantry, servingsByDish, swapsByDish]);

  const visibleDishes = React.useMemo(() => {
    if (!result) return [];
    const filtered = filterDishes(activeDishes, filters);
    const dishes = [...filtered];
    switch (sortKey) {
      case "cheapest":
        return dishes.sort(
          (a, b) =>
            (pricedMap.get(a.id)?.yourPrice ?? a.est_total_cost) -
            (pricedMap.get(b.id)?.yourPrice ?? b.est_total_cost),
        );
      case "quickest":
        return dishes.sort((a, b) => a.prep_time_mins - b.prep_time_mins);
      case "sulit":
      default:
        return dishes.sort(
          (a, b) =>
            (pricedMap.get(b.id)?.srpTotal ?? b.est_total_cost) -
              (pricedMap.get(a.id)?.srpTotal ?? a.est_total_cost) ||
            a.prep_time_mins - b.prep_time_mins,
        );
    }
  }, [result, activeDishes, filters, sortKey, pricedMap]);

  const checklistEntries = React.useMemo<ChecklistEntry[]>(() => {
    if (!result) return [];
    return selectedIds
      .map((id) => {
        const dish = activeDishes.find((d) => d.id === id);
        const priced = pricedMap.get(id);
        if (!dish || !priced) return null;
        return { dish, priced, servings: servingsFor(dish) };
      })
      .filter((e): e is ChecklistEntry => e !== null);
  }, [result, activeDishes, selectedIds, pricedMap, servingsFor]);

  const runSearch = React.useCallback(
    (
      budget: number,
      reg: RegionId,
      freshDishSet: boolean,
      exclude: string[] = [],
    ) => {
      setError(null);
      if (freshDishSet) {
        setServingsByDish({});
        setSwapsByDish({});
        setSelectedIds([]);
        setSortKey("sulit");
      }
      // supersede any in-flight AI stream
      const runId = ++streamRunRef.current;
      setAiStreamDishes([]);
      setAiStreaming(false);

      startTransition(async () => {
        let res: GenerateUlamResult;
        try {
          res = await generateUlam({ budgetPhp: budget, region: reg, exclude });
        } catch {
          // server action unreachable (offline) -> local dataset fallback
          res = offlineGenerateUlam(budget, reg);
        }
        if (!res.ok) {
          setResult(null);
          setError(res.error ?? "May nangyaring mali. Subukan muli.");
          return;
        }
        setResult(res);
        // Remember what we just showed so the next refresh skips it.
        if (res.dishes.length > 0) {
          setSeenNames((prev) => [
            ...new Set([...prev, ...res.dishes.map((d) => d.name)]),
          ]);
        }
        if (freshDishSet) {
          requestAnimationFrame(() => {
            resultsRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
        }

        if (res.streaming) {
          setAiStreaming(true);
          void (async () => {
            let finalDishes: Dish[] = [];
            try {
              const { object } = await streamAiUlam({
                budgetPhp: res.budget,
                region: reg,
                exclude: res.excludeNames,
              });
              for await (const chunk of readStreamableValue(object)) {
                if (streamRunRef.current !== runId) return; // newer search won
                if (!chunk) continue;
                if (chunk.dishes.length > 0) {
                  setAiStreamDishes(chunk.dishes);
                  finalDishes = chunk.dishes;
                }
                if (chunk.done) setAiStreaming(false);
              }
            } catch {
              // keep the placeholder low-cost dishes
            } finally {
              if (streamRunRef.current === runId) setAiStreaming(false);
            }
            // persist the new dishes into the catalog (no-op if not configured)
            if (streamRunRef.current === runId && finalDishes.length > 0) {
              setSeenNames((prev) => [
                ...new Set([...prev, ...finalDishes.map((d) => d.name)]),
              ]);
              void saveAiDishes(finalDishes).catch(() => {});
            }
          })();
        }
      });
    },
    [],
  );

  function handleSearch(budget: number) {
    setLastBudget(budget);
    setSeenNames([]);
    runSearch(budget, region, true);
  }

  function handleRegionChange(next: RegionId) {
    setRegion(next);
    // Region changes the affordable set -> re-query from scratch.
    if (lastBudget !== null) {
      setSeenNames([]);
      runSearch(lastBudget, next, false);
    }
  }

  // "Ibang ulam naman" — same budget, a different set of dishes.
  function handleRefresh() {
    if (lastBudget === null || isPending) return;
    runSearch(lastBudget, region, true, seenNames);
  }

  function handleResetSeen() {
    if (lastBudget === null) return;
    setSeenNames([]);
    runSearch(lastBudget, region, true, []);
  }

  function handleServingsChange(id: string, next: number) {
    setServingsByDish((prev) => ({ ...prev, [id]: next }));
  }

  function handleToggleSwap(id: string, index: number) {
    setSwapsByDish((prev) => {
      const cur = prev[id] ?? [];
      return {
        ...prev,
        [id]: cur.includes(index)
          ? cur.filter((i) => i !== index)
          : [...cur, index],
      };
    });
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleOpen(dish: Dish) {
    setSelected(dish);
    setDrawerOpen(true);
  }

  // PWA shortcut / deep link: /?b=300 auto-runs that budget on first load.
  React.useEffect(() => {
    const b = Number(new URLSearchParams(window.location.search).get("b"));
    if (Number.isFinite(b) && b > 0) handleSearch(Math.round(b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const SourceIcon =
    result?.source === "database"
      ? Database
      : result?.source === "ai"
        ? Bot
        : result?.source === "staples"
          ? Sparkles
          : Info;

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <BudgetForm onSearch={handleSearch} pending={isPending} />
      </div>

      <PantryCheck selected={pantry} onChange={setPantry} />

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <PriceModeToggle value={priceMode} onChange={setPriceMode} />
        <RegionSelect
          value={region}
          onChange={handleRegionChange}
          disabled={isPending}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mx-auto mt-6 max-w-xl rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm font-bold text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div ref={resultsRef} className="scroll-mt-8">
        {isPending && !result ? (
          <UlamLoading />
        ) : result ? (
          <section className="mx-auto mt-12 max-w-5xl" aria-live="polite">
            <div className="mb-4 text-center">
              <h2 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                {result.exhausted ? (
                  <>Wala nang bagong ulam</>
                ) : result.source === "staples" ? (
                  <>Mga staples para sa {formatPHP(result.budget)}</>
                ) : (
                  <>
                    {visibleDishes.length} ulam para sa{" "}
                    <span className="text-primary">
                      {formatPHP(result.budget)}
                    </span>
                  </>
                )}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <SourceIcon className="h-3.5 w-3.5" />
                {SOURCE_LABEL[result.source]}
                {aiStreaming ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    nagluluto ang AI…
                  </span>
                ) : null}
              </p>
            </div>

            {result.note ? (
              <p className="mx-auto mb-6 max-w-2xl rounded-xl border-2 border-accent/40 bg-accent/10 px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground">
                {aiStreaming
                  ? result.note
                  : result.streaming && aiExtraCount > 0
                    ? `Kasama na ang ${aiExtraCount} dagdag na ideya ng AI! ✨`
                    : result.note}
              </p>
            ) : null}

            {!result.exhausted ? (
              <div className="mb-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-card px-5 py-2.5 font-display text-sm font-extrabold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isPending && "animate-spin")}
                  />
                  {isPending ? "Naghahanap…" : "Ibang ulam naman"}
                </button>
              </div>
            ) : null}

            {!result.exhausted ? (
              <>
                <div className="mb-4">
                  <UlamFilters active={filters} onChange={setFilters} />
                </div>

                <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                  <span className="font-display text-sm font-bold text-muted-foreground">
                    Ayusin ayon sa:
                  </span>
                  {SORTS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSortKey(key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-display text-sm font-extrabold transition-all",
                        sortKey === key
                          ? "-translate-y-0.5 border-primary bg-primary text-primary-foreground shadow-pop-sm"
                          : "border-primary/20 bg-card text-foreground hover:border-primary/50",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {selectedIds.length > 0 ? (
              <div className="mb-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setChecklistOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-2.5 font-display text-sm font-extrabold text-leaf-foreground shadow-pop transition-transform hover:brightness-105 active:translate-y-1 active:shadow-pop-sm"
                >
                  <ClipboardList className="h-4 w-4" />
                  Gawin ang Palengke List ({selectedIds.length})
                </button>
              </div>
            ) : null}

            {result.exhausted ? (
              <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/25 bg-card/60 p-8 text-center">
                <span className="text-4xl">🍽️</span>
                <p className="text-sm font-semibold text-muted-foreground">
                  {result.note}
                </p>
                <button
                  type="button"
                  onClick={handleResetSeen}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-display text-sm font-extrabold text-primary-foreground shadow-pop transition-transform hover:brightness-105 active:translate-y-1 active:shadow-pop-sm disabled:opacity-60"
                >
                  <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                  Magsimula ulit
                </button>
              </div>
            ) : visibleDishes.length === 0 && !aiStreaming ? (
              <p className="mx-auto max-w-md rounded-2xl border-2 border-dashed border-primary/25 bg-card/60 p-6 text-center text-sm font-semibold text-muted-foreground">
                {filters.length > 0
                  ? "Walang ulam na tumutugma sa mga napiling filter. Subukang bawasan ang filter."
                  : "Wala nang matutugmang ulam. Pindutin ang “Ibang ulam naman” o baguhin ang budget."}
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleDishes.map((dish) => {
                  const priced = pricedMap.get(dish.id);
                  if (!priced) return null;
                  return (
                    <UlamCard
                      key={dish.id}
                      dish={dish}
                      priced={priced}
                      budget={result.budget}
                      servings={servingsFor(dish)}
                      onServingsChange={(n) => handleServingsChange(dish.id, n)}
                      isSelected={selectedIds.includes(dish.id)}
                      onToggleSelect={() => handleToggleSelect(dish.id)}
                      onOpen={() => handleOpen(dish)}
                    />
                  );
                })}
                {aiStreaming &&
                  filters.length === 0 &&
                  Array.from({
                    length: Math.max(0, 3 - aiExtraCount),
                  }).map((_, i) => (
                    <div
                      key={`ai-skel-${i}`}
                      className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-primary/10 bg-card shadow-card"
                    >
                      <div className="h-40 animate-pulse bg-gradient-to-br from-accent/40 via-muted to-secondary" />
                      <div className="space-y-3 p-4">
                        <div className="h-5 w-2/3 animate-pulse rounded-full bg-muted" />
                        <div className="h-8 w-40 animate-pulse rounded-full bg-muted" />
                        <div className="h-14 w-full animate-pulse rounded-xl bg-muted" />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        ) : (
          <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/25 bg-card/60 p-8 text-center">
            <span className="text-4xl">🍲</span>
            <p className="text-sm font-semibold text-muted-foreground">
              Ilagay ang iyong budget sa itaas at pindutin ang{" "}
              <span className="font-display font-extrabold text-primary">
                &ldquo;Hanap Ulam!&rdquo;
              </span>{" "}
              para makita ang mga ulam na kaya ng bulsa.
            </p>
          </div>
        )}
      </div>

      <DishDetailDrawer
        dish={selected}
        budget={result?.budget ?? 0}
        servings={selected ? servingsFor(selected) : 4}
        onServingsChange={(n) =>
          selected ? handleServingsChange(selected.id, n) : undefined
        }
        priceMode={priceMode}
        region={region}
        pantryKeywords={pantry}
        appliedSwaps={selected ? swapsFor(selected.id) : []}
        onToggleSwap={(i) =>
          selected ? handleToggleSwap(selected.id, i) : undefined
        }
        onStartCooking={() => selected && setCookingDish(selected)}
        onShare={(priced) =>
          selected &&
          setShareData({
            dish: selected,
            priced,
            servings: servingsFor(selected),
          })
        }
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      <PalengkeChecklist
        entries={checklistEntries}
        open={checklistOpen}
        onOpenChange={setChecklistOpen}
      />

      <CookingModeModal
        dish={cookingDish}
        open={cookingDish !== null}
        onOpenChange={(o) => !o && setCookingDish(null)}
      />

      <TipidShareCard
        data={shareData}
        open={shareData !== null}
        onOpenChange={(o) => !o && setShareData(null)}
      />
    </div>
  );
}
