import React from 'react';
import { ArrowUpRight, Heart } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import SiteText from '@/components/SiteText';
import './school-campaign-link.css';

export default function SchoolCampaignLink({ compact = false }) {
  const { language } = useApp();
  const no = language === 'no';
  const href = `https://hiskingdomministry.no/${no ? 'donasjoner' : 'en/donations'}?aksjon=oppstart-av-profetisk-bibelskole`;
  const text = no ? 'Støtt oppstartssamlingen 2027' : 'Support the 2027 opening gathering';
  if (compact) return <a className="school-campaign-link" href={href} target="_blank" rel="noopener noreferrer"><SiteText fallback={text} /><ArrowUpRight size={17} aria-hidden="true" /></a>;
  return <section className="school-campaign-card" aria-label={text}>
    <Heart size={24} aria-hidden="true" />
    <h3><SiteText fallback={no ? 'Gi flere en god start.' : 'Help more students get a good start.'} /></h3>
    <p><SiteText fallback={no ? 'Hjelp oss å samle studenter og stab til oppstartshelgen i august 2027. Dette er en frivillig gave til innsamlingen, i tillegg til skoleavgiften.' : 'Help bring students and staff together for the opening weekend in August 2027. This is a voluntary gift to the fundraiser, separate from tuition fees.'} /></p>
    <a className="school-campaign-button" href={href} target="_blank" rel="noopener noreferrer"><SiteText fallback={text} /><ArrowUpRight size={18} aria-hidden="true" /></a>
  </section>;
}
