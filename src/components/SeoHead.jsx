import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SeoHead - Enterprise-grade dynamic Head & Meta manager for React SPA.
 * Updates title, canonical, meta descriptions, Open Graph, Twitter cards,
 * and page-specific Schema.org JSON-LD for maximum SEO & GEO visibility.
 */
export default function SeoHead({
  title,
  description,
  canonicalPath,
  type = 'website',
  image = 'https://hkpc.no/og-image.jpg',
  keywords,
  schema
}) {
  const location = useLocation();
  const currentPath = canonicalPath || location.pathname;
  const canonicalUrl = `https://hkpc.no${currentPath === '/' ? '' : currentPath}`;

  const defaultTitle = 'His Kingdom Prophetic Community | Profetisk Skole & Utrustningssenter';
  const fullTitle = title 
    ? (title.includes('His Kingdom') || title.includes('HKPC') ? title : `${title} | His Kingdom Prophetic Community`)
    : defaultTitle;

  const fullDesc = description || 
    'His Kingdom Prophetic Community (HKPC) er en nettbasert bibelskole og åpenbaringsskole for profetisk utrustning, bibelundervisning og åndelig vekst.';

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to safely set meta tag content
    const setMeta = (nameAttr, nameVal, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${nameAttr}="${nameVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, nameVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMeta('name', 'description', fullDesc);
    setMeta('name', 'title', fullTitle);
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    // 3. Canonical Tag
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    // 4. Open Graph Tags
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', fullDesc);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', image);

    // 5. Twitter Card Tags
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', fullDesc);
    setMeta('name', 'twitter:url', canonicalUrl);
    setMeta('name', 'twitter:image', image);

    // 6. Dynamic JSON-LD Schema (GEO Optimization)
    let schemaScript = document.getElementById('dynamic-page-schema');
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'dynamic-page-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    return () => {
      // Clean up dynamic schema on unmount if route changes
      const currentSchemaScript = document.getElementById('dynamic-page-schema');
      if (currentSchemaScript) {
        currentSchemaScript.remove();
      }
    };
  }, [fullTitle, fullDesc, canonicalUrl, type, image, keywords, schema]);

  return null;
}
