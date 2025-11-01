import { useEffect } from "react";

export default function Meta({
  title = "Resonifi™ — Wellness Index™ | Feel your frequency™",
  description = "Resonifi™ blends sleep, hydration, energy, purpose, and more into your daily Wellness Index™ — a single score for how in tune you feel.",
  image = "/og/resonifi-og.png",
  url = typeof window !== 'undefined' ? window.location.href : "https://resonifiapp.com/",
  noIndex = false,
}) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('theme-color', '#0F172A');
    
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    }

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:image', image, true);

    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Update favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', '/icons/resonifi-symbol-white-on-navy-1024.png');

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

  }, [title, description, image, url, noIndex]);

  return null;
}