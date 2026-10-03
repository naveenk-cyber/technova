import config from '../config';
import prisma from '../config/prisma';

// ---------------------------------------------------------------------------
// TECHNOVA AI Tech Advisor
// ---------------------------------------------------------------------------
// Pipeline: parse the customer message → fetch matching products from the
// database → hand only those products to Gemini → validate that every
// recommendation points at a real catalog product → return the structured
// result. If Gemini is not configured or fails, a deterministic catalog
// ranking is returned instead (clearly labelled as such by the client).
// ---------------------------------------------------------------------------

const MAX_CANDIDATES = 12;
const BUDGET_TOLERANCE = 1.1;
const DESCRIPTION_LIMIT = 260;

export interface AdvisorHistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AdvisorHints {
  budget: number | null;
  categorySlug: string | null;
  categoryLabel: string | null;
  requirements: string[];
}

export interface AdvisorProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  discount: number;
  stock: number;
  rating: number;
  reviewCount: number;
  image: string | null;
  category: { name: string; slug: string } | null;
}

export interface AdvisorRecommendation {
  product: AdvisorProduct;
  reason: string;
  pros: string[];
  cons: string[];
}

export interface AdvisorComparison {
  products: AdvisorProduct[];
  rows: { attribute: string; values: string[] }[];
}

export interface AdvisorAdvice {
  reply: string;
  recommendations: AdvisorRecommendation[];
  comparison: AdvisorComparison | null;
  followUpQuestions: string[];
}

export interface AdvisorResult extends AdvisorAdvice {
  provider: 'gemini' | 'local';
  model: string | null;
  candidateCount: number;
  criteria: { budget: number | null; category: string | null; requirements: string[] };
  notice?: string;
}

// ------------------------------- Hint parsing -------------------------------

export const parseBudget = (text: string): number | null => {
  const patterns: RegExp[] = [
    /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(k|lakh|lakhs|lac|lacs)?/i,
    /\b([\d,]+(?:\.\d+)?)\s*(k|lakh|lakhs|lac|lacs)\b/i,
    /\b(?:under|below|within|max(?:imum)?|upto|up to)\s+(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i,
    /\bbudget\s+(?:of\s+)?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const value = parseFloat(match[1].replace(/,/g, ''));
    if (!Number.isFinite(value) || value <= 0) continue;

    const unit = (match[2] || '').toLowerCase();
    const multiplier = unit.startsWith('k') ? 1000 : unit.startsWith('lakh') || unit.startsWith('lac') ? 100000 : 1;
    return Math.round(value * multiplier);
  }

  return null;
};

const CATEGORY_HINTS: { slug: string; label: string; pattern: RegExp }[] = [
  { slug: 'laptops', label: 'laptops', pattern: /\b(laptop|notebook|macbook|ultrabook|chromebook)s?\b/i },
  { slug: 'smartphones', label: 'smartphones', pattern: /\b(phone|phones|smartphone|smartphones|mobile|mobiles|iphone|iphones)\b/i },
  {
    slug: 'accessories',
    label: 'accessories',
    pattern: /\b(headphone|headphones|earphone|earphones|earbud|earbuds|speaker|speakers|accessor(?:y|ies)|watches|watch|charger|chargers)\b/i,
  },
];

export const detectCategory = (text: string): { slug: string; label: string } | null => {
  for (const hint of CATEGORY_HINTS) {
    if (hint.pattern.test(text)) return { slug: hint.slug, label: hint.label };
  }
  return null;
};

const USE_CASE_KEYWORDS = [
  'gaming', 'programming', 'coding', 'development', 'developer', 'java', 'python', 'android studio',
  'photography', 'camera', 'battery', 'travel', 'student', 'college', 'office', 'work', 'editing',
  'video', 'music', 'streaming', 'lightweight', 'portable',
];

const REQUIREMENT_PATTERNS: { pattern: RegExp; label: (match: RegExpMatchArray) => string }[] = [
  { pattern: /\b(\d{1,3})\s*gb\s*(?:of\s*)?(?:ram|memory)\b/i, label: (m) => `${m[1]}GB RAM` },
  { pattern: /\bram[:\s]+(\d{1,3})\s*gb\b/i, label: (m) => `${m[1]}GB RAM` },
  { pattern: /\b(\d{3,4})\s*gb\s*(?:ssd|storage)\b/i, label: (m) => `${m[1]}GB storage` },
  { pattern: /\b(\d{1,2})\s*tb\b/i, label: (m) => `${m[1]}TB storage` },
];

export const extractRequirements = (text: string): string[] => {
  const requirements: string[] = [];

  for (const { pattern, label } of REQUIREMENT_PATTERNS) {
    const match = text.match(pattern);
    if (match && !requirements.includes(label(match))) requirements.push(label(match));
  }

  const lower = text.toLowerCase();
  for (const keyword of USE_CASE_KEYWORDS) {
    if (lower.includes(keyword) && !requirements.includes(keyword)) requirements.push(keyword);
  }

  return requirements.slice(0, 8);
};

export const isComparisonRequest = (message: string): boolean =>
  /\b(compare|compares|comparison|compared|versus|vs\.?|differences?|differ)\b/i.test(message);

export const extractHints = (text: string): AdvisorHints => {
  const category = detectCategory(text);
  return {
    budget: parseBudget(text),
    categorySlug: category?.slug ?? null,
    categoryLabel: category?.label ?? null,
    requirements: extractRequirements(text),
  };
};

// ----------------------------- Product retrieval ----------------------------

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' }, take: 1 },
  specs: true,
};

