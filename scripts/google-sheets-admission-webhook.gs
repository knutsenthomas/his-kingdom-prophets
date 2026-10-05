/**
 * ============================================================================
 * HIS KINGDOM PROPHETIC COMMUNITY (HKPC) - OPPTAKSWEBHOOK & E-POSTVARSLER
 * ============================================================================
 * 
 * SIKKERHETSHERDET GOOGLE APPS SCRIPT WEBHOOK:
 * 1. Formelinjeksjonsbeskyttelse (CWE-1236 / CSV Injection):
 *    Alle brukerstyrte verdier som begynner med '=', '+', '-', '@', tab (\t)
 *    eller carriage return (\r) – inkludert etter innledende mellomrom eller
 *    ASCII-kontrolltegn – prefikses med enkelt apostrof (') før appendRow.
 * 2. Validering av påkrevde felt, datatyper og feltlengder på serversiden.
 * 3. Duplikat- og gjeninnleveringsbeskyttelse som fungerer under samtidige
 *    forespørsler via LockService og CacheService (idempotent for legitime søkere).
 * 4. Rate limiting per e-postadresse og global e-postkvotebeskyttelse (MailApp).
 * 
 * ----------------------------------------------------------------------------
 * UTRULLINGSTRINN I GOOGLE REGNEARK:
 * 1. Åpne skolens Google Regneark for opptak.
 * 2. Klikk "Utvidelser" (Extensions) -> "Apps Script".
 * 3. Erstatt kildekoden i Code.gs med koden i denne filen.
 * 4. Klikk "Distribuer" (Deploy) -> "Administrer distribusjoner" (Manage deployments).
 * 5. Rediger gjeldende distribusjon:
 *    - Versjon: Velg "Ny versjon" (New version).
 *    - Utfør som: "Meg" (skolens Google-konto med tilgang til regneark og e-post).
 *    - Hvem har tilgang: "Alle" (Anyone - nødvendig for at offentlige søkere kan sende).
 * 6. Klikk "Distribuer" og godkjenn nødvendige Google-tillatelser.
 * 7. Bekreft at Webhook URL stemmer overens med VITE_GOOGLE_SHEETS_WEBHOOK_URL i .env.
 * ============================================================================
 */

// Konfigurasjon
const RECIPIENT_EMAIL = "school@hiskingdomministry.no";
const SENDER_NAME = "His Kingdom Prophetic Community";

// Hastighetsbegrensning og kvotebeskyttelse
const MAX_PAYLOAD_SIZE = 60000;              // Maks 60 KB JSON-innhold
const RATE_LIMIT_EMAIL_MAX_SUBMISSIONS = 2;   // Maks 2 søknader per e-post innenfor tidsvinduet
const RATE_LIMIT_EMAIL_WINDOW_SEC = 600;      // Tidsvindu for e-post rate limit: 10 minutter
const RATE_LIMIT_GLOBAL_EMAILS_PER_HOUR = 40; // Maks varslings-eposter per time for å beskytte MailApp-kvote
const DUPLICATE_CACHE_TTL_SEC = 1800;         // Duplikatminne: 30 minutter

/**
 * Nøytraliserer formelinjeksjon (Google Sheets / CSV Formula Injection).
 * Hvis en streng starter med =, +, -, @, \t eller \r (også etter mellomrom eller
 * kontrolltegn 0x00-0x1F), prefikses den med et enkelt apostrof-tegn (').
 * Google Sheets lagrer og viser da feltet som ren tekst og eksekverer aldri formler.
 */
