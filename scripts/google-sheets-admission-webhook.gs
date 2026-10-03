/**
 * ============================================================================
 * HIS KINGDOM PROPHETIC COMMUNITY (HKPC) - OPPTAKSWEBHOOK & E-POSTVARSLER
 * ============================================================================
 * 
 * Dette skriptet settes inn i Google Apps Script tilknyttet skolens Google Regneark:
 * 1. Åpne Google Regneark for opptak
 * 2. Gå til "Utvidelser" (Extensions) -> "Apps Script"
 * 3. Erstatt koden i Code.gs med koden i denne filen
 * 4. Klikk "Distribuer" (Deploy) -> "Administrer distribusjoner" -> Rediger -> "Ny versjon" -> Distribuer
 * 
 * Skriptet utfører:
 * - Sikker mottak av søknadsdata fra nettsiden (hkpc.no/admission)
 * - Automatisk opprettelse av overskrifter i regnearket hvis tomt
 * - Logging av hver søker på en ny rad
 * - Utsendelse av lekker HTML-epost til school@hiskingdomministry.no i nøyaktig
 *   samme designstil som HKPC-nettsiden (#561291 lilla, #D7B978 gull, bento-kort og logo)
 * - Direkte lenke tilbake til regnearket fra e-posten
 */

const RECIPIENT_EMAIL = "school@hiskingdomministry.no";
const SENDER_NAME = "His Kingdom Prophetic Community";

/**
 * Hovedfunksjon for HTTP POST (Web App Webhook)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Vent i opptil 10 sekunder på lås for å unngå samtidige kollisjoner
  lock.tryLock(10000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ 
        result: "error", 
        message: "Ingen data mottatt i postData" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getActiveSheet();
    var sheetUrl = spreadsheet.getUrl();

    // 1. Initialiser overskrifter dersom regnearket er helt tomt
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Tidspunkt",
        "Søknads-ID",
        "Navn",
        "E-post",
        "Telefon",
        "Fødselsdato",
        "Kjønn",
        "Sivilstatus",
        "Adresse",
        "Yrke/Utdanning",
        "Studielinje",
        "Programkode",
        "Betalingsplan",
        "Menighetstilhørighet",
        "Nåværende tjeneste",
        "Kall / Tjenesteønske",
        "Hvorfor bibelskole",
        "Forventninger",
        "Erfaring / Vandring med Jesus",
        "Drømmer og visjoner",
        "Hobbyer / Interesser",
        "Hvordan hørt om HKPC",
        "Oppgitt referanse",
        "Tilleggsopplysninger",
        "Status"
      ]);

      // Formater overskriftsraden med lilla bakgrunn og hvit tekst
      var headerRange = sheet.getRange(1, 1, 1, 25);
      headerRange.setBackground("#561291");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // 2. Formater tidsstempel for Norge/Oslo
    var nowOslo = Utilities.formatDate(new Date(), "Europe/Oslo", "dd.MM.yyyy HH:mm:ss");

    // 3. Legg til søknadsraden
    sheet.appendRow([
      nowOslo,
      data.id || "",
      data.name || "",
      data.email || "",
      data.phone || "",
      data.birthDate || "",
      data.gender || "",
      data.maritalStatus || "",
      data.address || "",
      data.occupation || "",
      data.programTitle || "His Kingdom Prophetic Community (1. År)",
      data.programCode || "1. ÅR",
      data.paymentPlan === "year" ? "Fullt studieår" : "Semesterfaktura",
      data.churchCommunity || "",
      data.currentMinistry || "",
      data.ministryCalling || "",
      data.whySeeking || "",
      data.expectations || "",
      data.testimony || "",
      data.dreamsVision || "",
      data.hobbies || "",
      data.howHeard || "",
      data.reference || "",
      data.additionalNotes || "",
      data.status || "pending_review"
    ]);

    // 4. Send designet e-post til administrasjonen
    sendBrandedNotificationEmail(data, sheetUrl, nowOslo);

    return ContentService.createTextOutput(JSON.stringify({ 
      result: "success", 
      id: data.id || "ok",
      timestamp: nowOslo
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Feil i doPost: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Sender lekker HTML-epost til skolen
 */