const num = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const specsToRecord = (product: any): Record<string, string> => {
  const specs = product?.specifications ?? product?.specs ?? [];
  if (Array.isArray(specs)) {
    return Object.fromEntries(specs.map((spec: any) => [String(spec.key), String(spec.value)]));
  }
  return specs && typeof specs === 'object' ? specs : {};
};

export const toAdvisorProduct = (product: any): AdvisorProduct => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  brand: product.brand,
  price: num(product.price),
  discount: num(product.discount),
  stock: num(product.stock),
  rating: num(product.rating),
  reviewCount: num(product.reviewCount),
  image: product.images?.[0]?.url ?? product.image ?? null,
  category: product.category ? { name: product.category.name, slug: product.category.slug } : null,
});

export const findCandidateProducts = async (
  hints: AdvisorHints
): Promise<{ products: AdvisorProduct[]; raw: any[]; overBudget: boolean }> => {
  const categoryWhere: any = {};
  if (hints.categorySlug) categoryWhere.category = { slug: hints.categorySlug };

  const budgetWhere: any = {};
  if (hints.budget) budgetWhere.price = { lte: Math.round(hints.budget * BUDGET_TOLERANCE) };

  let raw = await prisma.product.findMany({
    where: { ...categoryWhere, ...budgetWhere },
    include: productInclude,
    orderBy: { rating: 'desc' },
    take: MAX_CANDIDATES,
  });
  let overBudget = false;

  // Nothing within budget: show the cheapest options in the requested category
  // so the advisor can explain the trade-off instead of inventing products.
  if (raw.length === 0 && hints.budget) {
    overBudget = true;
    raw = await prisma.product.findMany({
      where: categoryWhere,
      include: productInclude,
      orderBy: { price: 'asc' },
      take: 3,
    });
  }

  // Unknown/empty category: fall back to the whole catalog.
  if (raw.length === 0 && hints.categorySlug) {
    raw = await prisma.product.findMany({
      where: budgetWhere,
      include: productInclude,
      orderBy: { rating: 'desc' },
      take: MAX_CANDIDATES,
    });
  }

  return { products: raw.map(toAdvisorProduct), raw, overBudget };
};

// --------------------------- Named product matching -------------------------
// "Compare the MacBook Pro 16, Dell XPS 15 and Sony WH-1000XM5" must resolve to
// those exact rows in the database, never to invented products. Each name-like
// phrase in the message is looked up in the catalog (case-insensitive contains
// first, then token matching against the rows fetched from the database), and
// every resolved product joins the candidate pool.

const NAME_NOISE = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'between', 'vs', 'versus',
  'against', 'compare', 'comparison', 'compared', 'please', 'can', 'could', 'would', 'should', 'you', 'your', 'our',
  'me', 'my', 'we', 'us', 'it', 'is', 'are', 'am', 'be', 'as', 'if', 'so', 'no', 'not', 'which', 'what', 'better',
  'best', 'good', 'great', 'have', 'has', 'do', 'does', 'did', 'buy', 'want', 'need', 'show', 'tell', 'all', 'some',
  'any', 'both', 'these', 'those', 'them', 'they', 'one', 'two', 'three', 'product', 'products', 'option', 'options',
  'price', 'prices', 'cheap', 'cheapest', 'store', 'catalog', 'rupees', 'rs', 'inr', 'also', 'than', 'from',
  'phone', 'phones', 'mobile', 'mobiles', 'laptop', 'laptops', 'notebook', 'notebooks', 'headphone', 'headphones',
  'earphone', 'earphones', 'tablet', 'tablets', 'device', 'devices', 'model', 'models', 'difference', 'differences',
]);

const nameTokens = (text: unknown): string[] =>
  String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((token) => token.length >= 2 && !NAME_NOISE.has(token));

const NAME_SPLIT_PATTERN = /,|;|\/|\band\b|\bor\b|\bvs\.?\b|\bversus\b|\bcompared?\s+(?:with|to|against)\b|\bbetween\b/gi;

