/**
 * UpgraderCX Product Catalog — authoritative source for mock/dev mode
 * Real Cloudflare CDN image IDs scraped from upgradercx.com
 * To be replaced by Laravel GET /api/products when VITE_USE_MOCK=false
 */

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  retailPrice?: number;
  startingAt: boolean;
  category: string;
  catSlug: string;
  inStock: boolean;
  onHold: boolean;
  badge: string | null;
  imageUrl: string;
  description: string;
  features: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  startingPrice: string;
  productCount: number;
  imageUrl?: string;
}

/* Real Cloudflare image CDN — format: /shopitem (400×400 crop) */
const IMG = (id: string) =>
  `https://imagedelivery.net/VU2Gexkve1SGQTbghAvrTg/${id}/shopitem`;

/* Branded placeholder for products without a Cloudflare CDN image */
const BRAND = (bg: string, fg: string, name: string) =>
  `https://placehold.co/400x400/${bg}/${fg}?text=${encodeURIComponent(name)}&font=montserrat`;

/* Category cover photos — Unsplash (free, no auth required) */
const CATEGORY_COVERS: Record<string, string> = {
  education:     'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
  streaming:     'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&q=80',
  'ai-products': 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
  'dev-design':  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
  productivity:  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80',
  'vpn-security':'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&q=80',
  gaming:        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80',
  lifestyle:     'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
  reseller:      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
};

const F = ['Instant digital delivery', 'Full activation included', '24/7 support', 'Secure payment'];

