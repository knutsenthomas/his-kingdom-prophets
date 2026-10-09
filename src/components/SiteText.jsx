import React from 'react';
import CmsText from './CmsText';
import { inlineTextKey } from '../utils/inlineTextKey';

// Each fixed text has a stable key, including text rendered from public content lists.
export default function SiteText({ fallback }) {
  if (typeof fallback !== 'string') return fallback;
  if (!fallback.trim()) return fallback;
  return <CmsText slug={inlineTextKey(fallback)} fallback={fallback} />;
}
