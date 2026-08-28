"use server";

import { streamObject } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";

import { geminiUlamModel } from "@/lib/gemini";
import { aiUlamSchema, aiUlamPrompt, aiPartialToDish } from "@/lib/ai-ulam";
import type { Dish } from "@/lib/mock-ulam-data";

export interface StreamAiUlamInput {
  budgetPhp: number;
  region?: string;
  /** Dish names already on screen — the AI is told not to repeat them. */
  exclude?: string[];
}

/**
 * Streams AI-generated ulam suggestions in as they're produced. The client
 * reads the returned value with `readStreamableValue` and swaps each dish into
 * the grid the moment it's complete — no 15-second blank wait.
 */
export async function streamAiUlam({
  budgetPhp,
  exclude = [],
}: StreamAiUlamInput) {
  const stream = createStreamableValue<{ dishes: Dish[]; done: boolean }>({
    dishes: [],
    done: false,
  });

  (async () => {
    let latest: Dish[] = [];
    try {
      const { partialObjectStream } = streamObject({
        model: geminiUlamModel,
        schema: aiUlamSchema,
        prompt: aiUlamPrompt(Math.round(budgetPhp), exclude),
      });

      for await (const partial of partialObjectStream) {
        const dishes = (partial.dishes ?? [])
          .map((d, i) => aiPartialToDish(d, i))
          .filter((d): d is Dish => d !== null);
        if (dishes.length >= latest.length) {
          latest = dishes;
          stream.update({ dishes, done: false });
        }
      }
    } catch (err) {
      console.error("[stream-ulam-ai] Gemini stream failed:", err);
    }
    // final frame keeps whatever completed (empty => client keeps placeholders)
    stream.done({ dishes: latest, done: true });
  })();

  return { object: stream.value };
}
