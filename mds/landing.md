Build the initial landing page for a Filipino web application called "Anong Ulam?". The app helps users decide what dish to cook based on their specified budget in Philippine Pesos (PHP).

### Tech Stack Specifications
- Framework: Next.js (App Router, TypeScript)
- Styling: Tailwind CSS
- UI Components: shadcn/ui or Lucide React icons
- Database/Backend: Supabase (Integration setup only for now)
- Deployment Target: Vercel (Free Tier ready)

### Page Structure & Features
1. Hero Section:
   - App title: "Anong Ulam?" with a vibrant, food-inspired Filipino aesthetic (warm tones: yellow, orange, dark red/terracotta).
   - Catchy tagline: e.g., "Budget-friendly meal ideas for every Filipino home."
   - Budget Input Form:
     - Prominent numeric input field with standard PHP currency prefix (₱).
     - Preset quick-select buttons for popular budgets: ₱100, ₱200, ₱300, ₱500.
     - A clear "Hanap Ulam" (Search/Generate) call-to-action button.

2. Interactive Mock Preview / Demo Section:
   - Provide a client-side mock implementation so the page works immediately before Supabase data is fully wired up.
   - When a budget is submitted, display 2–3 recipe suggestions suitable for that price range (e.g., Ginisang Sayote, Pork Adobo, Sinigang na Bangus).
   - Each Ulam Card must show:
     - Dish Name & Thumbnail/Placeholder image
     - Estimated total cost in PHP
     - Preparation/Cooking time
     - Brief description

3. Dish Detail Drawer / Modal:
   - Clicking a suggested card opens a side drawer or modal displaying:
     - Complete breakdown of ingredients with estimated Philippine local market prices (e.g., "1/2 kg Pork Belly - ₱160", "1 pack Sinigang Mix - ₱15").
     - Simple step-by-step cooking instructions.

4. Footer:
   - Minimalist footer stating "Gawa para sa pamilyang Pilipino" and placeholder links for Privacy Policy and Terms.

### Technical Requirements
- Make the layout fully mobile-responsive and clean.
- Structure code cleanly using components (`/components/ui`, `/components/ulam-card.tsx`, `/components/budget-form.tsx`).
- Create a mock dataset (`/lib/mock-ulam-data.ts`) containing 5–6 typical Filipino dishes with itemized ingredient prices to fuel the initial UI preview.
- Set up a clean `.env.example` file configured for Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

Please write all files and commands required to set up and run this landing page locally.