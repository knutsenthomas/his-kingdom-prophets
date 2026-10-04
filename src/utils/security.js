/**
 * ============================================================================
 * SIKKERHETSHJELPERE FOR HTML- OG INJEKSJONSBESKYTTELSE
 * ============================================================================
 * 
 * Beskytter mot:
 * - HTML-injeksjon og Cross-Site Scripting (XSS / CWE-79) i e-postvarsler og visninger.
 * - E-post header-injeksjon (CWE-93) via emnefelter eller avsendernavn.
 */

/**
 * HTML-enkoder spesialtegn for å forhindre HTML-injeksjon og XSS.
 * &, <, >, ", '
 * 
 * @param {any} str - Inndatatekst som skal kodes.
 * @returns {string} - HTML-sikret tekst.
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * HTML-enkoder tekst og konverterer linjeskift til sikre <br />-tagger.
 * Dette bevarer formatering fra tekstfelter uten risiko for injeksjon av HTML-elementer.
 * 
 * @param {any} str - Inndatatekst som kan inneholde linjeskift.
 * @returns {string} - Sikker HTML-streng med <br /> for linjeskift.
 */
export function escapeHtmlWithLineBreaks(str) {
  if (str === null || str === undefined) return '';
  return escapeHtml(str).replace(/\r?\n/g, '<br />');
}

/**
 * Renser e-postadresser for farlige kontrolltegn og linjeskift.
 * 
 * @param {any} email - E-postadresse som skal renses.
 * @returns {string} - Renset e-postadresse.
 */
export function sanitizeEmail(email) {
  if (!email) return '';
  return String(email).replace(/[\r\n\t\x00-\x1f]/g, '').trim();
}

/**
 * Nøytraliserer e-post-emne og headerlinjer mot CRLF-injeksjon.
 * 
 * @param {any} text - Emnetekst.
 * @returns {string} - Rense emnetekst på én linje.
 */
export function sanitizeEmailSubject(text) {
  if (!text) return '';
  return String(text).replace(/[\r\n\x00-\x1f]+/g, ' ').trim();
}
