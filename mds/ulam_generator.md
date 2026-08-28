Implement the complete core functionality for the "Anong Ulam?" budget-based dish generator. This feature will take a user's budget in PHP, calculate valid dish suggestions, and return detailed ingredient price breakdowns tailored to the Philippine local market.

### Tech Stack & Integrations
- Framework: Next.js App Router (Server Actions / API Routes)
- Database: Supabase (PostgreSQL)
- AI Model (Optional/Fallback): OpenAI API (`gpt-4o-mini`) via AI SDK for dynamic recipe generation when DB results are sparse.
- State Management: React Hooks (`useState`, `useTransition`) for smooth loading states.

### Feature Requirements

1. Supabase Database Schema & Migration Script:
   - Create a SQL migration file (`/supabase/migrations/01_create_ulam_tables.sql`) for two tables:
     - `dishes`: `id` (uuid), `name` (text), `category` (text: Lutong Bahay, Tipid, Pang-Pasko, etc.), `est_total_cost` (numeric), `prep_time_mins` (int), `servings` (int), `instructions` (text[]), `image_url` (text).
     - `ingredients`: `id` (uuid), `dish_id` (foreign key -> dishes.id), `item_name` (text), `amount` (numeric), `unit` (text), `est_market_price_php` (numeric).
   - Provide a seed script (`/supabase/seed.sql`) containing 10 popular Filipino dishes ranging from ₱80 to ₱500 (e.g., Ginisang Monggo, Tortang Talong, Chicken Afritada, Pork Sinigang) with realistic Wet Market (Palengke) ingredient prices.

2. Backend Logic (`/app/actions/generate-ulam.ts` or API route):
   - Query Supabase for dishes where `est_total_cost <= user_budget`.
   - Sort results logically (e.g., closest to budget without exceeding it, or ranked by popularity/value).
   - Include a fallback mechanism: If no dishes are found under the specified budget, fall back to an AI prompt (or a pre-configured low-cost default) that generates budget-friendly meal ideas using basic Filipino household staples.

3. Updated UI & User Experience (`/components/ulam-generator.tsx`):
   - Dynamic Loading State: Show a playful Filipino-themed loading skeleton/spinner (e.g., "Nagluluto ng suggestions...", "Sinusukat ang budget...").
   - Results View:
     - Grid layout displaying matching dishes with total estimated cost tag.
     - "Filter/Sort by" options (e.g., Cheapest First, Quickest to Cook).
   - Itemized Price Breakdown Modal/Drawer:
     - Render ingredients in a clean list with individual costs (e.g., "3 pcs Talong — ₱30", "2 eggs — ₱16").
     - Show a running comparison: Total Estimated Cost vs. User's Input Budget (highlighting how much savings remain).
     - Standard disclaimer: "Market prices may vary depending on local wet market (palengke) or supermarket rates."

4. Edge Cases to Handle:
   - Extremely low budgets (e.g., under ₱50): Gracefully suggest hyper-budget staples (e.g., Egg & Rice, Lugaw with Egg) with a friendly tip to stretch the budget.
   - Zero or negative inputs: Form validation error ("Please enter a valid budget in PHP").

Please write the required components, server actions, Supabase schema files, and update the main generator interface.