export const extractNamePhrases = (message: string): string[] => {
  const segments: string[] = [];

  for (const match of message.matchAll(/"([^"]{2,80})"|'([^']{2,80})'|“([^”]{2,80})”/g)) {
    segments.push(match[1] ?? match[2] ?? match[3] ?? '');
  }
  segments.push(...message.replace(/[?!]/g, ' ').split(NAME_SPLIT_PATTERN));

  const phrases: string[] = [];
  for (const segment of segments) {
    const phrase = nameTokens(segment).join(' ');
    if (phrase.length >= 3 && !phrases.includes(phrase)) phrases.push(phrase);
  }
  return phrases;
};

const isDistinctiveToken = (token: string): boolean => token.length >= 4 || /^[a-z]+\d[a-z0-9]*$/.test(token);

const nameMatchScore = (product: any, phrase: string): number => {
  const phraseTokens = new Set(nameTokens(phrase));
  if (phraseTokens.size === 0) return 0;

  const productTokens = nameTokens(product.name);
  if (productTokens.length === 0) return 0;

  const hits = productTokens.filter((token) => phraseTokens.has(token));
  const coverage = hits.length / productTokens.length;
  const brandHit = nameTokens(product.brand).some((token) => phraseTokens.has(token));

  if (coverage >= 0.6 || hits.some(isDistinctiveToken)) return 2 + coverage;
  if (brandHit) return 1;
  return 0;
};

export const findNamedProducts = async (
  message: string,
  hints?: Pick<AdvisorHints, 'categorySlug'>
): Promise<{ products: AdvisorProduct[]; raw: any[] }> => {
  const phrases = extractNamePhrases(message);
  if (phrases.length === 0) return { products: [], raw: [] };

  const catalog = await prisma.product.findMany({ include: productInclude });
  const matched: any[] = [];
  const seen = new Set<string>();
  const add = (product: any) => {
    if (!product || seen.has(product.id) || matched.length >= 4) return;
    seen.add(product.id);
    matched.push(product);
  };

  for (const phrase of phrases) {
    if (matched.length >= 4) break;

    // 1. Look the phrase up in the database (name, slug or brand).
    const rows = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: phrase, mode: 'insensitive' } },
          { slug: { contains: phrase, mode: 'insensitive' } },
          { brand: { contains: phrase, mode: 'insensitive' } },
        ],
      },
      include: productInclude,
      take: 4,
    });
    if (rows.length > 0) {
      const narrowed = hints?.categorySlug
        ? rows.filter((row: any) => row.category?.slug === hints.categorySlug)
        : [];
      const pool = narrowed.length > 0 ? narrowed : rows;
      const ranked = [...pool].sort((a: any, b: any) => nameMatchScore(b, phrase) - nameMatchScore(a, phrase));
      add(ranked[0]);
      continue;
    }

    // 2. Token fallback against the catalog rows we just fetched from the database.
    const scored: { product: any; score: number }[] = catalog
      .map((product: any) => ({ product, score: nameMatchScore(product, phrase) }))
      .filter((entry: { score: number }) => entry.score > 0)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
    if (scored.length === 0) continue;

    // A single phrase can name several products ("the iPhone 15 with the Galaxy
    // S24"), so every strong match in the phrase is kept.
    const strong = scored.filter((entry: { score: number }) => entry.score > 1);
    if (strong.length > 0) {
      for (const entry of strong) add(entry.product);
      continue;
    }

    // Brand-only reference ("the dell laptop"): keep every product of that brand,
    // narrowed to the category the customer mentioned when there is one.
    for (const entry of scored) {
      if (hints?.categorySlug && entry.product.category?.slug !== hints.categorySlug) continue;
      add(entry.product);
    }
  }

  return { products: matched.map(toAdvisorProduct), raw: matched };
};

// -------------------------------- Gemini call -------------------------------

const SYSTEM_INSTRUCTION = `You are the TECHNOVA AI Tech Advisor, an expert electronics shopping assistant for an Indian online store.

Rules:
1. Recommend ONLY products from the candidate list supplied in the user turn. Never invent products, brands, model names, prices, or specifications.
2. Use the exact "id" from the candidate list in every productId field.
3. Prices are in Indian Rupees (INR). Respect the customer's stated budget; if nothing fits, say so honestly and explain the closest trade-offs.
4. Explain WHY each recommended product fits the use case, referencing its real specifications, price, rating, or stock.
5. Mention honest trade-offs and downsides. Do not oversell.
6. Keep the reply concise (2-5 sentences), friendly, and specific.
7. When the customer asks to compare products, list the exact "id" of each compared product in comparison.productIds (in the order asked). The comparison table's specification rows are generated from the TECHNOVA database, so you do not need to fill comparison.rows and must never state a specification that is not in the candidate list.
8. Respond with JSON only, matching the provided schema.`;

