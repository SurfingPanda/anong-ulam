-- Anong Ulam? — seed data
-- 10 popular Filipino dishes (₱80–₱500) with realistic wet market (palengke) prices.
-- Safe to re-run: it clears the two tables first.

begin;

truncate table public.ingredients restart identity cascade;
truncate table public.dishes restart identity cascade;

-- ---------------------------------------------------------------------------
-- dishes
-- ---------------------------------------------------------------------------
insert into public.dishes (id, name, category, est_total_cost, prep_time_mins, servings, instructions) values
  ('d0000000-0000-4000-8000-000000000001', 'Ginisang Monggo', 'Tipid', 97, 40, 4, array[
     'Pakuluan ang munggo sa 4 tasang tubig hanggang lumambot (~25 min).',
     'Sa kawali, igisa ang bawang, sibuyas, at kamatis. Idagdag ang baboy at lutuin hanggang mag-brown.',
     'Ibuhos ang niluto na munggo pati sabaw. Pakuluan ng 10 minuto.',
     'Timplahan ng patis at paminta. Idagdag ang malunggay bago patayin ang apoy.']),
  ('d0000000-0000-4000-8000-000000000002', 'Tortang Talong', 'Tipid', 84, 20, 3, array[
     'Ihawin o iprito ang talong hanggang lumambot ang laman, tapos balatan.',
     'Batihin ang itlog kasama ang tinadtad na sibuyas at bawang. Timplahan ng asin at paminta.',
     'Isawsaw ang bawat talong sa itlog, pipiin ng tinidor.',
     'Iprito sa mainit na mantika hanggang golden brown ang magkabilang gilid.']),
  ('d0000000-0000-4000-8000-000000000003', 'Ginisang Sayote', 'Gulay', 88, 20, 3, array[
     'Igisa ang bawang, sibuyas, at kamatis hanggang malambot.',
     'Idagdag ang giniling na baboy, lutuin hanggang mag-brown.',
     'Ilagay ang hiniwang sayote, haluin, at timplahan ng patis.',
     'Takpan ng 5–7 minuto hanggang maluto ang sayote. Haluin at ihain.']),
  ('d0000000-0000-4000-8000-000000000004', 'Ginataang Gulay', 'Gulay', 142, 35, 4, array[
     'Igisa ang luya, bawang, at sibuyas. Idagdag ang bagoong at hipon, iprito sandali.',
     'Ilagay ang kalabasa at kaunting tubig, pakuluan hanggang halos malambot.',
     'Ibuhos ang gata, hinaan ang apoy, at huwag munang haluin.',
     'Idagdag ang sitaw, lutuin ng 5 minuto pa hanggang kumapal ang sarsa.']),
  ('d0000000-0000-4000-8000-000000000005', 'Pork Adobo', 'Lutong Bahay', 188, 50, 4, array[
     'Imarinate ang baboy sa toyo at bawang ng 15–30 minuto.',
     'Iprito ang baboy hanggang bahagyang mag-brown.',
     'Ibuhos ang marinade, suka, laurel, paminta, at 1 tasang tubig.',
     'Pakuluan tapos hinaan; lutuin 35–40 minuto hanggang lumambot at kumapal ang sarsa.']),
  ('d0000000-0000-4000-8000-000000000006', 'Chicken Tinola', 'Lutong Bahay', 217, 45, 4, array[
     'Igisa ang luya, bawang, at sibuyas hanggang mabango.',
     'Idagdag ang manok, iprito hanggang mawala ang pink na kulay.',
     'Timplahan ng patis, ibuhos ang 4–5 tasang tubig, pakuluan ng 20 minuto.',
     'Ilagay ang sayote, lutuin hanggang malambot. Idagdag ang dahon ng sili bago ihain.']),
  ('d0000000-0000-4000-8000-000000000007', 'Pork Sinigang', 'Lutong Bahay', 279, 60, 5, array[
     'Pakuluan ang baboy sa 6–7 tasang tubig hanggang lumambot (~40 min). Alisin ang bula.',
     'Idagdag ang kamatis at sibuyas, tapos ang gabi at labanos.',
     'Ilagay ang sinigang mix at okra, pakuluan ng 5 minuto.',
     'Idagdag ang sitaw, talong, at siling haba. Panghuli ang kangkong bago ihain.']),
  ('d0000000-0000-4000-8000-000000000008', 'Chicken Afritada', 'Lutong Bahay', 320, 50, 5, array[
     'Iprito ang patatas at karot hanggang bahagyang golden, tabi muna.',
     'Igisa ang bawang at sibuyas, idagdag ang manok hanggang mag-brown.',
     'Ibuhos ang tomato sauce at 1 tasang tubig, lagyan ng laurel. Pakuluan tapos hinaan 20 min.',
     'Ibalik ang patatas at karot, idagdag ang bell pepper. Lutuin 5 minuto pa.']),
  ('d0000000-0000-4000-8000-000000000009', 'Kare-Kare', 'Lutong Bahay', 488, 90, 6, array[
     'Pakuluan ang pata hanggang malambot (~1 oras). Itabi ang sabaw.',
     'Igisa ang bawang at sibuyas, idagdag ang atsuete na tubig at peanut butter.',
     'Ibuhos ang sabaw at karne, palaputin gamit ang toasted rice.',
     'Idagdag ang gulay: puso ng saging, sitaw, talong, pechay. Ihain na may bagoong.']),
  ('d0000000-0000-4000-8000-000000000010', 'Embutido', 'Pang-Pasko', 462, 75, 8, array[
     'Paghaluin ang giniling na baboy, breadcrumbs, itlog na hilaw, at mga pampalasa.',
     'Idagdag ang tinadtad na karot, bell pepper, pasas, keso, at pickle relish.',
     'Ihain sa aluminum foil, ilagay ang hotdog sa gitna, tapos irolyo nang mahigpit.',
     'I-steam ng 45–60 minuto. Palamigin bago hiwain. Pwedeng i-fry bago ihain.'])
