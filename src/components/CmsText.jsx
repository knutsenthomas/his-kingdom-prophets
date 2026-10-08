import React from 'react';
import { useApp } from '@/contexts/AppContext';

export default function CmsText({ 
  slug, 
  fallback, 
  className = '', 
  as: Component = 'span', 
  replaceObj = null 
}) {
  const { cmsContent, language } = useApp();
  
  const getCmsText = () => {
    let text = "";
    if (language === 'en') {
      text = cmsContent?.[slug + '-en'] || fallback;
    } else {
      text = cmsContent?.[slug] || fallback;
    }

    // Defensiv sjekk: fjern ledende emojier fra faner for å unngå doble symboler
    if (slug.startsWith('resources-tab-') && typeof text === 'string') {
      text = text.replace(/^[📖📚🎙️📜\s]+/gu, '').trim();
    }

    if (slug.startsWith('landing-') && typeof text === 'string') {
      text = text.replace(/kickoff-samlingen/gi, 'oppstartssamlingen')
        .replace(/kickoff-helgen/gi, 'oppstartssamlingen')
        .replace(/kickoff i Norge/gi, 'oppstartssamlingen i Norge')
        .replace(/kickoff kost\/losji/gi, 'kost og losji på oppstartssamlingen');
    }
    return text;
  };
  
  const rawText = getCmsText();
  
  // Apply placeholders (e.g., {name}).
  let displayText = rawText;
  if (replaceObj) {
    Object.entries(replaceObj).forEach(([key, val]) => {
      if (typeof displayText === 'string') {
        displayText = displayText.split(key).join(val);
      }
    });
  }

  return (
    <Component className={className} data-cms-slug={slug}>
      {displayText}
    </Component>
  );
}
