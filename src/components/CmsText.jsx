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
    if (language === 'en') {
      return cmsContent?.[slug + '-en'] || cmsContent?.[slug] || fallback;
    }
    return cmsContent?.[slug] || fallback;
  };
  
  const rawText = getCmsText();
  
  // Apply placeholders (e.g., {name}) ONLY when NOT editing
  let displayText = rawText;
  if (replaceObj && !isAdminEditing) {
    Object.entries(replaceObj).forEach(([key, val]) => {
      displayText = displayText.replace(key, val);
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
      updateCmsContent(language === 'en' ? slug + '-en' : slug, newText);
      showToast(`Oppdatert felt "${slug}"!`);
    }
  };

  const handleKeyDown = (e) => {
    // Save on Enter (unless holding shift for multiline textareas/paragraphs)
    if (e.key === 'Enter' && Component !== 'p' && Component !== 'textarea') {
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
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!isAdminEditing) {
    return <Component className={className}>{displayText}</Component>;
  }

  return (
    <Component
      ref={elementRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onClick={handleClick}
      className={`${className} inline-block outline-none border border-dashed border-burnt-orange/50 hover:border-burnt-orange focus:border-burnt-orange focus:bg-burnt-orange/5 focus:ring-1 focus:ring-burnt-orange rounded px-1.5 -mx-1.5 transition-all cursor-text relative group min-h-[1em]`}
      title={`Klikk for å redigere "${slug}" direkte på siden`}
    >
      {rawText}
    </Component>
  );
}
