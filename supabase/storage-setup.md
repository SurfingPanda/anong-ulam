# Supabase Storage — dish photos

The `dishes.image_url` column holds a public URL to a real photo of each dish.
The app renders it on the card and in the detail drawer, and falls back to a
warm gradient + emoji placeholder if the URL is missing or fails to load
(`components/dish-image.tsx`).

## 1. Create the bucket

Dashboard → **Storage** → **New bucket**

- Name: `dish-photos`
- **Public bucket: ON** (so `…/object/public/…` URLs work without a token)

Or via SQL:

```sql
insert into storage.buckets (id, name, public)
values ('dish-photos', 'dish-photos', true)
on conflict (id) do nothing;
```

## 2. Upload the photos

Upload one image per dish into the bucket root, named with the dish slug:

```
ginisang-monggo.jpg    tortang-talong.jpg     ginisang-sayote.jpg
ginataang-gulay.jpg    pork-adobo.jpg         chicken-tinola.jpg
pork-sinigang.jpg      chicken-afritada.jpg   kare-kare.jpg
embutido.jpg
```

Aim for landscape ~1200×800, < 300 KB (the card crops to a 3:2-ish box).
Use the `image_5.png` aesthetic — top-down, warm natural light, single plated
serving on a neutral surface.

## 3. Point the rows at the photos

`supabase/seed.sql` already contains an `update public.dishes set image_url = …`
block. Find-and-replace `REPLACE-WITH-PROJECT-REF` with your project ref
(the subdomain in your project URL, e.g. `abcd1234`) and run it, or run just
that statement in the SQL editor.

Public URL shape:

```
https://<project-ref>.supabase.co/storage/v1/object/public/dish-photos/<slug>.jpg
```

## 4. (optional) Next.js `next/image`

This project uses a plain `<img>` so no config is needed. If you switch to
`next/image`, add to `next.config.mjs`:

```js
images: {
  remotePatterns: [
    { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
  ],
},
```
