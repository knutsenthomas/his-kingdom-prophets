import React from 'react';

export default function Artikkel1LoggInn() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-serif font-bold mb-4 text-primary">Slik logger du på for første gang</h1>
      <p className="mb-4">En rask innføring i pålogging med e-post, Google eller Apple, samt utfylling av din tjenesteprofil.</p>
      <ol className="list-decimal ml-6 space-y-2 mb-4">
        <li>Gå til innloggingssiden og velg ønsket metode (e-post, Google eller Apple).</li>
        <li>Følg instruksjonene for å bekrefte identiteten din.</li>
        <li>Første gang du logger inn, blir du bedt om å fylle ut din tjenesteprofil.</li>
        <li>Lagre endringene for å komme i gang med plattformen.</li>
      </ol>
      <p>Har du problemer med innlogging? Kontakt support nederst på hjelpesiden.</p>
    </div>
  );
}