const ADVISOR_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          reason: { type: 'string' },
          pros: { type: 'array', items: { type: 'string' } },
          cons: { type: 'array', items: { type: 'string' } },
        },
        required: ['productId', 'reason'],
      },
    },
    comparison: {
      type: 'object',
      properties: {
        productIds: { type: 'array', items: { type: 'string' } },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              attribute: { type: 'string' },
              values: { type: 'array', items: { type: 'string' } },
            },
            required: ['attribute', 'values'],
          },
        },
      },
      required: ['productIds', 'rows'],
    },
    followUpQuestions: { type: 'array', items: { type: 'string' } },
  },
  required: ['reply', 'recommendations'],
};

const buildCatalogForPrompt = (rawProducts: any[]) =>
  rawProducts.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category?.name ?? null,
    price: num(product.price),
    discount: num(product.discount),
    stock: num(product.stock),
    rating: num(product.rating),
    reviewCount: num(product.reviewCount),
    specs: specsToRecord(product),
    description: typeof product.description === 'string' ? product.description.slice(0, DESCRIPTION_LIMIT) : '',
  }));

const formatPrice = (value: number): string =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const buildUserPrompt = (
  message: string,
  rawProducts: any[],
  hints: AdvisorHints,
  overBudget: boolean,
  namedProducts: AdvisorProduct[]
): string =>
  [
    `Customer question: "${message}"`,
    '',
    namedProducts.length >= 2
      ? `The customer explicitly asked to compare these products: ${namedProducts
          .map((product) => `${product.name} (id: ${product.id})`)
          .join(', ')}. Put exactly those ids in comparison.productIds, in that order; the specification rows are generated from the catalog database, so leave comparison.rows empty.`
      : '',
    `Detected constraints: budget=${
      hints.budget ? formatPrice(hints.budget) : 'not specified'
    }, category=${hints.categoryLabel ?? 'any'}, requirements=${
      hints.requirements.length ? hints.requirements.join(', ') : 'none detected'
    }.`,
    overBudget ? 'Note: no candidate fits the stated budget. All candidates are above it; be honest about this.' : '',
    '',
    'Candidate products from the TECHNOVA catalog (recommend ONLY from this list, using their exact "id"):',
    JSON.stringify(buildCatalogForPrompt(rawProducts), null, 2),
  ]
    .filter(Boolean)
    .join('\n');

const extractCandidateText = (payload: any): string | null => {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const text = parts
    .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
    .join('')
    .trim();
  return text || null;
};

const parseJsonLoosely = (text: string): any | null => {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
};

export const askGemini = async (params: {
  message: string;
  history: AdvisorHistoryTurn[];
  rawProducts: any[];
  hints: AdvisorHints;
  overBudget: boolean;
  namedProducts?: AdvisorProduct[];
}): Promise<any | null> => {
  if (!config.geminiApiKey) return null;

  const contents = [
    ...params.history.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }],
    })),
    {
      role: 'user',
      parts: [
        {
          text: buildUserPrompt(
            params.message,
            params.rawProducts,
            params.hints,
            params.overBudget,
            params.namedProducts ?? []
          ),
        },
      ],
    },
  ];

  const generationConfig: any = {
    temperature: 0.4,
    maxOutputTokens: 2048,
    responseMimeType: 'application/json',
    responseSchema: ADVISOR_RESPONSE_SCHEMA,
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.geminiModel)}:generateContent`;
  const request = (body: any) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.geminiApiKey },
      body: JSON.stringify(body),
    });

  try {
    let response = await request({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents,
      generationConfig,
    });

    // Some API versions/models reject responseSchema. Retry once with the
    // schema described in the prompt instead of failing the whole request.
    if (!response.ok && (response.status === 400 || response.status === 404)) {
      console.warn(`[ai] Gemini rejected the response schema (${response.status}); retrying without it`);
      const { responseSchema: _responseSchema, ...restConfig } = generationConfig;
      response = await request({
        systemInstruction: {
          parts: [
            {
              text: `${SYSTEM_INSTRUCTION}\n\nReply with a single JSON object with this exact shape: ${JSON.stringify(
                ADVISOR_RESPONSE_SCHEMA
              )}`,
            },
          ],
        },
        contents,
        generationConfig: restConfig,
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[ai] Gemini request failed with ${response.status}: ${errorText.slice(0, 300)}`);
      return null;
    }

    const payload = await response.json();
    const text = extractCandidateText(payload);
    if (!text) {
      console.warn('[ai] Gemini response contained no text');
      return null;
    }

    return parseJsonLoosely(text);
  } catch (error: any) {
    console.error('[ai] Gemini request error:', error?.message || error);
    return null;
  }
};

// ------------------------------ Output sanitizing ---------------------------

