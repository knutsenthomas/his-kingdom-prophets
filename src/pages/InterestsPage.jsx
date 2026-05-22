import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

const INTERESTS = [
  { id: "ped", name: "Pedagogikk & Didaktikk", icon: "school" },
  { id: "phys", name: "Teoretisk Fysikk", icon: "science" },
  { id: "write", name: "Akademisk Skriving", icon: "edit" },
  { id: "phil", name: "Klassisk Filosofi", icon: "psychology" },
  { id: "hist", name: "Historisk Analyse", icon: "history_edu" },
  { id: "tech", name: "Moderne Datateknologi", icon: "terminal" },
  { id: "math", name: "Avansert Matematikk", icon: "calculate" },
  { id: "stat", name: "Statistiske Metoder", icon: "bar_chart" }
];

export default function InterestsPage() {
  const navigate = useNavigate();
  const { selectedInterests, setSelectedInterests } = useApp();

  const toggleInterest = (id) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selectedInterests.length === 0) return;
    navigate('/complete-profile');
  };

  return (
    <div className="bg-background text-on-background font-sans min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-outline-variant shadow-lg p-5 sm:p-8 md:p-12 text-center flex flex-col">
        
        {/* Progress header */}
        <div className="w-full bg-surface-container rounded-full h-1.5 mb-8">
          <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: '40%' }}></div>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-2xl sm:text-3xl text-primary font-bold mb-4">Dine akademiske interesser</h1>
        <p className="text-on-surface-variant text-sm md:text-base max-w-md mx-auto mb-10">
          Velg minst ett kjerneområde du ønsker å fokusere på under ditt opphold. Dette tilpasser studieplanen din.
        </p>

        {/* Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {INTERESTS.map(interest => {
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`p-5 rounded-xl border flex items-center gap-4 text-left transition-all active:scale-[0.98] ${
                  isSelected 
                    ? 'border-primary bg-primary/5 text-primary shadow-sm font-semibold' 
                    : 'border-outline-variant hover:border-primary/50 text-on-surface'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined">{interest.icon}</span>
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold leading-tight">{interest.name}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-primary border-primary text-white' : 'border-outline'
                }`}>
                  {isSelected && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-6 border-t border-outline-variant">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors py-2"
          >
            Tilbake
          </button>
          <button
            onClick={handleContinue}
            disabled={selectedInterests.length === 0}
            className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all active:scale-[0.98] shadow flex items-center gap-2 ${
              selectedInterests.length > 0 
                ? 'bg-primary text-on-primary hover:opacity-90' 
                : 'bg-surface-container text-outline-variant cursor-not-allowed shadow-none'
            }`}
          >
            Fortsett
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
}