export const ALL_PRODUCTS: Product[] = [
  // ── Education & Learning ──
  { id: 1,  name: 'DataCamp',           slug: 'datacamp',            price: 4.99,  retailPrice: 25,    startingAt: true,  category: 'Education',    catSlug: 'education',    inStock: true,  onHold: false, badge: null,          imageUrl: IMG('af6b335c-4b43-414e-79dd-29caa7d31f00'), description: 'DataCamp subscription for data science and analytics courses. Access hundreds of interactive courses in Python, R, SQL, and more.', features: F },
  { id: 2,  name: 'Udemy',              slug: 'udemy',               price: 29.99, retailPrice: 84.99, startingAt: false, category: 'Education',    catSlug: 'education',    inStock: true,  onHold: false, badge: null,          imageUrl: IMG('a19fefb5-aee4-4cde-b2e7-423aeb002a00'), description: 'Udemy premium account with access to thousands of courses across all categories.', features: F },
  { id: 3,  name: 'Busuu',              slug: 'busuu',               price: 33.99, retailPrice: 89.99, startingAt: false, category: 'Education',    catSlug: 'education',    inStock: true,  onHold: false, badge: null,          imageUrl: IMG('e453f699-bbe6-4f48-5c83-09de25052b00'), description: 'Busuu premium language learning subscription. Learn 14+ languages with AI-powered lessons.', features: F },
  { id: 4,  name: 'Duolingo',           slug: 'duolingo-plus',       price: 24.99, retailPrice: 83.88, startingAt: true,  category: 'Education',    catSlug: 'education',    inStock: true,  onHold: false, badge: null,          imageUrl: IMG('5f220f47-52b5-46d7-4207-f0416ca8fb00'), description: 'Duolingo Plus subscription for ad-free language learning with offline access.', features: F },
  { id: 5,  name: 'Coursera Plus',      slug: 'coursera-plus',       price: 27.99, retailPrice: 59,    startingAt: false, category: 'Education',    catSlug: 'education',    inStock: true,  onHold: false, badge: null,          imageUrl: IMG('e2b85930-79c4-4278-b6af-e0e10a79dc00'), description: 'Coursera Plus annual subscription with unlimited access to 7,000+ courses and certificates.', features: F },
  { id: 6,  name: 'Coursera 6 Month',   slug: 'coursera-plus-copy',  price: 14.99, retailPrice: 59,    startingAt: false, category: 'Education',    catSlug: 'education',    inStock: true,  onHold: false, badge: null,          imageUrl: IMG('808eadf0-03a7-4ca2-f9e7-0b451680b600'), description: 'Coursera Plus 6-month subscription with access to professional certificates and courses.', features: F },
  { id: 7,  name: 'TryHackMe',          slug: 'tryhackme',           price: 49.99, retailPrice: 120,   startingAt: false, category: 'Education',    catSlug: 'education',    inStock: true,  onHold: false, badge: null,          imageUrl: IMG('b83209c9-7058-48a3-7db0-3d6494b23f00'), description: 'TryHackMe premium subscription for cybersecurity training with hands-on labs.', features: F },

  // ── Streaming & Entertainment ──
  { id: 8,  name: 'Spotify',            slug: 'spotify-premium',     price: 13.99, retailPrice: 10.99, startingAt: true,  category: 'Streaming',    catSlug: 'streaming',    inStock: true,  onHold: false, badge: 'Popular',     imageUrl: IMG('06fc36d3-692c-447b-0cf7-21fcfdcb9b00'), description: 'Spotify Premium subscription with ad-free music, offline downloads, and high-quality audio.', features: F },
  { id: 9,  name: 'Netflix',            slug: 'netflix',             price: 5.99,  retailPrice: 17.99, startingAt: true,  category: 'Streaming',    catSlug: 'streaming',    inStock: true,  onHold: false, badge: 'Hot',         imageUrl: BRAND('E50914', 'FFFFFF', 'NETFLIX\nPREMIUM'), description: 'Netflix Premium access seat — 4K Ultra HD, dedicated credentials for the full period.', features: F },
  { id: 10, name: 'Disney+',            slug: 'disney-plus',         price: 3.49,  retailPrice: 11.99, startingAt: true,  category: 'Streaming',    catSlug: 'streaming',    inStock: true,  onHold: false, badge: null,          imageUrl: BRAND('113CCF', 'FFFFFF', 'DISNEY+\nPREMIUM'), description: 'Disney+ subscription for Disney, Marvel, Star Wars, and National Geographic.', features: F },
  { id: 11, name: 'YouTube Premium',    slug: 'youtube-premium',     price: 2.99,  retailPrice: 13.99, startingAt: true,  category: 'Streaming',    catSlug: 'streaming',    inStock: true,  onHold: false, badge: 'Best Seller',  imageUrl: BRAND('FF0000', 'FFFFFF', 'YOUTUBE\nPREMIUM'), description: 'YouTube Premium — ad-free videos, background play, YouTube Music included.', features: F },
  { id: 12, name: 'HBO Max',            slug: 'hbo-max',             price: 4.99,  retailPrice: 15.99, startingAt: true,  category: 'Streaming',    catSlug: 'streaming',    inStock: true,  onHold: false, badge: null,          imageUrl: BRAND('6600FF', 'FFFFFF', 'MAX\nPREMIUM'), description: 'HBO Max subscription for HBO Originals, Warner Bros. movies, and exclusive series.', features: F },
  { id: 13, name: 'Apple TV+',          slug: 'apple-tv-plus',       price: 2.49,  retailPrice: 8.99,  startingAt: false, category: 'Streaming',    catSlug: 'streaming',    inStock: true,  onHold: false, badge: null,          imageUrl: BRAND('1C1C1E', 'FFFFFF', 'APPLE TV+\nPREMIUM'), description: 'Apple TV+ subscription for award-winning Apple Original series and films.', features: F },

  // ── AI Products ──
  { id: 14, name: 'ChatGPT Plus',       slug: 'chatgpt-plus',        price: 9.99,  retailPrice: 20,    startingAt: false, category: 'AI Products',  catSlug: 'ai-products',  inStock: true,  onHold: false, badge: 'Hot',         imageUrl: BRAND('10A37F', 'FFFFFF', 'CHATGPT\nPLUS'), description: 'ChatGPT Plus — GPT-4o access, faster responses, advanced data analysis.', features: F },
  { id: 15, name: 'Midjourney',         slug: 'midjourney',          price: 7.99,  retailPrice: 30,    startingAt: true,  category: 'AI Products',  catSlug: 'ai-products',  inStock: true,  onHold: false, badge: 'Popular',     imageUrl: BRAND('1A1A2E', 'FFFFFF', 'MIDJOURNEY\nPRO'), description: 'Midjourney AI image generation — create stunning art and visuals with prompts.', features: F },
  { id: 16, name: 'Claude Pro',         slug: 'claude-pro',          price: 11.99, retailPrice: 20,    startingAt: false, category: 'AI Products',  catSlug: 'ai-products',  inStock: true,  onHold: false, badge: null,          imageUrl: BRAND('D97757', 'FFFFFF', 'CLAUDE\nPRO'), description: 'Claude Pro by Anthropic — advanced AI with 5× more usage, priority access.', features: F },
  { id: 17, name: 'Perplexity Pro',     slug: 'perplexity-pro',      price: 8.99,  retailPrice: 20,    startingAt: false, category: 'AI Products',  catSlug: 'ai-products',  inStock: true,  onHold: false, badge: null,          imageUrl: BRAND('20B2AA', 'FFFFFF', 'PERPLEXITY\nPRO'), description: 'Perplexity Pro — AI-powered search with real-time web data and citations.', features: F },
  { id: 18, name: 'Gemini Advanced',    slug: 'gemini-advanced',     price: 7.49,  retailPrice: 19.99, startingAt: false, category: 'AI Products',  catSlug: 'ai-products',  inStock: true,  onHold: false, badge: 'New',         imageUrl: BRAND('8B7CF6', 'FFFFFF', 'GEMINI\nADVANCED'), description: 'Google Gemini Advanced — most capable Gemini model with 1M token context.', features: F },

  // ── Dev & Design ──
  { id: 19, name: 'Figma Pro',          slug: 'figma-pro',           price: 8.99,  retailPrice: 15,    startingAt: true,  category: 'Dev & Design', catSlug: 'dev-design',   inStock: true,  onHold: false, badge: 'Popular',     imageUrl: BRAND('F24E1E', 'FFFFFF', 'FIGMA\nPROFESSIONAL'), description: 'Figma Professional plan — unlimited projects, advanced prototyping, design libraries.', features: F },
  { id: 20, name: 'GitHub Copilot',     slug: 'github-copilot',      price: 6.99,  retailPrice: 10,    startingAt: false, category: 'Dev & Design', catSlug: 'dev-design',   inStock: true,  onHold: false, badge: null,          imageUrl: BRAND('24292E', 'FFFFFF', 'GITHUB\nCOPILOT'), description: 'GitHub Copilot Individual — AI code completion for all major IDEs.', features: F },
  { id: 21, name: 'Adobe Creative CC',  slug: 'adobe-cc',            price: 19.99, retailPrice: 54.99, startingAt: true,  category: 'Dev & Design', catSlug: 'dev-design',   inStock: true,  onHold: false, badge: 'Best Seller',  imageUrl: BRAND('FF0000', 'FFFFFF', 'ADOBE CC\nPREMIUM'), description: 'Adobe Creative Cloud — Photoshop, Illustrator, Premiere Pro, After Effects and more.', features: F },
  { id: 22, name: 'Envato Elements',    slug: 'envato-elements',     price: 7.99,  retailPrice: 16.50, startingAt: false, category: 'Dev & Design', catSlug: 'dev-design',   inStock: true,  onHold: false, badge: null,          imageUrl: BRAND('4AC367', 'FFFFFF', 'ENVATO\nELEMENTS'), description: 'Envato Elements — unlimited downloads of templates, fonts, graphics, and more.', features: F },

  // ── Productivity ──
  { id: 23, name: 'Notion Plus',        slug: 'notion-plus',         price: 4.99,  retailPrice: 16,    startingAt: true,  category: 'Productivity', catSlug: 'productivity', inStock: true,  onHold: false, badge: 'Popular',     imageUrl: BRAND('000000', 'FFFFFF', 'NOTION\nPLUS'), description: 'Notion Plus — unlimited blocks, file uploads, version history, and collaboration.', features: F },
  { id: 24, name: 'Grammarly Premium',  slug: 'grammarly-premium',   price: 7.99,  retailPrice: 30,    startingAt: false, category: 'Productivity', catSlug: 'productivity', inStock: true,  onHold: false, badge: null,          imageUrl: BRAND('15C39A', 'FFFFFF', 'GRAMMARLY\nPREMIUM'), description: 'Grammarly Premium — advanced grammar, style suggestions, and tone detection.', features: F },
  { id: 25, name: 'Microsoft 365',      slug: 'microsoft-365',       price: 5.99,  retailPrice: 9.99,  startingAt: true,  category: 'Productivity', catSlug: 'productivity', inStock: true,  onHold: false, badge: 'Best Seller',  imageUrl: BRAND('D83B01', 'FFFFFF', 'MICROSOFT\n365'), description: 'Microsoft 365 Family — Word, Excel, PowerPoint, Teams, OneDrive 6TB storage.', features: F },
  { id: 26, name: 'Canva Pro',          slug: 'canva-pro',           price: 6.99,  retailPrice: 14.99, startingAt: true,  category: 'Productivity', catSlug: 'productivity', inStock: true,  onHold: false, badge: 'Hot',         imageUrl: BRAND('00C4CC', 'FFFFFF', 'CANVA\nPRO'), description: 'Canva Pro — premium templates, brand kit, background remover, unlimited storage.', features: F },
  { id: 27, name: 'Loom Business',      slug: 'loom-business',       price: 4.49,  retailPrice: 12.50, startingAt: false, category: 'Productivity', catSlug: 'productivity', inStock: true,  onHold: false, badge: null,          imageUrl: BRAND('625DF5', 'FFFFFF', 'LOOM\nBUSINESS'), description: 'Loom Business — async video messaging, unlimited recordings, analytics.', features: F },

  // ── VPN & Security ──
  { id: 28, name: 'NordVPN',            slug: 'nordvpn',             price: 2.99,  retailPrice: 11.99, startingAt: true,  category: 'VPN & Security', catSlug: 'vpn-security', inStock: true, onHold: false, badge: 'Popular',     imageUrl: BRAND('4687FF', 'FFFFFF', 'NORDVPN\nPREMIUM'), description: 'NordVPN Premium — 5500+ servers, 60+ countries, Threat Protection included.', features: F },
  { id: 29, name: 'ExpressVPN',         slug: 'expressvpn',          price: 4.99,  retailPrice: 12.95, startingAt: false, category: 'VPN & Security', catSlug: 'vpn-security', inStock: true, onHold: false, badge: 'Best Seller',  imageUrl: BRAND('DA3940', 'FFFFFF', 'EXPRESSVPN\nPREMIUM'), description: 'ExpressVPN — ultra-fast VPN, trusted by millions, 105 countries.', features: F },
  { id: 30, name: 'Surfshark',          slug: 'surfshark',           price: 1.99,  retailPrice: 12.95, startingAt: true,  category: 'VPN & Security', catSlug: 'vpn-security', inStock: true, onHold: false, badge: null,          imageUrl: BRAND('1DB954', 'FFFFFF', 'SURFSHARK\nVPN'), description: 'Surfshark VPN — unlimited devices, strong encryption, CleanWeb ad-blocker.', features: F },
  { id: 31, name: '1Password',          slug: '1password',           price: 2.49,  retailPrice: 4.99,  startingAt: false, category: 'VPN & Security', catSlug: 'vpn-security', inStock: true, onHold: false, badge: null,          imageUrl: BRAND('1A8CFF', 'FFFFFF', '1PASSWORD\nFAMILY'), description: '1Password password manager — secure vault, family sharing, watchtower alerts.', features: F },

  // ── Gaming ──
  { id: 32, name: 'Xbox Game Pass',     slug: 'xbox-game-pass',      price: 4.99,  retailPrice: 14.99, startingAt: true,  category: 'Gaming',       catSlug: 'gaming',       inStock: true,  onHold: false, badge: 'Popular',     imageUrl: BRAND('107C10', 'FFFFFF', 'XBOX\nGAME PASS'), description: 'Xbox Game Pass Ultimate — 100+ games on console, PC, and cloud gaming.', features: F },
  { id: 33, name: 'PlayStation Plus',   slug: 'ps-plus',             price: 5.99,  retailPrice: 13.99, startingAt: true,  category: 'Gaming',       catSlug: 'gaming',       inStock: true,  onHold: false, badge: 'Hot',         imageUrl: BRAND('003087', 'FFFFFF', 'PS PLUS\nEXTRA'), description: 'PlayStation Plus Extra — 400+ PS4/PS5 games on demand, monthly free games.', features: F },
  { id: 34, name: 'EA Play Pro',        slug: 'ea-play',             price: 2.99,  retailPrice: 5.99,  startingAt: false, category: 'Gaming',       catSlug: 'gaming',       inStock: true,  onHold: false, badge: null,          imageUrl: BRAND('FF4500', 'FFFFFF', 'EA PLAY\nPRO'), description: 'EA Play Pro membership — full EA library, exclusive in-game content and rewards.', features: F },
  { id: 35, name: 'Nintendo Online',    slug: 'nintendo-online',     price: 3.49,  retailPrice: 19.99, startingAt: true,  category: 'Gaming',       catSlug: 'gaming',       inStock: true,  onHold: false, badge: null,          imageUrl: BRAND('E60012', 'FFFFFF', 'NINTENDO\nONLINE'), description: 'Nintendo Switch Online + Expansion Pack — online play, NES/SNES/N64 library.', features: F },
  { id: 36, name: 'ExitLag',            slug: 'exitlag-tier-i',      price: 5.99,  retailPrice: 12,    startingAt: true,  category: 'Gaming',       catSlug: 'gaming',       inStock: true,  onHold: false, badge: null,          imageUrl: IMG('ead9b799-f87d-45c1-b387-a62227ee6300'), description: 'ExitLag gaming optimization — reduced ping, optimized routes, multi-path technology.', features: F },
  { id: 37, name: 'Discord Nitro',      slug: 'dc-nitro-basic',      price: 44.99, retailPrice: 99.99, startingAt: true,  category: 'Gaming',       catSlug: 'gaming',       inStock: true,  onHold: false, badge: null,          imageUrl: IMG('433446f7-2ea1-4f56-ec73-26770a17df00'), description: 'Discord Nitro — custom emojis, larger uploads, server boosts, HD streaming.', features: F },
  { id: 38, name: 'Chess.com Premium',  slug: 'chess-com-premium',   price: 11.99, retailPrice: 29.99, startingAt: true,  category: 'Gaming',       catSlug: 'gaming',       inStock: true,  onHold: false, badge: null,          imageUrl: IMG('97fdc7b9-b42c-49d2-ad41-bd81be481100'), description: 'Chess.com Premium — unlimited puzzles, analysis board, video lessons, drills.', features: F },

  // ── Lifestyle ──
  { id: 39, name: 'Amazon Prime',       slug: 'amazon',              price: 5.99,  retailPrice: 9.99,  startingAt: true,  category: 'Lifestyle',    catSlug: 'lifestyle',    inStock: true,  onHold: false, badge: 'Best Seller',  imageUrl: IMG('ffd726bb-afb0-42e5-8ea2-8e1586c66c00'), description: 'Amazon Prime — fast delivery, Prime Video, Prime Music, Prime Reading.', features: F },
  { id: 40, name: 'Headspace',          slug: 'headspace-12-months', price: 7.99,  retailPrice: 69.99, startingAt: false, category: 'Lifestyle',    catSlug: 'lifestyle',    inStock: true,  onHold: false, badge: null,          imageUrl: IMG('ea342124-3d0b-4caa-75b0-c838cc1b3800'), description: 'Headspace 12-month subscription — guided meditation, sleep sounds, focus music.', features: F },
  { id: 41, name: 'Tinder Gold',        slug: 'tinder-premium',      price: 7.99,  retailPrice: 39.99, startingAt: true,  category: 'Lifestyle',    catSlug: 'lifestyle',    inStock: true,  onHold: false, badge: null,          imageUrl: IMG('ba8f7b18-7820-43fa-a0b4-afbb8c372700'), description: 'Tinder Gold — unlimited likes, Passport, Rewind, Boost and 5 Super Likes/day.', features: F },
  { id: 42, name: 'LinkedIn Premium',   slug: 'linkedin-premium',    price: 14.99, retailPrice: 59.99, startingAt: true,  category: 'Lifestyle',    catSlug: 'lifestyle',    inStock: true,  onHold: false, badge: 'Popular',     imageUrl: IMG('c8ff0b95-9806-4511-81ca-a452f79a2400'), description: 'LinkedIn Premium Career — InMail, who viewed your profile, LinkedIn Learning.', features: F },
  { id: 43, name: 'Duolingo Family',    slug: 'duolingo-family',     price: 5.99,  retailPrice: 9.99,  startingAt: false, category: 'Lifestyle',    catSlug: 'lifestyle',    inStock: true,  onHold: false, badge: null,          imageUrl: IMG('5f220f47-52b5-46d7-4207-f0416ca8fb00'), description: 'Duolingo Family Plan — up to 6 learners, all Plus features, progress tracking.', features: F },

  // ── Reseller ──
  { id: 44, name: 'UpgraderCX Reseller', slug: 'upgradercx-reseller', price: 29.99, startingAt: false, category: 'Reseller', catSlug: 'reseller',   inStock: true,  onHold: false, badge: null,          imageUrl: IMG('90d5c061-4065-4524-cade-46167f4dbe00'), description: 'UpgraderCX Reseller Package — access wholesale pricing, branded dashboard, and full support.', features: F },
];

