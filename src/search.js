// A tiny site-wide search. Every page already ships its content as json, so the
// index is built from the words the site actually uses: titles, categories,
// tags, studios, blurbs and descriptions. Nothing is hardcoded here.

const SOURCES = [
  { key: 'articles', url: '/assets/json%20data/featuredArticles.json', href: '#featured-articles', kind: 'Article' },
  { key: 'trailers', url: '/assets/json%20data/trailers.json', href: '#trailers', kind: 'Trailer' },
  { key: 'events', url: '/assets/json%20data/events.json', href: '#events', kind: 'Event' },
  { key: 'releases', url: '/assets/json%20data/upcomingReleases.json', href: '#upcoming-releases', kind: 'Release' },
];

const WORDS = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/)
  .filter((word) => word.length > 1);

const fromArticles = (source, list) => list.map((item) => ({
  id: `article:${item.slug || item.id}`,
  kind: source.kind,
  href: `#featured-articles/${item.category || 'all'}`,
  title: item.title,
  meta: [item.kicker, item.author, `${item.readTime || ''} read`].filter(Boolean).join(' · '),
  image: item.image,
  words: [...WORDS(item.title), ...WORDS(item.kicker), ...WORDS(item.excerpt), ...(item.tags || []).flatMap(WORDS), ...WORDS(item.category)],
}));

const fromTrailers = (source, list) => list.map((item) => ({
  id: `trailer:${item.id}`,
  kind: source.kind,
  href: source.href,
  title: item.title,
  meta: [item.category, item.status, item.runtime, item.studio].filter(Boolean).join(' · '),
  image: '',
  words: [...WORDS(item.title), ...WORDS(item.blurb), ...WORDS(item.category), ...WORDS(item.status), ...WORDS(item.studio), ...WORDS(item.badge)],
}));

const fromEvents = (source, list) => list.map((item) => ({
  id: `event:${item.id}`,
  kind: source.kind,
  href: source.href,
  title: item.title,
  meta: [item.venue, item.location, item.date].filter(Boolean).join(' · '),
  image: item.image,
  words: [...WORDS(item.title), ...WORDS(item.description), ...WORDS(item.category), ...WORDS(item.tag), ...WORDS(item.venue), ...WORDS(item.location), ...(item.highlights || []).flatMap(WORDS)],
}));

const fromReleases = (source, list) => list.map((item) => ({
  id: `release:${item.id}`,
  kind: source.kind,
  href: source.href,
  title: item.title,
  meta: [item.category, item.type, item.releaseDate].filter(Boolean).join(' · '),
  image: item.image,
  words: [
    ...WORDS(item.title),
    ...WORDS(item.description),
    ...WORDS(item.category),
    ...WORDS(item.type),
    ...WORDS(item.status),
    ...WORDS(item.franchise),
    ...WORDS(item.studio),
    ...WORDS(item.platform),
  ],
}));

const BUILDERS = { articles: fromArticles, trailers: fromTrailers, events: fromEvents, releases: fromReleases };

let pending = null;
let rows = null;

// Fetched once per session and shared by every page that mounts the search box.
export const loadSearchIndex = () => {
  if (rows) return Promise.resolve(rows);
  if (pending) return pending;

  pending = Promise.all(SOURCES.map((source) => fetch(source.url)
    .then((response) => (response.ok ? response.json() : null))
    .then((json) => {
      if (!json) return [];
      const list = json[source.key];
      return Array.isArray(list) ? (BUILDERS[source.key] || (() => []))(source, list) : [];
    })
    .catch(() => [])))
    .then((chunks) => {
      rows = chunks.flat();
      return rows;
    });

  return pending;
};

export const getSearchIndex = () => rows || [];

export const resetSearchIndex = () => { rows = null; pending = null; };

// Ranks exact title hits first, then word starts, then word matches, and finally
// the kind label, so typing "anime" still finds things even without the word.
export const searchSite = (query, limit = 7) => {
  const terms = WORDS(query);
  if (!terms.length) return [];

  return getSearchIndex()
    .map((row) => {
      const haystack = row.words.join(' ');
      const title = row.title.toLowerCase();
      let score = 0;

      terms.forEach((term) => {
        if (title === term) score += 60;
        else if (title.startsWith(term)) score += 34;
        else if (title.includes(term)) score += 20;
        if (row.words.some((word) => word === term)) score += 12;
        else if (row.words.some((word) => word.startsWith(term))) score += 7;
        else if (haystack.includes(term)) score += 3;
      });

      return { row, score };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.row.title.localeCompare(b.row.title))
    .slice(0, limit)
    .map((hit) => hit.row);
};

export const suggestTerms = (query, limit = 5) => {
  const term = WORDS(query)[0] || '';
  if (term.length < 2) return [];

  const seen = new Set();
  const out = [];
  getSearchIndex().forEach((row) => {
    row.words.forEach((word) => {
      if (out.length >= limit || seen.has(word)) return;
      if (!word.startsWith(term) || word === term) return;
      seen.add(word);
      out.push(word);
    });
  });
  return out;
};
