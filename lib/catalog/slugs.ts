type Slugged = { id: string; slug: string };

function compareId(a: Slugged, b: Slugged): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

function claim(used: Set<string>, base: string): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let n = 2;
  let candidate = `${base}-${n}`;
  while (used.has(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  used.add(candidate);
  return candidate;
}

/** Lowest id keeps the plain slug. Later collisions get `-2`, `-3`, and so on. */
export function assignUniqueSlugs<T extends Slugged>(items: readonly T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(item.slug) ?? [];
    group.push(item);
    groups.set(item.slug, group);
  }

  const used = new Set<string>();
  const slugById = new Map<string, string>();
  const bases = [...groups.keys()].sort();
  for (const base of bases) {
    const group = groups.get(base);
    const keeper = group?.slice().sort(compareId)[0];
    if (!keeper) continue;
    slugById.set(keeper.id, claim(used, base));
  }

  const rest = [...items]
    .filter((item) => !slugById.has(item.id))
    .sort(compareId);
  for (const item of rest) {
    slugById.set(item.id, claim(used, item.slug));
  }

  return items.map((item) => {
    const slug = slugById.get(item.id);
    if (!slug) throw new Error(`Missing slug for ${item.id}`);
    return { ...item, slug };
  });
}