const stringArray = (value: unknown, limit = 6): string[] =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean).slice(0, limit)
    : [];

export interface ComparisonContext {
  hints: AdvisorHints;
  rawById?: Map<string, any>;
  forcedProducts?: AdvisorProduct[];
}

export const sanitizeAdvisorOutput = (
  raw: any,
  products: AdvisorProduct[],
  context?: ComparisonContext
): AdvisorAdvice | null => {
  if (!raw || typeof raw !== 'object') return null;

  const byId = new Map(products.map((product) => [product.id.toLowerCase(), product]));
  const byName = new Map(products.map((product) => [product.name.toLowerCase(), product]));
  const resolve = (reference: unknown): AdvisorProduct | null => {
    const key = String(reference ?? '').trim().toLowerCase();
    if (!key) return null;
    return byId.get(key) ?? byName.get(key) ?? null;
  };

  const recommendations: AdvisorRecommendation[] = [];
  const seen = new Set<string>();
  for (const item of Array.isArray(raw.recommendations) ? raw.recommendations : []) {
    const product = resolve(item?.productId ?? item?.id ?? item?.name);
    if (!product || seen.has(product.id)) continue;
    seen.add(product.id);
    recommendations.push({
      product,
      reason: String(item?.reason ?? '').trim() || 'Matches your requirements from our catalog.',
      pros: stringArray(item?.pros, 4),
      cons: stringArray(item?.cons, 4),
    });
  }

  // The comparison table is always rebuilt from database rows: the model may
  // decide which products to compare (or the customer may name them), but every
  // price and specification value shown to the customer comes from the catalog.
  let compared: AdvisorProduct[] = [];
  if (context?.forcedProducts && context.forcedProducts.length >= 2) {
    compared = context.forcedProducts;
  } else if (raw.comparison && Array.isArray(raw.comparison.productIds)) {
    for (const reference of raw.comparison.productIds) {
      const product = resolve(reference);
      if (product && !compared.some((entry) => entry.id === product.id)) compared.push(product);
    }
  }

  let comparison: AdvisorComparison | null = null;
  if (compared.length >= 2) {
    const entries = compared.map((product) => ({ product, raw: context?.rawById?.get(product.id) ?? product }));
    comparison = buildComparison(entries, context?.hints);
  }

  return {
    reply: String(raw.reply ?? '').trim(),
    recommendations,
    comparison,
    followUpQuestions: stringArray(raw.followUpQuestions, 3),
  };
};

// ------------------------- Deterministic local fallback ----------------------

const haystackFor = (product: AdvisorProduct, raw: any): string =>
  `${product.name} ${product.brand} ${raw?.description ?? ''} ${JSON.stringify(specsToRecord(raw))}`.toLowerCase();

const matchesRequirement = (product: AdvisorProduct, raw: any, requirement: string): boolean => {
  const haystack = haystackFor(product, raw);
  const token = requirement.split(' ')[0].toLowerCase();
  return haystack.includes(requirement.toLowerCase()) || (token.length > 2 && haystack.includes(token));
};

const scoreProduct = (product: AdvisorProduct, raw: any, hints: AdvisorHints): number => {
  let score = product.rating * 1.5;
  score += product.stock > 0 ? 1 : -2;
  if (product.discount > 0) score += 0.5;
  if (hints.budget) {
    if (product.price <= hints.budget) score += 1 + 3 * (1 - product.price / hints.budget);
    else score -= 2;
  }
  for (const requirement of hints.requirements) {
    if (matchesRequirement(product, raw, requirement)) score += 1;
  }
  return score;
};

const highlightSpecs = (raw: any, requirements: string[]): string[] => {
  const entries = Object.entries(specsToRecord(raw));
  const matched = entries.filter(([key, value]) => {
    const text = `${key} ${value}`.toLowerCase();
    return requirements.some(
      (requirement) => text.includes(requirement.toLowerCase()) || text.includes(requirement.split(' ')[0].toLowerCase())
    );
  });
  const highlights = (matched.length > 0 ? matched : entries.slice(0, 2)).map(([key, value]) => `${key}: ${value}`);
  return highlights.slice(0, 3);
};

const buildReason = (product: AdvisorProduct, raw: any, hints: AdvisorHints): string => {
  const parts: string[] = [];
  if (hints.budget && product.price <= hints.budget) parts.push(`fits your ${formatPrice(hints.budget)} budget at ${formatPrice(product.price)}`);
  else if (hints.budget) parts.push(`is ${formatPrice(product.price - hints.budget)} above your budget`);
  if (product.rating >= 4.5) parts.push(`rated ${product.rating}/5 by ${product.reviewCount} customers`);
  const highlights = highlightSpecs(raw, hints.requirements);
  if (highlights.length) parts.push(`lists ${highlights.join(', ')}`);
  if (product.discount > 0) parts.push(`currently ${product.discount}% off`);
  return parts.length ? `${product.name} ${parts.join(', ')}.` : `${product.name} is a solid match from our catalog.`;
};

