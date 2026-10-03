import React from 'react';
import { useApp } from '@/contexts/AppContext';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SeoHead from '@/components/SeoHead';
import {
  LandingHero,
  LandingIntake,
  LandingWelcome,
  LandingPrograms,
  LandingCurriculum,
  LandingAbout,
  LandingResources,
  LandingFaq,
  LandingAdmissions
} from '@/components/landing';
import '@/styles/hkpc-redesign.css';

export default function LandingPage() {
  const { language } = useApp();

  return (
    <div className="hkpc-landing min-h-screen">
      <SeoHead
        title={language === 'no' 
          ? "His Kingdom Prophetic Community | Profetisk Skole & Utrustningssenter"
          : "His Kingdom Prophetic Community | Prophetic School & Equipping Center"}
        description={language === 'no'
          ? "His Kingdom Prophetic Community (HKPC) er en nettbasert bibelskole og åpenbaringsskole for profetisk utrustning, bibelundervisning og åndelig vekst. Bli tryggere i ditt gudgitte kall. Søk opptak for 2027."
          : "Online prophetic school and equipping center for biblical teaching, spiritual growth, and prophetic activation. Secure your calling. Apply for 2027."}
        canonicalPath="/"
        keywords="His Kingdom Prophetic Community, HKPC, profetisk skole, bibelskole, bibelundervisning, profetisk utrustning, Hilde Karin Knutsen, Thomas Knutsen, nådegaver, kristen utdanning"
      />

      {/* Header */}
      <SiteHeader />

      <main>
        <LandingHero />
        <LandingIntake />
        <LandingWelcome />
        <LandingPrograms />
        <LandingCurriculum />
        <LandingAbout />
        <LandingResources />
        <LandingFaq />
        <LandingAdmissions />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
