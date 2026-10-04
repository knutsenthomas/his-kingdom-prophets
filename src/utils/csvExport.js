/**
 * ============================================================================
 * SIKKER CSV-EKSPORT MED BESKYTTELSE MOT FORMELINJEKSJON (CWE-1236)
 * ============================================================================
 * 
 * Følger globale retningslinjer for HKPC og SiteShift:
 * - Semikolon (';') som felt-skilletegn.
 * - UTF-8 BOM (\uFEFF) for sømløs visning i norske Excel-oppsett (æ, ø, å).
 * - Nøytralisering av formelinjeksjon (=, +, -, @, tab, CR, inkludert etter innledende mellomrom/kontrolltegn).
 * - Korrekt RFC 4180-håndtering av anførselstegn, semikolon og linjeskift.
 */

// Regex for å oppdage farlige tegn som regneark kan tolke som formeluttrykk.
// Dekker innledende mellomrom og ASCII-kontrolltegn (0x00-0x1F) foran =, +, -, @, tab eller CR.
const FORMULA_INJECTION_REGEX = /^[\s\x00-\x1f]*[=+\-@\t\r]/;

/**
 * Renser og formaterer en enkelt celleverdi for sikker CSV-serialisering.
 * 
 * @param {any} value - Verdien som skal formateres.
 * @returns {string} - Sitert, sanitert CSV-celle.
 */
export function formatCsvCell(value) {
  if (value === null || value === undefined) {
    return '""';
  }

  // Håndter Date-objekter
  if (value instanceof Date) {
    return `"${value.toLocaleDateString('no-NO')}"`;
  }

  // Håndter tall
  if (typeof value === 'number') {
    if (isNaN(value)) return '""';
    return `"${value}"`;
  }

  // Håndter boolske verdier
  if (typeof value === 'boolean') {
    return value ? '"Ja"' : '"Nei"';
  }

  let str = String(value);

  // Formelinjeksjonsbeskyttelse:
  // Hvis teksten starter med et formeltegn, prefiks med et enkelt apostrof-tegn (')
  // slik at Excel, Google Sheets og LibreOffice tvinger cellen til å forbli ren tekst.
  if (FORMULA_INJECTION_REGEX.test(str)) {
    str = "'" + str;
  }

  // Evaluer anførselstegn: erstatt " med "" iht. RFC 4180
  const escaped = str.replace(/"/g, '""');

  return `"${escaped}"`;
}

/**
 * Serialiserer tabelloverskrifter og rader til en fullstendig, sikker CSV-streng.
 * 
 * @param {string[]} headers - Array med kolonneoverskrifter.
 * @param {any[][]} rows - Todelingsmatrise med celledata.
 * @returns {string} - CSV-innhold med UTF-8 BOM og CRLF linjeskift.
 */
export function serializeToCsv(headers = [], rows = []) {
  const headerLine = headers.map(formatCsvCell).join(';');
  const rowLines = rows.map(row => row.map(formatCsvCell).join(';'));
  
  // UTF-8 BOM (\uFEFF) sikrer at Excel automatisk velger UTF-8 og viser æ, ø, å korrekt
  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
}

/**
 * Trigger en trygg nedlasting av CSV-filen i nettleseren.
 * 
 * @param {string} filename - Filnavn for nedlastingen (f.eks. 'brukere.csv').
 * @param {string} csvContent - CSV-innholdet generert av serializeToCsv.
 */
export function downloadCsvFile(filename, csvContent) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Frigjør minne
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