const buildPros = (product: AdvisorProduct, raw: any, hints: AdvisorHints): string[] => {
  const pros: string[] = [];
  if (product.rating >= 4.7) pros.push(`Top rated (${product.rating}/5 from ${product.reviewCount} reviews)`);
  if (product.stock > 10) pros.push(`In stock (${product.stock} units)`);
  if (product.discount > 0) pros.push(`${product.discount}% discount available`);
  const matched = hints.requirements.filter((requirement) => matchesRequirement(product, raw, requirement));
  if (matched.length) pros.push(`Matches: ${matched.join(', ')}`);
  return pros.slice(0, 4);
};

const buildCons = (product: AdvisorProduct, raw: any, hints: AdvisorHints): string[] => {
  const cons: string[] = [];
  if (hints.budget && product.price > hints.budget) cons.push(`Above your budget (${formatPrice(product.price)})`);
  if (product.rating < 4.7) cons.push(`Rated ${product.rating}/5 — below our top pick`);
  if (product.stock <= 5) cons.push(product.stock === 0 ? 'Currently out of stock' : `Only ${product.stock} left in stock`);
  const missing = hints.requirements.filter((requirement) => !matchesRequirement(product, raw, requirement));
  if (missing.length) cons.push(`Does not match: ${missing.join(', ')}`);
  return cons.slice(0, 4);
};

// Comparison rows are curated so a normal customer sees the attributes that
// actually matter, in a stable order, with the spec keys our products use.
const COMPARISON_ATTRIBUTES: { label: string; aliases: string[] }[] = [
  { label: 'Processor', aliases: ['Processor', 'Chip', 'CPU'] },
  { label: 'RAM', aliases: ['RAM', 'Memory'] },
  { label: 'Storage', aliases: ['Storage', 'Hard Drive', 'SSD'] },
  { label: 'GPU', aliases: ['GPU', 'Graphics'] },
  { label: 'Display', aliases: ['Display', 'Screen'] },
  { label: 'Battery', aliases: ['Battery', 'Battery Life'] },
  { label: 'Camera', aliases: ['Camera'] },
  { label: 'Noise Cancelling', aliases: ['Noise Cancelling', 'Noise Cancellation'] },
];

const CORE_ATTRIBUTE_LABELS = ['Processor', 'RAM', 'Storage', 'GPU', 'Display', 'Battery'];
const MISSING = '—';

const EMPTY_HINTS: AdvisorHints = { budget: null, categorySlug: null, categoryLabel: null, requirements: [] };

const specsByLowerKey = (raw: any): Record<string, string> =>
  Object.fromEntries(Object.entries(specsToRecord(raw)).map(([key, value]) => [key.toLowerCase(), value]));

const specValue = (record: Record<string, string>, aliases: string[]): string => {
  for (const alias of aliases) {
    const value = record[alias.toLowerCase()];
    if (value) return value;
  }
  return MISSING;
};

