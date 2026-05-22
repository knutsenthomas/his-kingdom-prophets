import React from 'react';

export default function Artikkel5Veiledning() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-serif font-bold mb-4 text-primary">Hvordan bestille digital veiledningstid</h1>
      <p className="mb-4">Lær å koble deg opp på faglærers kontortid og starte din private videosamtale.</p>
      <ol className="list-decimal ml-6 space-y-2 mb-4">
        <li>Gå til "Veiledning" i hovedmenyen.</li>
        <li>Velg ønsket mentor og tilgjengelig tid.</li>
        <li>Bestill tid og motta bekreftelse på e-post.</li>
        <li>Koble deg opp via lenken i kalenderen når tiden er inne.</li>
      </ol>
      <p>Avbestill i god tid hvis du ikke kan møte til avtalt veiledning.</p>
    </div>
  );
}
