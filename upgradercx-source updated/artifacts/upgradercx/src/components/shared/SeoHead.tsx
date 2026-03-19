import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
  type?: 'website' | 'product' | 'article';
  image?: string;
  /** JSON-LD structured data object — will be serialized and injected */
  jsonLd?: Record<string, unknown>;
}

const BASE_URL = 'https://upgradercx.com';

/**
 * Sets document title, meta description, OG/Twitter tags, and optional JSON-LD.
 * Cleans up JSON-LD on unmount.
 * Laravel will serve SSR meta for crawlers; this covers client-side SPA navigation.
 */
export function SeoHead({ title, description, canonical, type = 'website', image, jsonLd }: SeoHeadProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta helpers
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', canonical || BASE_URL);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
    }

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical || BASE_URL);

    // JSON-LD
    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      if (script) script.remove();
    };
  }, [title, description, canonical, type, image, jsonLd]);

  return null;
}