;

-- ---------------------------------------------------------------------------
-- dish photos
-- The app bundles real dish photos in /public/dishes (from Wikimedia Commons).
-- These root-relative paths resolve against the app origin, so a DB-backed
-- deploy shows the same images with no extra hosting. To use your own photos,
-- upload them to a PUBLIC Supabase Storage bucket (see supabase/storage-setup.md)
-- and swap these values for the full public URLs.
-- ---------------------------------------------------------------------------
update public.dishes set image_url =
  '/dishes/' || case name
       when 'Ginisang Monggo'   then 'ginisang-monggo.jpg'
       when 'Tortang Talong'    then 'tortang-talong.jpg'
       when 'Ginisang Sayote'   then 'ginisang-sayote.jpg'
       when 'Ginataang Gulay'   then 'ginataang-gulay.jpg'
       when 'Pork Adobo'        then 'pork-adobo.jpg'
       when 'Chicken Tinola'    then 'chicken-tinola.jpg'
       when 'Pork Sinigang'     then 'pork-sinigang.jpg'
       when 'Chicken Afritada'  then 'chicken-afritada.jpg'
       when 'Kare-Kare'         then 'kare-kare.jpg'
       when 'Embutido'          then 'embutido.jpg'
     end;

-- ---------------------------------------------------------------------------
-- ingredients
-- ---------------------------------------------------------------------------
insert into public.ingredients (dish_id, item_name, amount, unit, est_market_price_php) values
  -- Ginisang Monggo
  ('d0000000-0000-4000-8000-000000000001', 'Munggo (mung beans)', 250, 'g', 30),
  ('d0000000-0000-4000-8000-000000000001', 'Baboy (paksiw cut)', 100, 'g', 35),
  ('d0000000-0000-4000-8000-000000000001', 'Bawang', 3, 'cloves', 3),
  ('d0000000-0000-4000-8000-000000000001', 'Sibuyas', 1, 'pc', 8),
  ('d0000000-0000-4000-8000-000000000001', 'Kamatis', 1, 'pc', 6),
  ('d0000000-0000-4000-8000-000000000001', 'Dahon ng malunggay', 1, 'bunch', 10),
  ('d0000000-0000-4000-8000-000000000001', 'Patis', 2, 'tbsp', 3),
  ('d0000000-0000-4000-8000-000000000001', 'Mantika', 2, 'tbsp', 2),
  -- Tortang Talong
  ('d0000000-0000-4000-8000-000000000002', 'Talong', 3, 'pcs', 33),
  ('d0000000-0000-4000-8000-000000000002', 'Itlog', 3, 'pcs', 24),
  ('d0000000-0000-4000-8000-000000000002', 'Sibuyas', 1, 'pc', 8),
  ('d0000000-0000-4000-8000-000000000002', 'Bawang', 2, 'cloves', 3),
  ('d0000000-0000-4000-8000-000000000002', 'Asin at paminta', 1, 'pinch', 2),
  ('d0000000-0000-4000-8000-000000000002', 'Mantika', 0.25, 'cup', 14),
  -- Ginisang Sayote
  ('d0000000-0000-4000-8000-000000000003', 'Sayote', 2, 'pcs', 25),
  ('d0000000-0000-4000-8000-000000000003', 'Giniling na baboy', 100, 'g', 40),
  ('d0000000-0000-4000-8000-000000000003', 'Bawang', 3, 'cloves', 3),
  ('d0000000-0000-4000-8000-000000000003', 'Sibuyas', 1, 'pc', 8),
  ('d0000000-0000-4000-8000-000000000003', 'Kamatis', 1, 'pc', 6),
  ('d0000000-0000-4000-8000-000000000003', 'Patis', 2, 'tbsp', 3),
  ('d0000000-0000-4000-8000-000000000003', 'Mantika', 2, 'tbsp', 3),
  -- Ginataang Gulay
  ('d0000000-0000-4000-8000-000000000004', 'Kalabasa', 0.25, 'piece', 25),
  ('d0000000-0000-4000-8000-000000000004', 'Sitaw', 1, 'bunch', 15),
  ('d0000000-0000-4000-8000-000000000004', 'Gata (niyog)', 200, 'ml', 30),
  ('d0000000-0000-4000-8000-000000000004', 'Hipon', 100, 'g', 45),
  ('d0000000-0000-4000-8000-000000000004', 'Luya', 1, 'thumb', 5),
  ('d0000000-0000-4000-8000-000000000004', 'Bawang', 4, 'cloves', 4),
  ('d0000000-0000-4000-8000-000000000004', 'Sibuyas', 1, 'pc', 8),
  ('d0000000-0000-4000-8000-000000000004', 'Bagoong alamang', 2, 'tbsp', 6),
  ('d0000000-0000-4000-8000-000000000004', 'Mantika', 2, 'tbsp', 4),
  -- Pork Adobo
  ('d0000000-0000-4000-8000-000000000005', 'Liempo', 500, 'g', 150),
  ('d0000000-0000-4000-8000-000000000005', 'Toyo', 0.25, 'cup', 10),
  ('d0000000-0000-4000-8000-000000000005', 'Suka', 0.25, 'cup', 8),
  ('d0000000-0000-4000-8000-000000000005', 'Bawang', 1, 'head', 10),
  ('d0000000-0000-4000-8000-000000000005', 'Dahon ng laurel', 3, 'pcs', 3),
  ('d0000000-0000-4000-8000-000000000005', 'Paminta (buo)', 1, 'tsp', 3),
  ('d0000000-0000-4000-8000-000000000005', 'Mantika', 2, 'tbsp', 4),
  -- Chicken Tinola
  ('d0000000-0000-4000-8000-000000000006', 'Manok (hiwa)', 500, 'g', 160),
  ('d0000000-0000-4000-8000-000000000006', 'Sayote', 1, 'pc', 18),
  ('d0000000-0000-4000-8000-000000000006', 'Dahon ng sili', 1, 'bunch', 10),
  ('d0000000-0000-4000-8000-000000000006', 'Luya', 1, 'thumb', 8),
  ('d0000000-0000-4000-8000-000000000006', 'Bawang', 4, 'cloves', 5),
  ('d0000000-0000-4000-8000-000000000006', 'Sibuyas', 1, 'pc', 8),
  ('d0000000-0000-4000-8000-000000000006', 'Patis', 3, 'tbsp', 4),
  ('d0000000-0000-4000-8000-000000000006', 'Mantika', 2, 'tbsp', 4),
  -- Pork Sinigang
  ('d0000000-0000-4000-8000-000000000007', 'Baboy (buto-buto)', 500, 'g', 150),
  ('d0000000-0000-4000-8000-000000000007', 'Sinigang mix (sampalok)', 1, 'pack', 15),
  ('d0000000-0000-4000-8000-000000000007', 'Gabi', 2, 'pcs', 24),
  ('d0000000-0000-4000-8000-000000000007', 'Labanos', 1, 'pc', 15),
  ('d0000000-0000-4000-8000-000000000007', 'Sitaw', 1, 'bunch', 15),
  ('d0000000-0000-4000-8000-000000000007', 'Kangkong', 1, 'bunch', 12),
  ('d0000000-0000-4000-8000-000000000007', 'Kamatis', 2, 'pcs', 12),
  ('d0000000-0000-4000-8000-000000000007', 'Sibuyas', 1, 'pc', 8),
  ('d0000000-0000-4000-8000-000000000007', 'Siling haba', 2, 'pcs', 6),
  ('d0000000-0000-4000-8000-000000000007', 'Talong', 1, 'pc', 10),
  ('d0000000-0000-4000-8000-000000000007', 'Okra', 4, 'pcs', 12),
  -- Chicken Afritada
  ('d0000000-0000-4000-8000-000000000008', 'Manok (hiwa)', 750, 'g', 212),
  ('d0000000-0000-4000-8000-000000000008', 'Patatas', 2, 'pcs', 25),
  ('d0000000-0000-4000-8000-000000000008', 'Karot', 1, 'pc', 15),
  ('d0000000-0000-4000-8000-000000000008', 'Bell pepper', 1, 'pc', 25),
  ('d0000000-0000-4000-8000-000000000008', 'Tomato sauce', 200, 'g', 22),
  ('d0000000-0000-4000-8000-000000000008', 'Bawang', 4, 'cloves', 5),
  ('d0000000-0000-4000-8000-000000000008', 'Sibuyas', 1, 'pc', 8),
  ('d0000000-0000-4000-8000-000000000008', 'Dahon ng laurel', 2, 'pcs', 2),
  ('d0000000-0000-4000-8000-000000000008', 'Mantika', 3, 'tbsp', 6),
  -- Kare-Kare
  ('d0000000-0000-4000-8000-000000000009', 'Pata / buntot ng baka', 500, 'g', 300),
  ('d0000000-0000-4000-8000-000000000009', 'Peanut butter', 0.5, 'cup', 40),
  ('d0000000-0000-4000-8000-000000000009', 'Pechay', 1, 'bunch', 15),
  ('d0000000-0000-4000-8000-000000000009', 'Sitaw', 1, 'bunch', 15),
  ('d0000000-0000-4000-8000-000000000009', 'Talong', 2, 'pcs', 20),
  ('d0000000-0000-4000-8000-000000000009', 'Puso ng saging', 1, 'pc', 25),
  ('d0000000-0000-4000-8000-000000000009', 'Atsuete', 1, 'pack', 10),
  ('d0000000-0000-4000-8000-000000000009', 'Bawang', 1, 'head', 10),
  ('d0000000-0000-4000-8000-000000000009', 'Sibuyas', 1, 'pc', 8),
  ('d0000000-0000-4000-8000-000000000009', 'Toasted rice (giniling)', 0.25, 'cup', 10),
  ('d0000000-0000-4000-8000-000000000009', 'Bagoong alamang', 1, 'cup', 35),
  -- Embutido
  ('d0000000-0000-4000-8000-000000000010', 'Giniling na baboy', 500, 'g', 175),
  ('d0000000-0000-4000-8000-000000000010', 'Karot', 1, 'pc', 15),
  ('d0000000-0000-4000-8000-000000000010', 'Bell pepper', 1, 'pc', 25),
  ('d0000000-0000-4000-8000-000000000010', 'Pickle relish', 0.25, 'cup', 20),
  ('d0000000-0000-4000-8000-000000000010', 'Keso (quick melt)', 1, 'bar', 40),
  ('d0000000-0000-4000-8000-000000000010', 'Hotdog', 5, 'pcs', 60),
  ('d0000000-0000-4000-8000-000000000010', 'Itlog', 3, 'pcs', 24),
  ('d0000000-0000-4000-8000-000000000010', 'Pasas (raisins)', 0.25, 'cup', 25),
  ('d0000000-0000-4000-8000-000000000010', 'Breadcrumbs', 0.5, 'cup', 20),
  ('d0000000-0000-4000-8000-000000000010', 'Sibuyas', 1, 'pc', 8),
  ('d0000000-0000-4000-8000-000000000010', 'Bawang', 3, 'cloves', 3),
  ('d0000000-0000-4000-8000-000000000010', 'Tomato sauce', 100, 'g', 22),
  ('d0000000-0000-4000-8000-000000000010', 'Aluminum foil', 1, 'roll', 25)
