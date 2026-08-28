import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Accept the key under either common name so a mis-typed Vercel env var
 * (GOOGLE_GENERATIVE_API_KEY vs the SDK's GOOGLE_GENERATIVE_AI_API_KEY) still
 * works.
 */
export const geminiApiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_API_KEY ||
  "";

export const geminiConfigured = geminiApiKey.length > 0;

const google = createGoogleGenerativeAI({ apiKey: geminiApiKey });

/** The model used for AI ulam suggestions. */
export const geminiUlamModel = google("gemini-3.6-flash");