function sanitizeSheetCell(value) {
  if (value === null || value === undefined) return "";
  var str = String(value);
  if (/^[\s\x00-\x1f]*[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

/**
 * Validerer og renser søknadsdata på serversiden før lagring og e-postsending.
 * Returnerer et objekt: { valid: boolean, error?: string, data?: object }
 */
function validateAndSanitizePayload(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { valid: false, error: "Ugyldig dataformat: JSON-objekt forventet." };
  }

  // Påkrevd felt: Navn
  var name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (name.length < 2 || name.length > 120) {
    return { valid: false, error: "Ugyldig navn: må være mellom 2 og 120 tegn." };
  }

  // Påkrevd felt: E-postadresse
  var email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (email.length < 5 || email.length > 254 || !emailRegex.test(email)) {
    return { valid: false, error: "Ugyldig e-postadresse." };
  }

  // Påkrevd felt: Telefon
  var phone = typeof raw.phone === "string" ? raw.phone.trim() : "";
  if (phone.length < 5 || phone.length > 35) {
    return { valid: false, error: "Ugyldig telefonnummer: må være mellom 5 og 35 tegn." };
  }

  // Hjelper for å begrense lengde på valgfrie tekstfelter
  function cleanField(val, maxLen, fallback) {
    if (typeof val !== "string") return fallback || "";
    var s = val.trim();
    return s.length > maxLen ? s.substring(0, maxLen) : s;
  }

  var cleaned = {
    id: cleanField(raw.id, 64, ""),
    name: name,
    email: email,
    phone: phone,
    birthDate: cleanField(raw.birthDate, 20, ""),
    gender: cleanField(raw.gender, 50, ""),
    maritalStatus: cleanField(raw.maritalStatus, 50, ""),
    address: cleanField(raw.address, 250, ""),
    occupation: cleanField(raw.occupation, 150, ""),
    programTitle: cleanField(raw.programTitle, 150, "His Kingdom Prophetic Community (1. År)"),
    programCode: cleanField(raw.programCode, 30, "1. ÅR"),
    paymentPlan: cleanField(raw.paymentPlan, 50, "monthly"),
    churchCommunity: cleanField(raw.churchCommunity, 200, ""),
    currentMinistry: cleanField(raw.currentMinistry, 250, ""),
    ministryCalling: cleanField(raw.ministryCalling, 250, ""),
    whySeeking: cleanField(raw.whySeeking, 3000, ""),
    expectations: cleanField(raw.expectations, 3000, ""),
    testimony: cleanField(raw.testimony, 5000, ""),
    dreamsVision: cleanField(raw.dreamsVision, 3000, ""),
    hobbies: cleanField(raw.hobbies, 1000, ""),
    howHeard: cleanField(raw.howHeard, 250, ""),
    reference: cleanField(raw.reference, 250, ""),
    additionalNotes: cleanField(raw.additionalNotes, 2000, ""),
    status: cleanField(raw.status, 50, "pending_review")
  };

  return { valid: true, data: cleaned };
}

/**
 * Hjelper for JSON-respons
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Hovedfunksjon for HTTP POST (Web App Webhook)
 */
function doPost(e) {
  // 1. Forhåndsvalidering av forespørselsstørrelse
  if (!e || !e.postData || !e.postData.contents) {
    return createJsonResponse({ 
      result: "error", 
      code: "NO_DATA",
      message: "Ingen data mottatt i postData" 
    });
  }

  if (e.postData.contents.length > MAX_PAYLOAD_SIZE) {
    return createJsonResponse({ 
      result: "error", 
      code: "PAYLOAD_TOO_LARGE",
      message: "Forespørselen overskrider maksimal tillatt størrelse." 
    });
  }

  // 2. Pars JSON
  var rawData;
  try {
    rawData = JSON.parse(e.postData.contents);
  } catch (err) {
    return createJsonResponse({ 
      result: "error", 
      code: "INVALID_JSON",
      message: "Ugyldig JSON-format i forespørselen." 
    });
  }

  // 3. Valider påkrevde felt og feltlengder
  var validation = validateAndSanitizePayload(rawData);
  if (!validation.valid) {
    return createJsonResponse({
      result: "error",
      code: "VALIDATION_FAILED",
      message: validation.error
    });
  }

  var data = validation.data;

  // 4. Etabler atomisk lås for samtidighetsbeskyttelse
  var lock = LockService.getScriptLock();
  var acquiredLock = lock.tryLock(15000);
  if (!acquiredLock) {
    return createJsonResponse({
      result: "error",
      code: "LOCK_TIMEOUT",
      message: "Tjenesten behandler for øyeblikket en annen forespørsel. Prøv igjen om et øyeblikk."
    });
  }

  try {
    var cache = CacheService.getScriptCache();

    // 5. Duplikatbeskyttelse: sjekk ID og innholdsfingeravtrykk
    var submissionId = data.id;
    if (submissionId) {
      var cachedId = cache.get("sub_id_" + submissionId);
      if (cachedId) {
        return createJsonResponse({
          result: "success",
          duplicate: true,
          id: submissionId,
          message: "Søknaden er allerede mottatt og registrert."
        });
      }
    }

    // Fingeravtrykk basert på e-post, navn, telefon og linje
    var fingerprintInput = data.email + "|" + data.name + "|" + data.phone + "|" + data.programCode;
    var rawDigest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, fingerprintInput, Utilities.Charset.UTF_8);
    var contentHash = Utilities.base64Encode(rawDigest).substring(0, 32);

    var cachedContent = cache.get("sub_hash_" + contentHash);
    if (cachedContent) {
      return createJsonResponse({
        result: "success",
        duplicate: true,
        id: submissionId || "duplicate",
        message: "En identisk søknad er allerede mottatt for denne søkeren."
      });
    }

    // 6. Rate limiting per e-postadresse
    var emailDigest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, data.email, Utilities.Charset.UTF_8);
    var emailRateKey = "rate_em_" + Utilities.base64Encode(emailDigest).substring(0, 20);
    var emailSubmissions = parseInt(cache.get(emailRateKey) || "0", 10);
    if (emailSubmissions >= RATE_LIMIT_EMAIL_MAX_SUBMISSIONS) {
      return createJsonResponse({
        result: "error",
        code: "RATE_LIMIT_EMAIL",
        message: "For mange innsendinger på kort tid for denne e-postadressen. Vennligst vent litt."
      });
    }

    // 7. Global timekvotebeskyttelse for e-post (beskytter skolens daglige MailApp-kvote)
    var hourKey = "email_q_hr_" + Utilities.formatDate(new Date(), "GMT", "yyyyMMdd_HH");
    var emailsSentThisHour = parseInt(cache.get(hourKey) || "0", 10);
    var canSendEmail = (emailsSentThisHour < RATE_LIMIT_GLOBAL_EMAILS_PER_HOUR);

    // 8. Tilgang til Google Regneark
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getActiveSheet();
    var sheetUrl = spreadsheet.getUrl();

    // Initialiser overskrifter dersom regnearket er helt tomt
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

      var headerRange = sheet.getRange(1, 1, 1, 25);
      headerRange.setBackground("#561291");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var nowOslo = Utilities.formatDate(new Date(), "Europe/Oslo", "dd.MM.yyyy HH:mm:ss");

    // 9. Skriv rad til regnearket – HVER CELLE sanitiseres mot formelinjeksjon
    sheet.appendRow([
      sanitizeSheetCell(nowOslo),
      sanitizeSheetCell(data.id),
      sanitizeSheetCell(data.name),
      sanitizeSheetCell(data.email),
      sanitizeSheetCell(data.phone),
      sanitizeSheetCell(data.birthDate),
      sanitizeSheetCell(data.gender),
      sanitizeSheetCell(data.maritalStatus),
      sanitizeSheetCell(data.address),
      sanitizeSheetCell(data.occupation),
      sanitizeSheetCell(data.programTitle),
      sanitizeSheetCell(data.programCode),
      sanitizeSheetCell(
        data.paymentPlan === "monthly" ? "Månedlig (1 000,- / mnd)" :
        (data.paymentPlan === "biannual" || data.paymentPlan === "semester") ? "Halvårlig (5 000,- x 2)" :
        "Hele prisen på en gang (10 000,-)"
      ),
      sanitizeSheetCell(data.churchCommunity),
      sanitizeSheetCell(data.currentMinistry),
      sanitizeSheetCell(data.ministryCalling),
      sanitizeSheetCell(data.whySeeking),
      sanitizeSheetCell(data.expectations),
      sanitizeSheetCell(data.testimony),
      sanitizeSheetCell(data.dreamsVision),
      sanitizeSheetCell(data.hobbies),
      sanitizeSheetCell(data.howHeard),
      sanitizeSheetCell(data.reference),
      sanitizeSheetCell(data.additionalNotes),
      sanitizeSheetCell(data.status)
    ]);

    // 10. Send e-postvarsel dersom timekvote tillater det
    if (canSendEmail) {
      try {
        sendBrandedNotificationEmail(data, sheetUrl, nowOslo);
        cache.put(hourKey, String(emailsSentThisHour + 1), 3600);
      } catch (mailError) {
        Logger.log("Kunne ikke sende e-postvarsel: " + mailError.toString());
      }
    } else {
      Logger.log("Advarsel: Global e-postkvote nådd for denne timen. Søknad er registrert i regnearket uten e-postvarsel.");
    }

    // 11. Oppdater duplikat- og hastighetsminne i CacheService
    if (submissionId) {
      cache.put("sub_id_" + submissionId, "1", DUPLICATE_CACHE_TTL_SEC);
    }
    cache.put("sub_hash_" + contentHash, "1", DUPLICATE_CACHE_TTL_SEC);
    cache.put(emailRateKey, String(emailSubmissions + 1), RATE_LIMIT_EMAIL_WINDOW_SEC);

    return createJsonResponse({ 
      result: "success", 
      id: data.id || "ok",
      timestamp: nowOslo
    });

  } catch (error) {
    Logger.log("Uventet feil i doPost: " + error.toString());
    return createJsonResponse({ 
      result: "error", 
      code: "INTERNAL_ERROR",
      message: "En intern feil oppstod under behandling av søknaden." 
    });

  } finally {
    lock.releaseLock();
  }
}