const firstNumber = (value: string): number | null => {
  const match = String(value ?? '').match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

// "Best for" is derived from the real specifications in the database (GPU class,
// RAM, battery, camera) plus the customer's own stated needs — never invented.
const buildSuitability = (product: AdvisorProduct, raw: any, hints: AdvisorHints): string => {
  const specs = specsByLowerKey(raw);
  const gpu = specs.gpu ?? specs.graphics ?? '';
  const ramGb = firstNumber(specs.ram ?? specs.memory ?? '');
  const batteryHours = firstNumber(specs.battery ?? specs['battery life'] ?? '');
  const slug = product.category?.slug ?? '';
  const tags: string[] = [];

  if (slug === 'laptops') {
    if (/rtx|geforce|radeon|nvidia/i.test(gpu)) tags.push('gaming, editing & GPU work');
    if (ramGb !== null && ramGb >= 32) tags.push('heavy multitasking');
    if (batteryHours !== null && batteryHours >= 18) tags.push('all-day battery life');
  } else if (slug === 'smartphones') {
    if (specs.camera) tags.push('photography');
    if (/titanium|ceramic|steel|glass/i.test(specs.material ?? '')) tags.push('premium build');
    if (batteryHours !== null && batteryHours >= 28) tags.push('long battery life');
  } else if (slug === 'accessories') {
    if (specs['noise cancelling'] || specs['noise cancellation']) tags.push('travel & focused work');
    if (batteryHours !== null && batteryHours >= 24) tags.push('long battery life');
  }

  // Only add requirements that the tags above do not already spell out.
  const tagText = tags.join(' ').toLowerCase();
  const matched = hints.requirements
    .filter((requirement) => matchesRequirement(product, raw, requirement))
    .filter((requirement) => !tagText.includes(requirement.split(' ')[0].toLowerCase()));
  if (matched.length > 0) tags.push(`fits your needs: ${matched.slice(0, 3).join(', ')}`);

  const text = (tags.length > 0 ? tags : ['everyday use']).slice(0, 3).join(' · ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// "Watch out for" mixes honest catalog facts with how this product fares versus
// the other products in the same comparison.
const buildTradeOffs = (
  entry: { product: AdvisorProduct; raw: any },
  entries: { product: AdvisorProduct; raw: any }[],
  hints: AdvisorHints
): string => {
  const product = entry.product;
  const notes: string[] = [];
  const prices = entries.map((item) => item.product.price);
  const maxRating = Math.max(...entries.map((item) => item.product.rating));

  if (entries.length > 1 && new Set(prices).size > 1 && product.price === Math.max(...prices)) notes.push('priciest of those compared');
  if (entries.length > 1 && product.rating < maxRating) notes.push(`rated ${product.rating}/5 vs ${maxRating}/5 for the top option`);
  if (hints.budget && product.price > hints.budget) notes.push(`above your ${formatPrice(hints.budget)} budget`);
  if (product.stock === 0) notes.push('currently out of stock');
  else if (product.stock <= 5) notes.push(`only ${product.stock} left in stock`);

  const record = specsByLowerKey(entry.raw);
  const missing = CORE_ATTRIBUTE_LABELS.filter((label) => {
    const definition = COMPARISON_ATTRIBUTES.find((attribute) => attribute.label === label)!;
    return specValue(record, definition.aliases) === MISSING;
  });
  if (missing.length >= 2) notes.push(`catalog spec sheet does not list ${missing.join(', ')}`);

  if (notes.length === 0) return 'No major drawbacks in the catalog data.';
  const text = notes.join(' · ');
  return text.charAt(0).toUpperCase() + text.slice(1) + '.';
};

const buildComparison = (
  entries: { product: AdvisorProduct; raw: any }[],
  hints: AdvisorHints = EMPTY_HINTS
): AdvisorComparison => {
  const products = entries.map((entry) => entry.product);
  const specs = entries.map((entry) => specsByLowerKey(entry.raw));
  const rows: { attribute: string; values: string[] }[] = [
    {
      attribute: 'Price',
      values: products.map((product) =>
        product.discount > 0 ? `${formatPrice(product.price)} · ${product.discount}% off` : formatPrice(product.price)
      ),
    },
  ];

  for (const { label, aliases } of COMPARISON_ATTRIBUTES) {
    const values = specs.map((record) => specValue(record, aliases));
    if (values.some((value) => value !== MISSING)) rows.push({ attribute: label, values });
  }

  rows.push({ attribute: 'Rating', values: products.map((product) => `${product.rating}/5 (${product.reviewCount} reviews)`) });
  rows.push({
    attribute: 'Availability',
    values: products.map((product) => (product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock')),
  });
  rows.push({ attribute: 'Best for', values: entries.map((entry) => buildSuitability(entry.product, entry.raw, hints)) });
  rows.push({ attribute: 'Watch out for', values: entries.map((entry) => buildTradeOffs(entry, entries, hints)) });

  return { products, rows };
};

const buildFollowUps = (hints: AdvisorHints, comparison = false): string[] => {
  const questions: string[] = [];
  if (comparison) questions.push('Which one is the best value for money?');
  else if (hints.categorySlug === 'laptops') questions.push('Compare the top two for me');
  else if (hints.categorySlug === 'smartphones') questions.push('Which of these has the best camera?');
  else questions.push('Show me the highest-rated option you have');
  if (!hints.budget) questions.push('Can you suggest something under ₹50,000?');
  else questions.push('What trade-offs should I know about?');
  return questions.slice(0, 2);
};

const joinNames = (names: string[]): string =>
  names.length <= 1 ? names[0] ?? '' : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

export const buildLocalAdvice = (
  hints: AdvisorHints,
  entries: { product: AdvisorProduct; raw: any }[],
  overBudget: boolean,
  options: { comparison?: { product: AdvisorProduct; raw: any }[]; comparisonIntent?: boolean } = {}
): AdvisorAdvice => {
  const ranked = [...entries].sort(
    (a, b) => scoreProduct(b.product, b.raw, hints) - scoreProduct(a.product, a.raw, hints)
  );
  const top = ranked.slice(0, Math.min(3, ranked.length));

  const recommendations = top.map(({ product, raw }) => ({
    product,
    reason: buildReason(product, raw, hints),
    pros: buildPros(product, raw, hints),
    cons: buildCons(product, raw, hints),
  }));

  // The customer named the products to compare: compare exactly those, in the
  // order they asked. Otherwise compare the best matches from the catalog.
  const forced = options.comparison && options.comparison.length >= 2 ? options.comparison : null;
  const compared = forced ?? top.slice(0, 3);
  const comparison = compared.length >= 2 ? buildComparison(compared, hints) : null;

  const overBudgetNote = overBudget
    ? ' Nothing currently fits the budget, so these are the closest options — all of them are above budget.'
    : '';
  const pick = top[0]?.product;
  const pickLead = hints.budget || hints.requirements.length > 0 ? 'Best overall fit for your needs' : 'Our highest-ranked pick here';
  const wantsComparison = options.comparisonIntent ?? Boolean(forced);
  const reply =
    wantsComparison && comparison
      ? `Here is how ${joinNames(compared.map((entry) => entry.product.name))} compare on price and real catalog specifications.${
          pick ? ` ${pickLead}: ${pick.name}.` : ''
        }`
      : `Here are the best matching${hints.categoryLabel ? ` ${hints.categoryLabel}` : ' products'} from the TECHNOVA catalog${
          hints.budget ? ` within your ${formatPrice(hints.budget)} budget` : ''
        }: ${top.map((entry) => entry.product.name).join(', ')}.${overBudgetNote}`;

  return { reply, recommendations, comparison, followUpQuestions: buildFollowUps(hints, Boolean(comparison)) };
};

// --------------------------------- Orchestrator ------------------------------

export const getAdvice = async (message: string, history: AdvisorHistoryTurn[] = []): Promise<AdvisorResult> => {
  const hints = extractHints(message);
  const criteria = { budget: hints.budget, category: hints.categoryLabel, requirements: hints.requirements };

  // Products the customer named explicitly are fetched from the database and
  // always join the candidate pool, so a named comparison can never drift into
  // recommending something else.
  const named = await findNamedProducts(message, hints);
  const { products: candidates, raw: candidateRaw, overBudget } = await findCandidateProducts(hints);

  const rawById = new Map<string, any>();
  const pool = new Map<string, AdvisorProduct>();
  candidates.forEach((product, index) => {
    rawById.set(product.id, candidateRaw[index]);
    pool.set(product.id, product);
  });
  named.products.forEach((product, index) => {
    if (!rawById.has(product.id)) rawById.set(product.id, named.raw[index]);
    if (!pool.has(product.id)) pool.set(product.id, product);
  });
  const products = [...pool.values()];
  const raw = products.map((product) => rawById.get(product.id));

  const namedEntries = named.products.map((product) => ({ product, raw: rawById.get(product.id) }));
  const namedComparison = named.products.length >= 2;
  const comparisonIntent = namedComparison || isComparisonRequest(message);
  const entries = products.map((product, index) => ({ product, raw: raw[index] }));
  const rankEntries = () =>
    [...entries].sort((a, b) => scoreProduct(b.product, b.raw, hints) - scoreProduct(a.product, a.raw, hints));
  const comparisonContext: ComparisonContext = {
    hints,
    rawById,
    forcedProducts: namedComparison ? named.products : undefined,
  };

  if (products.length === 0) {
    return {
      provider: 'local',
      model: null,
      reply:
        "I couldn't find any products in the TECHNOVA catalog that match those requirements. Try widening the budget or removing the category filter.",
      recommendations: [],
      comparison: null,
      followUpQuestions: ['What laptops do you have?', 'Show me your highest-rated products'],
      candidateCount: 0,
      criteria,
      notice: 'No matching products were found in the catalog.',
    };
  }

  if (config.geminiApiKey) {
    const rawAdvice = await askGemini({
      message,
      history,
      rawProducts: raw,
      hints,
      overBudget,
      namedProducts: named.products,
    });
    if (rawAdvice) {
      const advice = sanitizeAdvisorOutput(rawAdvice, products, comparisonContext);
      if (advice && advice.recommendations.length > 0) {
        if (!advice.comparison && comparisonIntent) {
          const topForComparison = rankEntries().slice(0, 3);
          if (topForComparison.length >= 2) advice.comparison = buildComparison(topForComparison, hints);
        }
        return {
          provider: 'gemini',
          model: config.geminiModel,
          ...advice,
          candidateCount: products.length,
          criteria,
        };
      }
      console.warn('[ai] Gemini returned no usable recommendations; using catalog ranking');
    }
  }

  const local = buildLocalAdvice(hints, entries, overBudget, {
    comparison: namedComparison && namedEntries.length >= 2 ? namedEntries : undefined,
    comparisonIntent,
  });

  return {
    provider: 'local',
    model: null,
    ...local,
    candidateCount: products.length,
    criteria,
    notice: config.geminiApiKey
      ? 'The AI service was unavailable, so this is a deterministic ranking of the catalog.'
      : 'Gemini is not configured on this server (GEMINI_API_KEY), so this is a deterministic ranking of the catalog.',
  };
};
