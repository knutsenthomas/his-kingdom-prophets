import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Pencil, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { auth } from '../firebase';
import { saveInlineContent } from '../utils/saveInlineContent';
import '../styles/inline-editor.css';

const ADMIN_EMAILS = ['knutsenthomas@gmail.com', 'thomas@tk-design.no', 'thomas@hiskingdomministry.no'];
export default function WebsiteInlineEditor() {
  const { user, cmsContent, language, loginWithGoogle, setIsAdminEditing } = useApp();
  const location = useLocation();
  const [editing, setEditing] = useState(false);
  const [field, setField] = useState(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const textarea = useRef(null);
  const trigger = useRef(null);
  const toggle = useRef(null);
  const isAdmin = !!auth.currentUser && !!user && (['admin', 'superadmin'].includes(user.role) || ADMIN_EMAILS.includes(user.email?.toLowerCase()));
  const requested = new URLSearchParams(location.search).get('edit') === '1';
  const publicPage = !/^\/(student|email|complete-profile|interests|onboarding-welcome|login|register)(\/|$)/.test(location.pathname);

  useEffect(() => { setField(null); setNotice(''); }, [location.pathname, language]);
  useEffect(() => {
    if (requested && isAdmin) setEditing(true);
  }, [requested, isAdmin]);
  useEffect(() => {
    setIsAdminEditing(editing && isAdmin && publicPage);
    return () => setIsAdminEditing(false);
  }, [editing, isAdmin, publicPage, setIsAdminEditing]);
  useEffect(() => {
    if (!editing || !isAdmin || !publicPage) return;
    document.body.classList.add('site-text-editing');
    const handleClick = event => {
      if (event.target.closest('[data-site-editor]')) return;
      const element = event.target.closest('[data-cms-slug]');
      if (!element) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const slug = element.dataset.cmsSlug;
      const key = language === 'en' ? `${slug}-en` : slug;
      trigger.current = element;
      setField({ key, previous: cmsContent[key] });
      setDraft(String(cmsContent[key] ?? element.dataset.cmsFallback ?? element.textContent));
      setError('');
      setNotice('');
    };
    document.addEventListener('click', handleClick, true);
    return () => { document.body.classList.remove('site-text-editing'); document.removeEventListener('click', handleClick, true); };
  }, [editing, isAdmin, publicPage, cmsContent, language]);
  useEffect(() => {
    if (!field) return;
    textarea.current?.focus();
    const handler = event => {
      if (event.key === 'Escape' && !busy) { setField(null); toggle.current?.focus(); }
      if (event.key === 'Tab') {
        const controls = [...document.querySelectorAll('[data-site-editor-dialog] button:not(:disabled), [data-site-editor-dialog] textarea')];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [field, busy]);
  async function save() {
    setBusy(true); setError('');
    try {
      await saveInlineContent(field.key, draft, field.previous);
      setField(null); toggle.current?.focus(); setNotice(language === 'en' ? 'Text saved.' : 'Teksten er lagret på nettsiden.');
    } catch (failure) { setError(failure.message || 'Teksten kunne ikke lagres.'); }
    finally { setBusy(false); }
  }
  if (!publicPage || (!isAdmin && !requested)) return null;
  return <div data-site-editor>
    <div className="site-editor-toolbar">
      {isAdmin ? <><button ref={toggle} onClick={() => { setEditing(!editing); setField(null); }} aria-pressed={editing}><Pencil size={18}/>{editing ? 'Avslutt redigering' : 'Rediger nettsiden'}</button>{editing && <span>Trykk på teksten du vil endre · {language === 'en' ? 'Engelsk' : 'Norsk'}</span>}</> : <><span>Logg inn som administrator for å redigere.</span><button onClick={() => loginWithGoogle()}>Logg inn med Google</button></>}
      {notice && <span role="status">{notice}</span>}
    </div>
    {field && isAdmin && <div className="site-editor-backdrop" onClick={() => { if (!busy) setField(null); }}>
      <section className="site-editor-dialog" data-site-editor-dialog role="dialog" aria-modal="true" aria-labelledby="site-editor-title" onClick={event => event.stopPropagation()}>
        <div className="site-editor-heading"><h2 id="site-editor-title">Rediger tekst</h2><button disabled={busy} onClick={() => setField(null)} aria-label="Lukk"><X size={20}/></button></div>
        <label htmlFor="site-editor-text">{language === 'en' ? 'Engelsk tekst' : 'Norsk tekst'}</label>
        <textarea id="site-editor-text" ref={textarea} value={draft} onChange={event => setDraft(event.target.value)} disabled={busy}/>
        {error && <p role="alert">{error}</p>}
        <p>Endringen vises på nettsiden når du lagrer.</p>
        <div className="site-editor-actions"><button disabled={busy} onClick={() => setField(null)}>Avbryt</button><button disabled={busy} onClick={save}>{busy ? 'Lagrer …' : 'Lagre tekst'}</button></div>
      </section>
    </div>}
  </div>;
}
