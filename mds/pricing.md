Add interactive recipe discovery, community pricing, and cooking mode features to the "Anong Ulam?" web app.

### Features to Implement

1. Craving & Mood Filters (`/components/ulam-filters.tsx`):
   - Add filter tags: 
     - 🌧️ "Tag-ulan Special" (Sinigang, Bulalo, Sopas)
     - ⚡ "Mabilis Lutuin" (< 20 mins)
     - 🥦 "Healthy / Gulay Day" (Pakbet, Chop Suey)
     - 🐟 "Lenten / Healthy Fish" (Prito, Paksiw)
   - Filter query response in real-time alongside the user budget.

2. Hands-Free Cooking Mode (`/components/cooking-mode-modal.tsx`):
   - Full-screen, step-by-step overlay for the active recipe.
   - Extra-large typography for easy reading from a distance while cooking.
   - Built-in multi-step timers (e.g., "Boil Pork for 25 mins" with Start/Pause controls).

3. Regional / Local Price Multipliers (`/lib/pricing-engine.ts`):
   - Add region selection (e.g., NCR / Manila, Provincial / Local Wet Market).
   - Apply location-based price multipliers to adjust ingredient cost estimates based on target locale.

4. Social Shareable "Tipid Breakdown Card":
   - Generate a downloadable/shareable image summary card of the chosen recipe:
     "Cooked Sinigang na Baboy for 4 people for only ₱240! #AnongUlam"
   - Include a one-click button to copy the recipe summary directly for messaging apps.

### Technical Deliverables
- Create UI components using Tailwind CSS and Lucide React icons.
- Add client-side timer management hooks for the Step-by-Step Cooking Mode.
- Integrate the dynamic region multiplier into existing backend actions.