Redesign the entire frontend UI of "Anong Ulam?" to make it vibrant, playful, and deeply rooted in Filipino food culture ("Carinderia" / "Fiesta" aesthetics) using Tailwind CSS.

### Design & Aesthetic Guidelines

1. Background & Pattern Atmosphere:
   - Replace the flat beige background with a rich, layered aesthetic.
   - Use a subtle, organic SVG background pattern inspired by Filipino heritage: traditional Banig weave, Solihiya lattice patterns, or playful line drawings of vegetables (talong, kamatis, bawang).
   - Add ambient ambient warm gradients (warm amber, terracotta red, and banana leaf green glows) in the background to create depth.

2. Typography & Brand Styling:
   - Typography: Use a bold, rounded, display font for headers (e.g., Fredoka, Sniglet, or Baloo 2 via Google Fonts) to give a friendly, playful feel.
   - Logo Title: Add a fun custom badge or chalk/hand-drawn board effect around "Anong Ulam?" with a bowl/kaldero icon or a steaming ulam badge.
   - Taglines: Use energetic Taglish accents (e.g., "Kaya pa ba ng budget?" / "Mula Palengke Hanggang Kaldero").

3. UI Color Palette:
   - Primary Accent: Terracotta Red / Fiery Clay (#C84B31)
   - Secondary Accent: Golden Calamansi / Warm Egg Yellow (#ECB365 & #F4D160)
   - Fresh Accent: Banana Leaf / Dahon Green (#3A7D44 or #4E9F3D for badge success states)
   - Background Tint: Warm Cream / Off-white (#FDFBF7)

4. Food Cards Redesign (`/components/ulam-card.tsx`):
   - Hero Image Container: 
     - Ditch the plain top banner with flat circles. Instead, use full-width, warm-shadowed image containers with rounded top corners.
     - Add dynamic price tags styled like retro price stickers or "Palengke Chalkboards" angled in the top right corner.
   - Micro-Interactions & Badges:
     - Replace flat category tags with colourful "Kusina Badges" (e.g., "Lutong Bahay" in warm orange, "Tipid Mode" in bright leaf green).
     - Add hover micro-animations (card gentle lift `hover:-translate-y-1.5`, soft glowing shadows, animated steam icons over hot meals).
   - Servings Selector: 
     - Make the pax stepper controls (+/-) look like tactile, pill-shaped tactile buttons instead of flat grey boxes.

5. Search & Filter Bar Enhancements:
   - Budget Bar: Style the primary "Hanap Ulam" input like a prominent search hub with a large currency badge (₱) and a high-contrast action button that pops (e.g., vibrant orange-red with warm drop shadow).
   - Quick Select Pills: Convert preset budget buttons (₱100, ₱200, etc.) into rounded, interactive pill chips with active-state pop effects.
   - Tag Filters: Style craving buttons ("Tag-ulan Special", "Mabilis Lutuin") with vibrant background tints and custom icons that glow when active.

6. Decorative Filipino Touches:
   - Floating playful sticker elements in margins or banner sides (e.g., mini illustrations of a Kaldero, Kawali, Bayong, or Siling Labuyo).

Please rewrite the layout, tailwind config, and primary UI components to match this refreshed, fun, high-energy Filipino theme.