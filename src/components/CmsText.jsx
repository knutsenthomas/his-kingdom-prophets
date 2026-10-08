import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function CmsText({ 
  slug, 
  fallback, 
  className = '', 
  as: Component = 'span', 
  replaceObj = null 
}) {
  const { cmsContent, updateCmsContent, isAdminEditing, showToast, language } = useApp();
  
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
  
  // Apply placeholders (e.g., {name}) ONLY when NOT editing
  let displayText = rawText;
  if (replaceObj && !isAdminEditing) {
    Object.entries(replaceObj).forEach(([key, val]) => {
      if (typeof displayText === 'string') {
        displayText = displayText.split(key).join(val);
      }
    });
  }

  const elementRef = useRef(null);
  const [localText, setLocalText] = useState(rawText);

  // Sync state if CMS changes externally
  useEffect(() => {
    setLocalText(rawText);
  }, [rawText]);

  const handleBlur = () => {
    if (!isAdminEditing) return;
    const newText = elementRef.current?.innerText?.trim() || '';
    
    // Safety check to avoid blank strings
    if (newText === '') {
      if (elementRef.current) {
        elementRef.current.innerText = rawText;
      }
      showToast("Feltet kan ikke være tomt");
      return;
    }

    if (newText !== rawText) {
      const activeSlug = language === 'en' ? slug + '-en' : slug;
      showToast(language === 'en' ? "Oppdaterer og oversetter til norsk..." : "Oppdaterer og oversetter til engelsk...");
      updateCmsContent(activeSlug, newText);
    }
  };

  const handleKeyDown = (e) => {
    // Save on Enter (unless holding shift or component is multiline paragraph/div)
    if (e.key === 'Enter') {
      if (e.shiftKey || Component === 'p' || Component === 'textarea' || Component === 'div') {
        return; // Allow newline
      }
      e.preventDefault();
      elementRef.current?.blur();
    }
  };

  // Prevent rich text styling being pasted in contentEditable
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleClick = (e) => {
    if (isAdminEditing) {
      if (Component === 'a' || Component === 'button') {
        e.preventDefault();
      }
      e.stopPropagation();
      elementRef.current?.focus();
    }
  };

  if (!isAdminEditing) {
    return (
      <Component className={className} data-cms-slug={slug}>
        {displayText}
      </Component>
    );
  }

  return (
    <Component
      ref={elementRef}
      contentEditable
      suppressContentEditableWarning
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck="false"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onClick={handleClick}
      data-cms-slug={slug}
      className={`${className} inline-block outline-none border border-dashed border-burnt-orange/50 hover:border-burnt-orange focus:border-burnt-orange focus:bg-burnt-orange/5 focus:ring-1 focus:ring-burnt-orange rounded px-1.5 -mx-1.5 transition-all cursor-text relative group min-h-[1em]`}
      title={`Klikk for å redigere "${slug}" direkte på siden`}
    >
      {rawText}
    </Component>
  );
}
