import React from 'react';
import SupportArticleLayout from '@/pages/support-articles/SupportArticleLayout';

export default function ArtikkelZoom() {
  return (
    <SupportArticleLayout
      title="Feilsøking ved Zoom- og videostrømmer"
      breadcrumbs={[
        { label: 'Hjelpesenter', href: '#' },
        { label: 'Teknisk støtte', href: '#' },
        { label: 'Videostrømmer', active: true }
      ]}
      relatedArticles={[
        { title: 'Slik setter du opp din første Zoom-time', href: '#', meta: 'Lestid: 4 min' },
        { title: 'Krav til nettleser og maskinvare', href: '#', meta: 'Lestid: 3 min' },
        { title: 'Feilsøking av skjermdeling', href: '#', meta: 'Lestid: 5 min' }
      ]}
      cta={
        <div className="bg-primary text-on-primary rounded-xl p-6 relative overflow-hidden mt-10">
          <div className="relative z-10">
            <h4 className="font-headline-sm text-headline-sm mb-2">Trenger du direkte hjelp?</h4>
            <p className="text-body-sm opacity-90 mb-6">Våre supportagenter er tilgjengelige mandag til fredag, 08:00 - 16:00.</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>chat</span>
                <span className="text-body-sm">Start en live-chat</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>mail</span>
                <span className="text-body-sm">support@scholastic.no</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-container rounded-full opacity-50 blur-xl"></div>
        </div>
      }
    >
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 leading-relaxed">
        Opplever du forsinkelser, hakking eller manglende lyd under dine live-økter? Her er en trinnvis guide for å løse de vanligste problemene knyttet til videostrømming i Scholastic Premium.
      </p>
      <section className="space-y-12 font-academic-serif">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 border-l-4 border-primary-container pl-4">1. Kontroller Internett-tilkoblingen din</h3>
          <p className="text-body-md mb-4 leading-relaxed">De fleste problemer med videostrømming skyldes ustabil båndbredde. For en sømløs 1080p-opplevelse anbefaler vi minst 5 Mbps opp- og nedlasting.</p>
          <ul className="list-disc ml-6 space-y-2 text-on-surface-variant">
            <li>Bytt fra Wi-Fi til en kablet Ethernet-tilkobling hvis mulig.</li>
            <li>Lukk andre faner og applikasjoner som bruker mye data (f.eks. Netflix, YouTube, Spotify).</li>
            <li>Be andre i husstanden om å begrense strømming mens du er i en live-økt.</li>
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-xl h-[300px] my-10 group">
          <img alt="Troubleshooting technical issues" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCppVYnO96jy7G7pjjQBRS2YMArVtoKBone0jhMyeohvL0AZUzQtAc1vQhyOv-DX3ObFb57nYFdrAH2iZzK60y8LWYn3DG2034FKUiW1vTyieySMFYDTs2mkOfS6D9hsEUyonLxW6i_7KuCcboaNoxlQFD1GfTm24oiaVgRZdjpWyErJx1gWZ0torslCvOEamaa2V1zx13TKsVxDPfgzm7DUQ9zKymf7JZ1BMR4Amgj342_E1ge25C_iaw06sfnvQYNx9a9eBQeX6Y" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-6">
            <span className="text-on-primary font-label-md italic">Kontroller alltid maskinvareinnstillingene før sesjonen starter.</span>
          </div>
        </div>
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 border-l-4 border-primary-container pl-4">2. Problemer med lyd (Ingen lyd eller mikrofonfeil)</h3>
          <p className="text-body-md mb-4 leading-relaxed">Hvis andre ikke kan høre deg, eller du ikke hører dem, sjekk følgende:</p>
          <div className="bg-surface-container-low p-6 rounded-lg space-y-4">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary">mic</span>
              <div>
                <p className="font-bold">Sjekk mikrofontilgang:</p>
                <p className="text-body-sm text-on-surface-variant">Gå til nettleserinnstillingene dine og sørg for at Scholastic Premium har tillatelse til å bruke mikrofonen.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary">volume_up</span>
              <div>
                <p className="font-bold">Utdataenhet:</p>
                <p className="text-body-sm text-on-surface-variant">I Zoom-menyen, klikk på pilen ved siden av mikrofonikonet og bekreft at riktig høyttaler eller hodetelefon er valgt.</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 border-l-4 border-primary-container pl-4">3. Optimalisering av Zoom-innstillinger</h3>
          <p className="text-body-md mb-4 leading-relaxed">Noen ganger kan "High Definition"-video skape unødvendig belastning på eldre maskiner.</p>
          <ol className="list-decimal ml-6 space-y-3 text-on-surface-variant">
            <li>Åpne Zoom-appen og gå til <b>Innstillinger &gt; Video</b>.</li>
            <li>Fjern avkrysningen for <b>"Enable HD"</b> for å redusere båndbreddebruken.</li>
            <li>Aktiver <b>"Always display participant name on their videos"</b> for bedre oversikt i store klasserom.</li>
          </ol>
        </div>
      </section>
    </SupportArticleLayout>
  );
}
