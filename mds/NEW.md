Add advanced budget optimization and meal-planning features to the "Anong Ulam?" web app, extending existing Supabase actions and UI components.

### Feature Enhancements to Build

1. Dynamic Servings & Price Scaling (`/components/ulam-card.tsx`):
   - Add a "Pamilya / Servings" multiplier control (Default: 4 pax).
   - When the user changes servings (e.g., from 4 to 2 or 6), recalculate ingredient quantities and price totals in real time.

2. Price Mode Selector (Palengke vs. Supermarket):
   - Add a global state/toggle: "Wet Market / Palengke" (default, lower price index) vs. "Supermarket" (+15% to +20% price adjustment multiplier).
   - Reflect this selection across all cost calculations and the ingredient breakdown modal.

3. Interactive Smart Palengke Checklist (`/components/palengke-checklist.tsx`):
   - Add a "Generate Palengke List" button for selected dish suggestions.
   - Categorize combined ingredients into market sections:
     - 🥩 Karnehan (Meat & Poultry)
     - 🐟 Isdaan (Seafood)
     - 🥦 Gulayan (Produce)
     - 🧂 Pampalasa at Sari-sari (Condiments & Spices)
   - Allow users to mark off items as bought and export/copy the list to clipboard for Messenger/SMS.

4. Smart Ingredient Substitutions ("Tipid Swaps"):
   - Update the ingredient model in Supabase/Schema to include optional `substitution_name` and `substitution_savings_php`.
   - In the Dish Details Modal, display a "Tipid Swap" callout if available (e.g., "Gusto mo mas tipid? Swap Pork Belly for Tokwa to save ₱80").
   - Clicking "Apply Swap" updates the recipe cost and ingredient list dynamically.

### Implementation Checklist
- Update state handlers in `/components/ulam-generator.tsx` to pass serving counts and pricing modes.
- Extend component specs for the Palengke Checklist component using shadcn/ui Checkboxes and Badges.
- Ensure all calculation updates execute client-side instantly without unnecessary network re-fetches.