import React from 'react';
import { Link } from 'react-router-dom';

export default function SupportArticleLayout({
  title,
  breadcrumbs = [],
  featuredImage,
  children,
  relatedArticles = [],
  cta,
  feedback
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-12 w-full min-h-screen bg-surface text-on-surface font-body-md">
      {/* Main Content */}
      <main className="flex-1 max-w-[800px] mx-auto pt-24 pb-20 px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-on-surface-variant text-label-md font-label-md">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span className="material-symbols-outlined text-[16px] align-middle">chevron_right</span>
              )}
              {bc.to ? (
                <Link to={bc.to} className="hover:text-primary transition-colors">{bc.label}</Link>
              ) : bc.href ? (
                <a href={bc.href} className="hover:text-primary transition-colors">{bc.label}</a>
              ) : (
                <span className={bc.active ? 'font-bold text-primary' : ''}>{bc.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
        <article>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-6 font-headline-md">{title}</h2>
          {featuredImage && (
            <div className="mb-12 rounded-xl overflow-hidden border border-outline-variant bg-surface-container">
              <img src={featuredImage.src} alt={featuredImage.alt} className="w-full h-[400px] object-cover" />
            </div>
          )}
          <div className="font-serif-editor text-body-lg text-on-surface-variant leading-relaxed mb-10 article-content">
            {children}
          </div>
          {cta}
        </article>
        {feedback}
      </main>
      {/* Sticky Right Sidebar on desktop */}
      <aside className="w-full lg:w-[320px] space-y-8 lg:pt-24 pb-20 px-8 lg:sticky lg:top-24 lg:self-start">
        {relatedArticles.length > 0 && (
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4 border-b border-outline-variant pb-2">Relaterte artikler</h4>
            <ul className="space-y-4">
              {relatedArticles.map((ra, idx) => (
                <li key={idx}>
                  <a className="group block" href={ra.href}>
                    <span className="font-body-md text-body-md text-primary group-hover:underline block leading-tight mb-1">{ra.title}</span>
                    <span className="font-label-md text-label-md text-on-surface-variant">{ra.meta}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
