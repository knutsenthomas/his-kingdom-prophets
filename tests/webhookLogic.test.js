import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

/**
 * Logikk speilet nøyaktig fra scripts/google-sheets-admission-webhook.gs
 * for isolert enhetstesting i Node.js-miljø.
 */

const MAX_PAYLOAD_SIZE = 60000;
const RATE_LIMIT_EMAIL_MAX_SUBMISSIONS = 2;
const RATE_LIMIT_GLOBAL_EMAILS_PER_HOUR = 40;

function sanitizeSheetCell(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/^[\s\x00-\x1f]*[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function validateAndSanitizePayload(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { valid: false, error: "Ugyldig dataformat: JSON-objekt forventet." };
  }

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (name.length < 2 || name.length > 120) {
    return { valid: false, error: "Ugyldig navn: må være mellom 2 og 120 tegn." };
  }

  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (email.length < 5 || email.length > 254 || !emailRegex.test(email)) {
    return { valid: false, error: "Ugyldig e-postadresse." };
  }

  const phone = typeof raw.phone === "string" ? raw.phone.trim() : "";
  if (phone.length < 5 || phone.length > 35) {
    return { valid: false, error: "Ugyldig telefonnummer: må være mellom 5 og 35 tegn." };
  }

  function cleanField(val, maxLen, fallback) {
    if (typeof val !== "string") return fallback || "";
    const s = val.trim();
    return s.length > maxLen ? s.substring(0, maxLen) : s;
  }

  const cleaned = {
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
 * Simulerer Google Apps Script CacheService og LockService for samtidighets- og duplikattesting
 */
class MockGasEnvironment {
  constructor() {
    this.cache = new Map();
    this.sheetRows = [];
    this.sentEmails = [];
    this.lockHeld = false;
  }

  acquireLock() {
    if (this.lockHeld) return false;
    this.lockHeld = true;
    return true;
  }

  releaseLock() {
    this.lockHeld = false;
  }

  processWebhook(e) {
    if (!e || !e.postData || !e.postData.contents) {
      return { result: "error", code: "NO_DATA", message: "Ingen data mottatt i postData" };
    }

    if (e.postData.contents.length > MAX_PAYLOAD_SIZE) {
      return { result: "error", code: "PAYLOAD_TOO_LARGE", message: "Forespørselen overskrider maksimal tillatt størrelse." };
    }

    let rawData;
    try {
      rawData = JSON.parse(e.postData.contents);
    } catch {
      return { result: "error", code: "INVALID_JSON", message: "Ugyldig JSON-format i forespørselen." };
    }

    const validation = validateAndSanitizePayload(rawData);
    if (!validation.valid) {
      return { result: "error", code: "VALIDATION_FAILED", message: validation.error };
    }

    const data = validation.data;

    if (!this.acquireLock()) {
      return { result: "error", code: "LOCK_TIMEOUT", message: "Tjenesten behandler for øyeblikket en annen forespørsel." };
    }

    try {
      // 1. Sjekk duplikat på submissionId
      if (data.id && this.cache.has(`sub_id_${data.id}`)) {
        return { result: "success", duplicate: true, id: data.id, message: "Søknaden er allerede mottatt og registrert." };
      }

      // 2. Sjekk duplikat på innholds-fingeravtrykk (SHA-256)
      const fingerprintInput = `${data.email}|${data.name}|${data.phone}|${data.programCode}`;
      const contentHash = crypto.createHash('sha256').update(fingerprintInput).digest('base64').substring(0, 32);
      if (this.cache.has(`sub_hash_${contentHash}`)) {
        return { result: "success", duplicate: true, id: data.id || "duplicate", message: "En identisk søknad er allerede mottatt for denne søkeren." };
      }

      // 3. Rate limiting per e-postadresse
      const emailDigest = crypto.createHash('md5').update(data.email).digest('base64').substring(0, 20);
      const emailRateKey = `rate_em_${emailDigest}`;
      const emailSubmissions = this.cache.get(emailRateKey) || 0;
      if (emailSubmissions >= RATE_LIMIT_EMAIL_MAX_SUBMISSIONS) {
        return { result: "error", code: "RATE_LIMIT_EMAIL", message: "For mange innsendinger på kort tid for denne e-postadressen." };
      }

      // 4. Global timekvote for e-post
      const hourKey = "email_q_hr_current";
      const emailsSentThisHour = this.cache.get(hourKey) || 0;
      const canSendEmail = (emailsSentThisHour < RATE_LIMIT_GLOBAL_EMAILS_PER_HOUR);

      // 5. Lagre til ark (hver celle er nøytralisert med sanitizeSheetCell)
      const sanitizedRow = [
        sanitizeSheetCell("04.10.2026 12:00:00"),
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
      ];
      this.sheetRows.push(sanitizedRow);

      // 6. E-postvarsel
      if (canSendEmail) {
        this.sentEmails.push({ to: "school@hiskingdomministry.no", applicant: data.name, email: data.email });
        this.cache.set(hourKey, emailsSentThisHour + 1);
      }

      // 7. Sett cache
      if (data.id) this.cache.set(`sub_id_${data.id}`, 1);
      this.cache.set(`sub_hash_${contentHash}`, 1);
      this.cache.set(emailRateKey, emailSubmissions + 1);

      return { result: "success", id: data.id || "ok" };
    } finally {
      this.releaseLock();
    }
  }
}

test('Google Sheets Webhook - Formelinjeksjonssikring (sanitizeSheetCell)', async (t) => {
  await t.test('nøytraliserer alle formel-symboler (=, +, -, @, \\t, \\r)', () => {
    assert.equal(sanitizeSheetCell('=cmd|\' /C calc\'!A0'), "'=cmd|' /C calc'!A0");
    assert.equal(sanitizeSheetCell('+1+2'), "'+1+2");
    assert.equal(sanitizeSheetCell('-100'), "'-100");
    assert.equal(sanitizeSheetCell('@SUM(A1:B10)'), "'@SUM(A1:B10)");
    assert.equal(sanitizeSheetCell('\tDDE'), "'\tDDE");
    assert.equal(sanitizeSheetCell('\rMALICIOUS'), "'\rMALICIOUS");
  });

  await t.test('oppdager formler med innledende mellomrom eller kontrolltegn', () => {
    assert.equal(sanitizeSheetCell('   =IMPORTXML("evil","//a")'), "'   =IMPORTXML(\"evil\",\"//a\")");
    assert.equal(sanitizeSheetCell('\x00=calc'), "'\x00=calc");
    assert.equal(sanitizeSheetCell('\x1b+attack'), "'\x1b+attack");
    assert.equal(sanitizeSheetCell('  \t  @EVIL'), "'  \t  @EVIL");
  });

  await t.test('normale tekster og null/tomme verdier forblir uskadet', () => {
    assert.equal(sanitizeSheetCell('Ola Nordmann'), 'Ola Nordmann');
    assert.equal(sanitizeSheetCell('ola@hkpc.no'), 'ola@hkpc.no');
    assert.equal(sanitizeSheetCell(null), '');
    assert.equal(sanitizeSheetCell(undefined), '');
    assert.equal(sanitizeSheetCell(''), '');
  });
});

test('Google Sheets Webhook - Servervalidering av forespørsler (validateAndSanitizePayload)', async (t) => {
  await t.test('avviser ikke-objekter og tomme payloads', () => {
    assert.equal(validateAndSanitizePayload(null).valid, false);
    assert.equal(validateAndSanitizePayload("string").valid, false);
    assert.equal(validateAndSanitizePayload([]).valid, false);
  });

  await t.test('avviser ugyldig eller manglende navn', () => {
    const res1 = validateAndSanitizePayload({ name: 'A', email: 'ola@example.com', phone: '12345678' });
    assert.equal(res1.valid, false);
    assert.ok(res1.error.includes('navn'));

    const res2 = validateAndSanitizePayload({ name: '   ', email: 'ola@example.com', phone: '12345678' });
    assert.equal(res2.valid, false);
  });

  await t.test('avviser ugyldig eller manglende e-post', () => {
    const res1 = validateAndSanitizePayload({ name: 'Ola Nordmann', email: 'ikke-en-epost', phone: '12345678' });
    assert.equal(res1.valid, false);
    assert.ok(res1.error.includes('e-post'));

    const res2 = validateAndSanitizePayload({ name: 'Ola Nordmann', email: '', phone: '12345678' });
    assert.equal(res2.valid, false);
  });

  await t.test('avviser ugyldig eller manglende telefonnummer', () => {
    const res1 = validateAndSanitizePayload({ name: 'Ola Nordmann', email: 'ola@example.com', phone: '123' });
    assert.equal(res1.valid, false);
    assert.ok(res1.error.includes('telefon'));
  });

  await t.test('godkjenner gyldig payload og avkorter overdrevent lange fritekstfelt', () => {
    const validRaw = {
      name: 'Kari Nordmann',
      email: 'kari@example.com',
      phone: '+47 999 88 777',
      whySeeking: 'A'.repeat(5000), // grense er 3000
      testimony: 'B'.repeat(10000)  // grense er 5000
    };

    const res = validateAndSanitizePayload(validRaw);
    assert.equal(res.valid, true);
    assert.equal(res.data.name, 'Kari Nordmann');
    assert.equal(res.data.whySeeking.length, 3000);
    assert.equal(res.data.testimony.length, 5000);
  });
});

test('Google Sheets Webhook - Samtidighet, duplikatbeskyttelse og kvotekontroll', async (t) => {
  await t.test('avviser forespørsler som er for store (> 60 KB)', () => {
    const env = new MockGasEnvironment();
    const largeContents = JSON.stringify({ huge: 'X'.repeat(65000) });
    const res = env.processWebhook({ postData: { contents: largeContents } });
    assert.equal(res.result, 'error');
    assert.equal(res.code, 'PAYLOAD_TOO_LARGE');
  });

  await t.test('aksepterer en legitim førstegangssøknad og nøytraliserer formler i regnearket', () => {
    const env = new MockGasEnvironment();
    const payload = {
      id: 'app_12345',
      name: '=DDE_ATTACK',
      email: 'student@example.com',
      phone: '+47 12345678',
      testimony: '@SUM(A1:A5)'
    };

    const res = env.processWebhook({ postData: { contents: JSON.stringify(payload) } });
    assert.equal(res.result, 'success');
    assert.equal(res.duplicate, undefined);
    assert.equal(env.sheetRows.length, 1);

    // Verifiser at radens verdier ble nøytralisert
    const savedRow = env.sheetRows[0];
    assert.equal(savedRow[2], "'=DDE_ATTACK", 'Navnefelt med formel skal prefikses med apostrof');
    assert.equal(savedRow[18], "'@SUM(A1:A5)", 'Testimony med formel skal prefikses med apostrof');
    assert.equal(env.sentEmails.length, 1);
  });

  await t.test('avviser/idempotent håndterer identisk duplikatinnsending med samme ID', () => {
    const env = new MockGasEnvironment();
    const payload = {
      id: 'app_unique_99',
      name: 'Peder Aas',
      email: 'peder@example.com',
      phone: '+47 90000000'
    };

    const res1 = env.processWebhook({ postData: { contents: JSON.stringify(payload) } });
    assert.equal(res1.result, 'success');
    assert.equal(res1.duplicate, undefined);

    // Gjentatt innsending med samme ID (f.eks. bruker trykker Send to ganger eller refresher)
    const res2 = env.processWebhook({ postData: { contents: JSON.stringify(payload) } });
    assert.equal(res2.result, 'success');
    assert.equal(res2.duplicate, true);
    assert.equal(env.sheetRows.length, 1, 'Ingen ekstra rad skal opprettes for duplikat');
    assert.equal(env.sentEmails.length, 1, 'Ingen ekstra e-post skal sendes for duplikat');
  });

  await t.test('oppdager identisk innholdsfingeravtrykk selv uten innsendt ID', () => {
    const env = new MockGasEnvironment();
    const payload = {
      name: 'Berit Bø',
      email: 'berit@example.com',
      phone: '+47 91111111',
      programCode: '1. ÅR'
    };

    const res1 = env.processWebhook({ postData: { contents: JSON.stringify(payload) } });
    assert.equal(res1.result, 'success');

    // Send identisk innhold igjen
    const res2 = env.processWebhook({ postData: { contents: JSON.stringify(payload) } });
    assert.equal(res2.result, 'success');
    assert.equal(res2.duplicate, true);
    assert.equal(env.sheetRows.length, 1);
  });

  await t.test('håndterer låsekollisjon under samtidig kjøring trygt (LOCK_TIMEOUT)', () => {
    const env = new MockGasEnvironment();
    env.lockHeld = true; // Simuler at en annen tråd har låsen

    const payload = {
      name: 'Hans Hansen',
      email: 'hans@example.com',
      phone: '+47 92222222'
    };

    const res = env.processWebhook({ postData: { contents: JSON.stringify(payload) } });
    assert.equal(res.result, 'error');
    assert.equal(res.code, 'LOCK_TIMEOUT');
    assert.equal(env.sheetRows.length, 0);
  });

  await t.test('aktiverer rate limit etter maks tillatte innsendinger per e-postadresse', () => {
    const env = new MockGasEnvironment();
    
    // Første innsending
    const res1 = env.processWebhook({
      postData: { contents: JSON.stringify({ id: 'app_1', name: 'Søker En', email: 'spammer@example.com', phone: '+47 93333331' }) }
    });
    assert.equal(res1.result, 'success');

    // Andre innsending (tillatt innenfor grensen på 2)
    const res2 = env.processWebhook({
      postData: { contents: JSON.stringify({ id: 'app_2', name: 'Søker To', email: 'spammer@example.com', phone: '+47 93333332' }) }
    });
    assert.equal(res2.result, 'success');

    // Tredje innsending (overskrider rate limit for denne e-posten)
    const res3 = env.processWebhook({
      postData: { contents: JSON.stringify({ id: 'app_3', name: 'Søker Tre', email: 'spammer@example.com', phone: '+47 93333333' }) }
    });
    assert.equal(res3.result, 'error');
    assert.equal(res3.code, 'RATE_LIMIT_EMAIL');
  });

  await t.test('skjermer MailApp-kvote når global timekvote er overskredet, men lagrer data', () => {
    const env = new MockGasEnvironment();
    env.cache.set('email_q_hr_current', RATE_LIMIT_GLOBAL_EMAILS_PER_HOUR); // E-postkvote brukt opp

    const res = env.processWebhook({
      postData: { contents: JSON.stringify({ id: 'legit_app_50', name: 'Søker Nitti', email: 'nitti@example.com', phone: '+47 94444444' }) }
    });

    assert.equal(res.result, 'success');
    assert.equal(env.sheetRows.length, 1, 'Skal fortsatt lagres i Google Regneark');
    assert.equal(env.sentEmails.length, 0, 'Skal ikke sende e-post når kvoten er nådd');
  });

  await t.test('støtter og formaterer betalingsplaner (månedlig, halvårlig, hele prisen)', () => {
    const env = new MockGasEnvironment();
    
    // 1. Månedlig
    env.processWebhook({
      postData: { contents: JSON.stringify({ id: 'app_m', name: 'Måned Søker', email: 'm@example.com', phone: '+47 91000001', paymentPlan: 'monthly' }) }
    });
    // 2. Halvårlig
    env.processWebhook({
      postData: { contents: JSON.stringify({ id: 'app_b', name: 'Halvår Søker', email: 'b@example.com', phone: '+47 91000002', paymentPlan: 'biannual' }) }
    });
    // 3. Hele prisen
    env.processWebhook({
      postData: { contents: JSON.stringify({ id: 'app_f', name: 'Full Søker', email: 'f@example.com', phone: '+47 91000003', paymentPlan: 'full' }) }
    });

    assert.equal(env.sheetRows.length, 3);
    assert.equal(env.sheetRows[0][12], 'Månedlig (1 000,- / mnd)');
    assert.equal(env.sheetRows[1][12], 'Halvårlig (5 000,- x 2)');
    assert.equal(env.sheetRows[2][12], 'Hele prisen på en gang (10 000,-)');
  });
});
