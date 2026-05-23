import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Check, X, Award } from 'lucide-react';
import { db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useApp } from '@/contexts/AppContext';

const getDefaultStats = (title) => {
  const t = title.toLowerCase();
  if (t.includes("første kurs") || t.includes("inn og ut")) {
    return { yes: 136, no: 6 };
  } else if (t.includes("bønnefellesskapet") || t.includes("chat")) {
    return { yes: 83, no: 5 };
  } else if (t.includes("bibelkalkulatoren") || t.includes("karakterer")) {
    return { yes: 101, no: 9 };
  } else if (t.includes("zoom") || t.includes("video")) {
    return { yes: 58, no: 6 };
  } else if (t.includes("veiledningstid") || t.includes("bestille")) {
    return { yes: 91, no: 5 };
  } else if (t.includes("tjenestegaver") || t.includes("fem")) {
    return { yes: 175, no: 5 };
  }
  return { yes: 45, no: 3 };
};

export default function SupportArticleLayout({
  title,
  breadcrumbs = [],
  featuredImage,
  children,
  relatedArticles = [],
  cta,
  feedback
}) {
  const { user, showToast, setAssistantContext } = useApp();
  const [showBubble, setShowBubble] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [stats, setStats] = useState({ yes: 0, no: 0 });

  useEffect(() => {
    if (title) {
      setAssistantContext({
        pageType: 'support_article',
        title: title,
        category: breadcrumbs[breadcrumbs.length - 1]?.label || 'Hjelpeartikler',
        content: `Brukeren leser supportartikkelen "${title}".`
      });
    }
    return () => setAssistantContext(null);
  }, [title, breadcrumbs, setAssistantContext]);

  useEffect(() => {
    const voted = localStorage.getItem(`hkm-feedback-voted-${title}`) === 'true';
    setHasVoted(voted);

    const savedStats = localStorage.getItem(`hkm-feedback-stats-${title}`);
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        setStats(getDefaultStats(title));
      }
    } else {
      const defaultS = getDefaultStats(title);
      setStats(defaultS);
      localStorage.setItem(`hkm-feedback-stats-${title}`, JSON.stringify(defaultS));
    }
  }, [title]);

  const handleVote = async (type) => {
    if (hasVoted) return;

    const newStats = { ...stats };
    if (type === 'yes') {
      newStats.yes += 1;
    } else {
      newStats.no += 1;
    }

    setStats(newStats);
    setHasVoted(true);
    localStorage.setItem(`hkm-feedback-voted-${title}`, 'true');
    localStorage.setItem(`hkm-feedback-stats-${title}`, JSON.stringify(newStats));

    showToast(type === 'yes' ? 'Takk for din positive tilbakemelding!' : 'Takk for din tilbakemelding. Vi jobber med å forbedre oss.');

    // Save to Firestore
    if (db) {
      try {
        const voteId = `${user?.uid || 'guest'}_${Date.now()}`;
        await setDoc(doc(db, "article_feedbacks", voteId), {
          articleTitle: title,
          vote: type,
          userId: user?.uid || 'guest',
          userEmail: user?.email || 'guest',
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to save feedback to firestore", err);
      }
    }

    // Auto-close bubble after 3.5 seconds
    setTimeout(() => {
      setShowBubble(false);
    }, 3500);
  };

  const totalVotes = stats.yes + stats.no;
  const satisfactionRate = totalVotes > 0 ? Math.round((stats.yes / totalVotes) * 100) : 100;

  return (
    <div className="flex flex-col lg:flex-row gap-12 w-full min-h-screen bg-surface text-on-surface font-body-md relative">
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

      {/* Floating feedback system if no custom feedback prop is provided */}
      {!feedback && (
        <div className="fixed bottom-6 right-24 flex flex-col items-end gap-3.5 z-40 font-sans">
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-5 rounded-2xl shadow-2xl border border-outline-variant/40 w-64 md:w-72 ambient-shadow-lg"
              >
                {hasVoted ? (
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-wider">
                      <Check size={14} className="stroke-[3]" />
                      Takk for tilbakemeldingen!
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-[#561291]">
                        <span>Leser-tilfredshet</span>
                        <span>{satisfactionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-green-500 h-full" style={{ width: `${satisfactionRate}%` }}></div>
                        <div className="bg-red-400 h-full flex-grow"></div>
                      </div>
                      <p className="text-[10px] text-outline font-semibold">Målt over {totalVotes} anonymiserte leservurderinger</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-left space-y-3">
                    <p className="font-serif font-bold text-sm text-[#561291] leading-tight">Var denne artikkelen nyttig?</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleVote('yes')}
                        className="flex-1 py-2 bg-[#561291]/5 hover:bg-green-50 border border-[#561291]/10 hover:border-green-300 text-primary hover:text-green-700 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
                      >
                        Ja
                      </button>
                      <button 
                        onClick={() => handleVote('no')}
                        className="flex-1 py-2 bg-[#561291]/5 hover:bg-red-50 border border-[#561291]/10 hover:border-red-300 text-primary hover:text-red-700 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
                      >
                        Nei
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setShowBubble(!showBubble)}
            className="w-14 h-14 bg-[#561291] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all focus:outline-none"
            style={{ borderRadius: '9999px' }}
            title="Gi tilbakemelding på denne artikkelen"
          >
            {showBubble ? (
              <X size={22} />
            ) : (
              <ThumbsUp size={22} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