function sendBrandedNotificationEmail(data, sheetUrl, nowFormatted) {
  var applicantName = (data.name || "Ny søker").trim();
  var subject = "[HKPC Opptak] Ny søknad fra " + applicantName;
  var htmlContent = buildEmailTemplateHtml(data, sheetUrl, nowFormatted);
  var plainTextContent = buildPlainTextSummary(data, sheetUrl, nowFormatted);

  MailApp.sendEmail({
    to: RECIPIENT_EMAIL,
    name: SENDER_NAME,
    replyTo: (data.email && data.email.indexOf("@") !== -1) ? data.email.trim() : RECIPIENT_EMAIL,
    subject: subject,
    htmlBody: htmlContent,
    body: plainTextContent
  });
}

/**
 * Hjelpefunksjon for å unnslippe HTML-spesialtegn (XSS-sikkerhet)
 */
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Bygger ren, moderne HTML i samme formspråk som nettsiden (hkpc.no)
 */
function buildEmailTemplateHtml(data, sheetUrl, nowFormatted) {
  var name = escapeHtml(data.name || "Søker");
  var email = escapeHtml(data.email || "");
  var phone = escapeHtml(data.phone || "");
  var birthDate = escapeHtml(data.birthDate || "-");
  var gender = escapeHtml(data.gender || "-");
  var maritalStatus = escapeHtml(data.maritalStatus || "-");
  var address = escapeHtml(data.address || "-");
  var occupation = escapeHtml(data.occupation || "-");
  var programTitle = escapeHtml(data.programTitle || "His Kingdom Prophetic Community (1. År)");
  var programCode = escapeHtml(data.programCode || "1. ÅR");
  var paymentPlan = data.paymentPlan === "year" 
    ? "Fullt studieår (10 000,- / $1,000 USD)" 
    : "Semesterfaktura (5 000,- / $500 USD per sem)";
  var churchCommunity = escapeHtml(data.churchCommunity || "-");
  var currentMinistry = escapeHtml(data.currentMinistry || "-");
  var ministryCalling = escapeHtml(data.ministryCalling || "-");
  var whySeeking = escapeHtml(data.whySeeking || "");
  var expectations = escapeHtml(data.expectations || "");
  var testimony = escapeHtml(data.testimony || "");
  var reference = escapeHtml(data.reference || "-");
  var regnearkUrl = sheetUrl || "https://docs.google.com/spreadsheets";
  var timeText = nowFormatted || Utilities.formatDate(new Date(), "Europe/Oslo", "dd.MM.yyyy HH:mm:ss");

  return `<!DOCTYPE html>
<html lang="no" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ny søknad fra ${name} - HKPC Opptak</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, h1, h2, h3, p, a, span { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 12px !important;
      }
      .mobile-padding {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
      .mobile-header-padding {
        padding: 20px 16px !important;
      }
      .mobile-field-label {
        width: 110px !important;
        font-size: 13px !important;
      }
      .mobile-field-val {
        font-size: 13px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F4F8; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #271F30;">

  <!-- Pre-header Preview Text (Vises i e-postklientens forhåndsvisningsfelt) -->
  <div style="display: none; font-size: 1px; color: #F6F4F8; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    En ny søknad fra ${name} til ${programTitle} er mottatt. Åpne e-posten for detaljer og lenke til Google Regneark.
    &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy;
  </div>

  <!-- Ytre tabellramme -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F6F4F8; margin: 0; padding: 20px 8px 40px 8px;">
    <tr>
      <td align="center">

        <!-- Hovedkort (Maks 600px, 20px avrunding, subtil skygge) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="width: 100%; max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2DCE7; box-shadow: 0 10px 30px rgba(86, 18, 145, 0.07);">
          
          <!-- Header Banner med HKPC-logo og merkevaretittel -->
          <tr>
            <td class="mobile-header-padding" style="background-color: #561291; border-top: 4px solid #D7B978; padding: 26px 28px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="52" valign="middle" style="padding-right: 14px;">
                    <img src="https://hkpc.no/logo.png" alt="HKPC Logo" width="48" height="48" style="display: block; border-radius: 50%; border: 2px solid #D7B978; background-color: #FFFFFF; object-fit: contain;">
                  </td>
                  <td valign="middle">
                    <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 19px; font-weight: 700; color: #FFFFFF; line-height: 24px; letter-spacing: 0.01em;">
                      His Kingdom Prophetic Community
                    </div>
                    <div style="font-size: 10px; font-weight: 600; color: #D7B978; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2px;">
                      Profetisk Skole &amp; Utrustningssenter
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Innholdsdel -->
          <tr>
            <td class="mobile-padding" style="padding: 28px 24px 20px 24px;">

              <!-- Status Pill Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: #FBF5E7; border: 1px solid #D7B978; border-radius: 9999px; padding: 5px 14px; font-size: 11px; font-weight: 700; color: #561291; text-transform: uppercase; letter-spacing: 0.08em;">
                    ✦ Ny søknad om opptak
                  </td>
                </tr>
              </table>

              <!-- Tittel -->
              <h1 style="margin: 0 0 10px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; line-height: 32px; font-weight: 700; color: #271F30;">
                Ny søknad fra ${name}
              </h1>

              <p style="margin: 0 0 22px 0; font-size: 15px; line-height: 24px; color: #6D6575;">
                Det har kommet inn en ny søknad om opptak ved <strong>HKPC</strong>! Søknaden er automatisk lagt til i Google Regneark. Nedenfor finner du nøkkelopplysningene:
              </p>

              <!-- BENTO KORT 1: Personalia & Kontaktinfo -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8FC; border: 1px solid #EAE6EF; border-radius: 14px; margin-bottom: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #561291; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; border-bottom: 1px solid #EAE6EF; padding-bottom: 8px;">
                      1. Personalia &amp; Kontaktinformasjon
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 22px;">
                      <tr>
                        <td width="130" valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Fullt navn:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30; font-weight: 700;">${name}</td>
                      </tr>
                      <tr>
                        <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">E-postadresse:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0;">
                          <a href="mailto:${email}" style="color: #561291; font-weight: 600; text-decoration: underline;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Telefon:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0;">
                          <a href="tel:${phone}" style="color: #561291; font-weight: 600; text-decoration: none;">${phone}</a>
                        </td>
                      </tr>
                      <tr>
                        <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Fødselsdato:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${birthDate}</td>
                      </tr>
                      <tr>
                        <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Kjønn / Sivil:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${gender} • ${maritalStatus}</td>
                      </tr>
                      <tr>
                        <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Adresse / Sted:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${address}</td>
                      </tr>
                      <tr>
                        <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Yrke / Utdanning:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${occupation}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- BENTO KORT 2: Studielinje & Rammer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8FC; border: 1px solid #EAE6EF; border-radius: 14px; margin-bottom: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #561291; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; border-bottom: 1px solid #EAE6EF; padding-bottom: 8px;">
                      2. Studielinje &amp; Praktiske Rammer
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 22px;">
                      <tr>
                        <td width="130" valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Studielinje:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30; font-weight: 700;">
                          ${programTitle} 
                          <span style="display: inline-block; background-color: #561291; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 4px; margin-left: 4px; text-transform: uppercase; letter-spacing: 0.04em;">${programCode}</span>
                        </td>
                      </tr>
                      <tr>
                        <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Betalingsordning:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30; font-weight: 600;">${paymentPlan}</td>
                      </tr>
                      <tr>
                        <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Språk &amp; Kickoff:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">Godtatt (Engelsk undervisning + Kickoff i Norge 20.–22. aug 2027)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- BENTO KORT 3: Menighet, Tjeneste & Referanse -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8FC; border: 1px solid #EAE6EF; border-radius: 14px; margin-bottom: 22px; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #561291; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; border-bottom: 1px solid #EAE6EF; padding-bottom: 8px;">
                      3. Bakgrunn, Tjeneste &amp; Referanse
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 22px;">
                      <tr>
                        <td width="130" valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Menighet:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${churchCommunity}</td>
                      </tr>
                      <tr>
                        <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Nåværende tjeneste:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${currentMinistry}</td>
                      </tr>
                      <tr>
                        <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Kall / nådegave:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30;">${ministryCalling}</td>
                      </tr>
                      <tr>
                        <td valign="top" class="mobile-field-label" style="padding: 4px 0; color: #6D6575; font-weight: 500;">Oppgitt referanse:</td>
                        <td valign="top" class="mobile-field-val" style="padding: 4px 0; color: #271F30; font-weight: 700;">${reference}</td>
                      </tr>
                    </table>

                    ${testimony || whySeeking ? `
                    <div style="margin-top: 14px; padding: 12px 16px; background-color: #FFFFFF; border-left: 3px solid #561291; border-radius: 0 10px 10px 0; font-size: 13px; line-height: 20px; color: #464554; font-style: italic;">
                      &ldquo;${testimony || whySeeking}&rdquo;
                    </div>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Call to Action Box (Regneark-knapp) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #FAF8FC 0%, #F5EEFC 100%); border: 1px solid #E2DCE7; border-radius: 16px; margin-bottom: 6px;">
                <tr>
                  <td style="padding: 24px 20px; text-align: center;">
                    <div style="font-size: 13px; font-weight: 600; color: #561291; margin-bottom: 6px;">
                      Fullstendig søknadsdokumentasjon
                    </div>
                    <div style="font-size: 14px; color: #464554; line-height: 20px; margin-bottom: 18px;">
                      Åpne Google Regneark for å se hele søknaden med vitnesbyrd, drømmer og referanser.
                    </div>
                    
                    <!-- Bulletproof CTA-knapp for e-postklienter -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td align="center" style="border-radius: 12px; background-color: #561291;">
                          <a href="${regnearkUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.05em; min-height: 44px; line-height: 20px; box-sizing: border-box;">
                            Åpne Google Regneark &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- E-post Footer -->
          <tr>
            <td style="background-color: #FAF8FC; border-top: 1px solid #EAE6EF; padding: 22px 24px; text-align: center;">
              <div style="font-size: 12px; font-weight: 700; color: #561291; margin-bottom: 4px;">
                His Kingdom Prophetic Community (HKPC)
              </div>
              <div style="font-size: 11px; color: #6D6575; line-height: 18px; margin-bottom: 8px;">
                Offisiell søknadsportal: <a href="https://hkpc.no" target="_blank" style="color: #561291; text-decoration: underline;">hkpc.no</a> • Kontakt: <a href="mailto:school@hiskingdomministry.no" style="color: #561291; text-decoration: underline;">school@hiskingdomministry.no</a>
              </div>
              <div style="font-size: 10px; color: #8F8B99;">
                Mottatt: ${timeText} • Dette er et automatisk generert opptaks-varsel.
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Genererer ren tekst-oppsummering dersom e-postklienten ikke støtter HTML
 */
function buildPlainTextSummary(data, sheetUrl, nowFormatted) {
  var name = data.name || "Ny søker";
  var email = data.email || "-";
  var phone = data.phone || "-";
  var programTitle = data.programTitle || "His Kingdom Prophetic Community (1. År)";
  var programCode = data.programCode || "1. ÅR";
  var paymentPlan = data.paymentPlan === "year" ? "Fullt studieår" : "Semesterfaktura";
  var regnearkUrl = sheetUrl || "https://docs.google.com/spreadsheets";

  return "Det har kommet inn en ny søknad om opptak ved HKPC!\n\n" +
    "Navn: " + name + "\n" +
    "E-post: " + email + "\n" +
    "Telefon: " + phone + "\n" +
    "Studielinje: " + programTitle + " (" + programCode + ")\n" +
    "Betalingsordning: " + paymentPlan + "\n\n" +
    "Åpne Google Regneark for å se hele søknaden med vitnesbyrd og referanser:\n" +
    regnearkUrl + "\n\n" +
    "--\n" +
    "His Kingdom Prophetic Community (HKPC)\n" +
    "https://hkpc.no • school@hiskingdomministry.no\n" +
    "Mottatt: " + (nowFormatted || "");
}

/**
 * Testfunksjon som kan kjøres direkte inne i Google Apps Script-editoren
 * for å sende en verifiserings-epost til school@hiskingdomministry.no.
 */
function testSendBrandedEmail() {
  var sample = {
    name: "Thomas Verifiseringstest",
    email: "school@hiskingdomministry.no",
    phone: "+47 900 00 000",
    birthDate: "1992-04-18",
    gender: "Mann",
    maritalStatus: "Gift",
    address: "Kristiansand, Norge",
    occupation: "Utvikler & Veileder",
    programTitle: "His Kingdom Prophetic Community (1. År)",
    programCode: "1. ÅR",
    paymentPlan: "semester",
    churchCommunity: "Menighetsfellesskap",
    currentMinistry: "Lovsang og forbønn",
    ministryCalling: "Profetisk formidling",
    whySeeking: "Dypere fellesskap og utrustning i åndelige gaver.",
    testimony: "Gud har vært trofast og ledet meg gjennom mange år i tjeneste.",
    reference: "Pastor og lederteam"
  };

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetUrl = spreadsheet ? spreadsheet.getUrl() : "https://docs.google.com/spreadsheets";
  var now = Utilities.formatDate(new Date(), "Europe/Oslo", "dd.MM.yyyy HH:mm:ss");

  sendBrandedNotificationEmail(sample, sheetUrl, now);
  Logger.log("Test-epost sendt til: " + RECIPIENT_EMAIL);
}
