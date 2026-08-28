Enhance the core "Anong Ulam?" generator to feature real dish photography and advanced interactive budgeting tools, ensuring data consistency with the Supabase schema defined in previous steps.

### High-Level Requirements

1. Real Image Integration via Supabase Storage:
   - Configure Supabase Storage buckets to host high-quality, real photos of Filipino dishes.
   - Update the `/supabase/seed.sql` script to include public URLs for these images within the `dishes.image_url` column. (You can use placeholders or reference the `image_5.png` aesthetic for the seed data).

2. New Advanced Pantry Check Feature (`/components/pantry-check.tsx`):
   - Add a "Pantry Check" expandable section. This allows users to select common Filipino household ingredients they already possess (e.g., Rice, Garlic, Onion, Cooking Oil, Soy Sauce, Vinegar).
   - This feature must interact dynamically with the pricing engine.

3. Updated Pricing Engine & Dynamic Breakdown:
   - Refactor the generator logic (`/app/actions/generate-ulam.ts`) to accept both the `budget_php` and an `excluded_ingredients` array.
   - New Calculation Logic:
     - The generator queries the DB as usual, but must render two costs on the dish card:
       1. "SRP (Palengke Price)" (Full price: `est_total_cost`).
       2. "Your Price" (Dynamic price: `est_total_cost` MINUS the `est_market_price_php` of all checked Pantry items).

4. Enhanced Dish Details Modal/Drawer:
   - The interactive ingredient list must now have checkboxes. If a user checks an item (e.g., they realized they have 'Luya'), the "Your Price" total at the bottom must update instantly.
   - Show the total saved amount clearly: "Nakatipid ka ng ₱45 mula sa iyong Pantry!"

### Detailed UI/UX Specifications

- Dish Card Updates:
  - Replace placeholders with the real image fetched via the `image_url` from Supabase.
  - Display the "Pantry Check" status on the card (e.g., a green badge saying "₱60 Saved from Pantry" if applicable).
- Pantry Check Interface:
  - Use shadcn/ui Checkboxes or modern switches. Group items logically (e.g., "Sahog/Recado", "Condiments/Bote", "Bigas/Grains").
- Dynamic Price Summary:
  - In the details modal, implement a clean comparison:
    ```
    Original Price:    ₱280.00
    Pantry Savings:  - ₱ 60.00 (Garlic, Oil, Soy Sauce)
    ========================
    Your Final Cost:   ₱220.00 (Pasok sa budget!)
    ```

### Technical Deliverables

- Update the SQL seed data script with image URLs and more comprehensive ingredient pricing.
- Rewrite the `generate-ulam` server action or API route to handle the pantry-check filtering/calculation.
- Provide the updated React components for the dynamic generator interface.