/**
 * Sender lekker HTML-epost til skolen
 */
function sendBrandedNotificationEmail(data, sheetUrl, nowFormatted) {
  var applicantName = (data.name || "Ny søker").replace(/[\r\n\x00-\x1f]+/g, ' ').trim();
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
 * Hjelpefunksjon for å unnslippe HTML-spesialtegn (XSS- og HTML-injeksjonssikring)
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Hjelpefunksjon for å bevare linjeskift i HTML-innhold
 */
function escapeHtmlWithLineBreaks(text) {
  return escapeHtml(text).replace(/\r?\n/g, "<br />");
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
  var paymentPlan = data.paymentPlan === "monthly" 
    ? "Månedlig delbetaling (1 000,- / $100 USD per mnd)" 
    : (data.paymentPlan === "biannual" || data.paymentPlan === "semester")
    ? "Halvårlig betaling (5 000,- / $500 USD to ganger i året)"
    : "Hele prisen på en gang (10 000,- / $1,000 USD fullt studieår)";
  var churchCommunity = escapeHtml(data.churchCommunity || "-");
  var currentMinistry = escapeHtml(data.currentMinistry || "-");
  var ministryCalling = escapeHtml(data.ministryCalling || "-");
  var whySeeking = escapeHtmlWithLineBreaks(data.whySeeking || "");
  var expectations = escapeHtmlWithLineBreaks(data.expectations || "");
  var testimony = escapeHtmlWithLineBreaks(data.testimony || "");
  var reference = escapeHtml(data.reference || "-");
  var regnearkUrl = sheetUrl || "https://docs.google.com/spreadsheets";
  var timeText = nowFormatted || Utilities.formatDate(new Date(), "Europe/Oslo", "dd.MM.yyyy HH:mm:ss");

  var quoteSnippet = testimony || whySeeking;

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

                    ${quoteSnippet ? `
                    <div style="margin-top: 14px; padding: 12px 16px; background-color: #FFFFFF; border-left: 3px solid #561291; border-radius: 0 10px 10px 0; font-size: 13px; line-height: 20px; color: #464554; font-style: italic; word-break: break-word;">
                      &ldquo;${quoteSnippet}&rdquo;
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
  var paymentPlan = data.paymentPlan === "monthly" 
    ? "Månedlig delbetaling (1 000,- / mnd)" 
    : (data.paymentPlan === "biannual" || data.paymentPlan === "semester") 
    ? "Halvårlig (5 000,- x 2)" 
    : "Hele prisen på en gang (10 000,-)";
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
    paymentPlan: "monthly",
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