;

-- ---------------------------------------------------------------------------
-- Tipid Swaps — cheaper stand-ins for the priciest ingredient of some dishes
-- ---------------------------------------------------------------------------
update public.ingredients set substitution_name = 'Tokwa (firm tofu)',        substitution_savings_php = 80
  where dish_id = 'd0000000-0000-4000-8000-000000000005' and item_name = 'Liempo';
update public.ingredients set substitution_name = 'Tokwa + dagdag na gulay',  substitution_savings_php = 90
  where dish_id = 'd0000000-0000-4000-8000-000000000007' and item_name = 'Baboy (buto-buto)';
update public.ingredients set substitution_name = 'Manok (leeg at pakpak)',   substitution_savings_php = 45
  where dish_id = 'd0000000-0000-4000-8000-000000000006' and item_name = 'Manok (hiwa)';
update public.ingredients set substitution_name = 'Manok (paa / drumstick)',  substitution_savings_php = 55
  where dish_id = 'd0000000-0000-4000-8000-000000000008' and item_name = 'Manok (hiwa)';
update public.ingredients set substitution_name = 'Puro gulay + tokwa',       substitution_savings_php = 170
  where dish_id = 'd0000000-0000-4000-8000-000000000009' and item_name = 'Pata / buntot ng baka';
update public.ingredients set substitution_name = 'Tokwa',                     substitution_savings_php = 25
  where dish_id = 'd0000000-0000-4000-8000-000000000004' and item_name = 'Hipon';
update public.ingredients set substitution_name = 'Giniling na manok',        substitution_savings_php = 35
  where dish_id = 'd0000000-0000-4000-8000-000000000010' and item_name = 'Giniling na baboy';

commit;
