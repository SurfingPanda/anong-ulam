/**
 * Dish-name normalization + fuzzy matching, shared by the app and (as an
 * equivalent SQL expression) the DB trigger in migration 03.
 */

/** "Kare-Kare" / "Ginisang  Monggo!" -> "kare kare" / "ginisang monggo". */
export function nameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function trigrams(s: string): Set<string> {
  const padded = ` ${s} `;
  const set = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) set.add(padded.slice(i, i + 3));
  return set;
}

/** Jaccard similarity over character trigrams — approximates Postgres pg_trgm. */
export function trigramSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

export const DUPLICATE_SIMILARITY_THRESHOLD = 0.45;

/**
 * True when `candidate` is effectively the same dish as one already in
 * `existingKeys` — exact key, containment ("ginisang munggo" vs "ginisang
 * munggo at baboy"), or high trigram similarity.
 */
export function isDuplicateName(
  candidate: string,
  existingKeys: Iterable<string>,
): boolean {
  const key = nameKey(candidate);
  if (!key) return true; // empty name -> reject
  for (const other of existingKeys) {
    if (key === other) return true;
    if (
      key.length >= 6 &&
      other.length >= 6 &&
      (key.includes(other) || other.includes(key))
    ) {
      return true;
    }
    if (trigramSimilarity(key, other) >= DUPLICATE_SIMILARITY_THRESHOLD) {
      return true;
    }
  }
  return false;
}