/** Category summaries computed from product data */
export const CATEGORIES: Category[] = (() => {
  const catMap = new Map<string, { name: string; slug: string; minPrice: number; count: number }>();
  ALL_PRODUCTS.forEach((p) => {
    if (p.price === 0) return;
    const existing = catMap.get(p.catSlug);
    if (existing) {
      existing.count++;
      if (p.price < existing.minPrice) existing.minPrice = p.price;
    } else {
      catMap.set(p.catSlug, { name: p.category, slug: p.catSlug, minPrice: p.price, count: 1 });
    }
  });
  return Array.from(catMap.values()).map((c, i) => ({
    id: i + 1,
    name: c.name,
    slug: c.slug,
    startingPrice: `€${c.minPrice.toFixed(2)}`,
    productCount: c.count,
    imageUrl: CATEGORY_COVERS[c.slug],
  }));
})();

export const CATEGORIES_LIST = [
  { id: 0, name: 'All Categories', slug: 'all' },
  ...CATEGORIES.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
];

export function getProductBySlug(slug: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 4): Product[] {
  const current = getProductBySlug(slug);
  if (!current) return [];
  return ALL_PRODUCTS.filter((p) => p.slug !== slug && p.catSlug === current.catSlug && !p.onHold).slice(0, limit);
}
