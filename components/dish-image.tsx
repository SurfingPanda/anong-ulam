"use client";

import * as React from "react";

import { categoryEmoji, cn } from "@/lib/utils";
import type { Dish } from "@/lib/mock-ulam-data";

interface DishImageProps {
  dish: Pick<Dish, "name" | "category" | "image_url">;
  className?: string;
  /** emoji size class for the fallback */
  emojiClassName?: string;
}

/**
 * Renders the dish's real photo (`image_url`, e.g. from Supabase Storage) and
 * falls back to a warm gradient + category emoji if the image is missing or
 * fails to load.
 */
export function DishImage({
  dish,
  className,
  emojiClassName = "text-6xl",
}: DishImageProps) {
  const [failed, setFailed] = React.useState(false);
  const showImage = dish.image_url && !failed;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-accent/80 via-primary/70 to-primary",
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dish.image_url as string}
          alt={dish.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className={emojiClassName} aria-hidden>
          {categoryEmoji(dish.category)}
        </span>
      )}
    </div>
  );
}
