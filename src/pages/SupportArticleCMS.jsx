import React, { useState } from 'react';

const initialArticles = [
  {
    id: 1,
    title: 'Oversikt over de fem tjenestegavene',
    updated: '14. Mars 2024',
    published: true,
    onLanding: true,
  },
  {
    id: 2,
    title: 'Hvordan bestille digital veiledningstid',
    updated: '14. Mars 2024',
    published: true,
    onLanding: false,
  },
  {
    id: 3,
    title: 'Feilsøking ved Zoom- og videostrømmer',
    updated: '14. Mai 2024',
    published: true,
    onLanding: false,
  },
  {
    id: 4,
    title: 'Bruk av Bibelkalkulatoren for karakterer',
    updated: '14. Mai 2024',
    published: true,
    onLanding: false,
  },
  {
    id: 5,
    title: 'Navigering i Bønnefellesskapet og chatten',
    updated: '2 dager siden',
    published: true,
    onLanding: false,
  },
];

export default function SupportArticleCMS() {
  const [articles, setArticles] = useState(initialArticles);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ title: '', content: '', published: false, onLanding: false });

  const handleEdit = (id) => {
    const art = articles.find((a) => a.id === id);
    setEditing(id);
    setDraft({ ...art });
  };

  const handleSave = () => {
    setArticles((arts) => arts.map((a) => (a.id === editing ? { ...draft, id: editing } : a)));
    setEditing(null);
  };

  const handleToggleLanding = (id) => {
    setArticles((arts) => arts.map((a) => (a.id === id ? { ...a, onLanding: !a.onLanding } : a)));
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Supportartikler – Rediger & Publiser</h1>
      <table className="w-full border border-outline-variant rounded-xl overflow-hidden mb-10">
        <thead className="bg-surface-container-low border-b border-outline-variant">
          <tr>
            <th className="px-6 py-4 text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Tittel</th>
            <th className="px-6 py-4 text-center font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Landingsside</th>
            <th className="px-6 py-4 text-center font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Publisert</th>
            <th className="px-6 py-4 text-right font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Handlinger</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {articles.map((art) => (
            <tr key={art.id} className="hover:bg-surface-container-lowest transition-colors">
              <td className="px-6 py-4 font-bold text-on-surface font-headline-sm text-[16px]">{art.title}</td>
              <td className="px-6 py-4 text-center">
                <input type="checkbox" checked={art.onLanding} onChange={() => handleToggleLanding(art.id)} />
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${art.published ? 'bg-primary text-white' : 'bg-outline-variant text-on-surface-variant'}`}>{art.published ? 'Publisert' : 'Utkast'}</span>
              </td>
              <td className="px-6 py-4 text-right space-x-4">
                <button className="text-primary hover:underline font-label-md text-label-md" onClick={() => handleEdit(art.id)}>Rediger</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-8 mb-10">
          <h2 className="font-headline-md text-headline-md text-primary mb-4">Rediger artikkel</h2>
          <input
            className="w-full mb-4 p-3 border border-outline-variant rounded font-headline-sm text-headline-sm"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <textarea
            className="w-full mb-4 p-3 border border-outline-variant rounded font-body-md text-body-md min-h-[120px]"
            value={draft.content || ''}
            onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
            placeholder="Artikkelinnhold (markdown eller rich text)"
          />
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 font-label-md">
              <input type="checkbox" checked={draft.published} onChange={() => setDraft((d) => ({ ...d, published: !d.published }))} />
              Publisert
            </label>
            <label className="flex items-center gap-2 font-label-md">
              <input type="checkbox" checked={draft.onLanding} onChange={() => setDraft((d) => ({ ...d, onLanding: !d.onLanding }))} />
              Vis på landingsside
            </label>
          </div>
          <button className="bg-primary text-white px-6 py-2 rounded font-bold hover:bg-primary-container transition-all mr-4" onClick={handleSave}>Lagre</button>
          <button className="text-outline-variant hover:underline font-label-md text-label-md" onClick={() => setEditing(null)}>Avbryt</button>
        </div>
      )}
    </div>
  );
}
