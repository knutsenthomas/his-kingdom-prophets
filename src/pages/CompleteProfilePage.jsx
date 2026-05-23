import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { School, Briefcase, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, updateUserProfile, showToast } = useApp();
  const [institution, setInstitution] = useState('');
  const [headline, setHeadline] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120');

  // Navigation Guard: Redirect administrators, teachers or already onboarded students
  useEffect(() => {
    if (user && user.email) {
      const email = user.email.toLowerCase();
      if (['thomas@tk-design.no', 'knutsenthomas@gmail.com'].includes(email) || user.role === 'superadmin') {
        navigate('/admin/portal');
      } else if (user.role === 'teacher' || email.includes('teacher') || email.includes('david')) {
        navigate('/teacher/dashboard');
      } else if (user.role === 'admin' || email.includes('admin') || email.includes('siri')) {
        navigate('/admin/cms');
      } else if (user.onboardingCompleted) {
        navigate('/student/dashboard');
      }
    }
  }, [user, navigate]);

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!institution || !headline) {
      showToast("Vennligst fyll ut alle feltene for å fullføre profilen.");
      return;
    }
    try {
      if (updateUserProfile) {
        await updateUserProfile({
          institution,
          headline,
          onboardingCompleted: true
        });
      }
    } catch (err) {
      console.error("Feil ved lagring av profilinfo:", err);
    }
    showToast("Profilen din har blitt oppdatert!");
    navigate('/onboarding-welcome');
  };

  const handleSkip = async () => {
    try {
      if (updateUserProfile) {
        await updateUserProfile({
          onboardingCompleted: true
        });
      }
    } catch (err) {
      console.error("Feil ved skipping av profilinfo:", err);
    }
    navigate('/onboarding-welcome');
  };

  const avatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120', // Student Male
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', // Student Female
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', // Student Male 2
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120', // Teacher Female
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-background">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-12 h-20 w-full max-w-[1440px] mx-auto">
          <div className="font-serif text-2xl font-bold text-primary">His Kingdom Prophets</div>
          <button onClick={handleSkip} className="text-on-surface-variant font-semibold text-xs tracking-wider uppercase hover:text-primary transition-colors active:opacity-80">
            Hopp over
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-12 pb-20 px-6 md:px-0">
        <div className="max-w-[640px] mx-auto w-full">
          {/* Academic Stepper */}
          <div className="mb-12">
            <div className="flex justify-between mb-4">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Steg 3 av 5</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">60% Fullført</span>
            </div>
            <div className="h-1 w-full bg-surface-container-highest relative rounded-full overflow-hidden">
              <div className="absolute h-full bg-primary transition-all duration-500 ease-out" style={{ width: '60%' }}></div>
            </div>
            <div className="flex justify-between mt-4 text-xs font-semibold text-on-surface-variant/60">
              <div className="flex items-center gap-1.5 text-primary">
                <CheckCircle size={14} className="fill-primary text-white" />
                <span>Konto</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary">
                <CheckCircle size={14} className="fill-primary text-white" />
                <span>Identitet</span>
              </div>
              <div className="border-b-2 border-primary pb-1 text-primary">
                <span>Profilinfo</span>
              </div>
              <div className="opacity-40">
                <span>Tjenester</span>
              </div>
              <div className="opacity-40">
                <span>Godkjenning</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl md:text-4xl text-on-surface mb-4 font-bold">Fullfør din profil</h1>
            <p className="text-body-lg text-on-surface-variant">
              Dine åndelige detaljer hjelper mentorene våre med å gi deg den beste veiledningen og koble deg med de rette bønnegruppene.
            </p>
          </div>

          {/* Form Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-lg shadow-primary/5 p-5 sm:p-8 md:p-10 rounded-xl border border-outline-variant"
          >
            <form onSubmit={handleContinue} className="space-y-8">
              
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full bg-surface-container-low border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                    <img 
                      src={avatar} 
                      alt="Profilbilde" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow hover:bg-primary-container transition-colors cursor-pointer">
                    <CheckCircle size={14} />
                  </div>
                </div>

                <div className="text-center w-full">
                  <label className="text-xs font-bold text-on-surface-variant tracking-wider uppercase block mb-2">Velg profilbilde</label>
                  <div className="flex justify-center gap-3">
                    {avatars.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(av)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${avatar === av ? 'border-primary shadow' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={av} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input: Institution */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider" htmlFor="institution">
                  Menighetstilknytning / fellesskap
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    <School size={20} />
                  </span>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary transition-all text-sm outline-none font-medium"
                    id="institution" 
                    placeholder="f.eks. Huskirke, menighet eller misjonsfellesskap" 
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Input: Headline */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider" htmlFor="headline">
                  Din tjenestegave / kall
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    <Briefcase size={20} />
                  </span>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary transition-all text-sm outline-none font-medium"
                    id="headline" 
                    placeholder="f.eks. Profetisk aspirant, lovsangsleder, sjelesørger, pastor" 
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-outline px-1">Beskriv kort din åndelige tjeneste eller ditt kall.</p>
              </div>

              {/* Peer Connect Highlight */}
              <div className="bg-surface-container-low p-4 rounded-lg flex gap-4 items-start border-l-4 border-primary">
                <Users className="text-primary shrink-0" size={20} />
                <div>
                  <p className="text-xs text-on-surface font-bold">Hvorfor er dette viktig?</p>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Ved å spesifisere ditt kall kan plattformen koble deg sammen med relevante mentornettverk som Apostel David Hansen, bønnegrupper og tilpassede læringsløp.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => navigate('/interests')}
                  className="flex-1 border border-primary text-primary font-bold py-4 px-8 rounded-lg hover:bg-surface-container-low transition-all order-2 sm:order-1 active:scale-[0.98] duration-150" 
                  type="button"
                >
                  Tilbake
                </button>
                <button 
                  className="flex-1 bg-primary text-white font-bold py-4 px-8 rounded-lg hover:bg-primary-container transition-all order-1 sm:order-2 shadow-lg shadow-primary-container/20 active:scale-[0.98] duration-150" 
                  type="submit"
                >
                  Fortsett
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant py-8">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 w-full max-w-[1440px] mx-auto text-xs text-on-surface-variant">
          <div className="font-serif text-lg font-bold text-primary mb-4 md:mb-0">His Kingdom Prophets</div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <nav className="flex gap-4">
              <a className="hover:underline transition-all" href="#privacy">Personvern</a>
              <a className="hover:underline transition-all" href="#terms">Vilkår</a>
              <a className="hover:underline transition-all" href="#help">Hjelpesenter</a>
            </nav>
            <p className="text-secondary mt-2 md:mt-0">© 2026 His Kingdom Prophets. Utrustning av profetiske tjenester for menigheten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
