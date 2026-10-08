import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paymentPayload, paymentState } from '../src/lib/school-payments.js';
const details = { name: 'Payer', email: 'payer@example.com', studentName: 'Student Example', reference: '2027-123' };
test('school fees are fixed and separated from donations in HKM records', () => {
  const school = paymentPayload({ ...details, gift: false, plan: 'semester', amount: '1' });
  assert.equal(school.amount, 5000);
  assert.equal(school.customerDetails.fund, 'hkpc');
  assert.equal(school.customerDetails.type, 'Course');
  assert.match(school.customerDetails.message, /Student Example/);
  assert.match(school.customerDetails.message, /2027-123/);
  const gift = paymentPayload({ ...details, gift: true, amount: '19.99', message: 'Thank you' });
  assert.equal(gift.amount, 19.99);
  assert.equal(gift.customerDetails.courseId, undefined);
  assert.match(gift.customerDetails.message, /Gave til HKPC/);
});
test('invalid amounts, missing student and invalid contact cannot start payment', () => {
  for (const amount of ['0', '-10', 'NaN', '100001', '0.001']) assert.throws(() => paymentPayload({ ...details, gift: true, amount }));
  assert.throws(() => paymentPayload({ ...details, gift: false, plan: 'unknown' }));
  assert.throws(() => paymentPayload({ ...details, gift: false, plan: 'monthly', studentName: '' }));
  assert.throws(() => paymentPayload({ ...details, gift: true, amount: '500', email: 'a@example.com\nBcc: bad@example.com' }));
});
test('only verified completed statuses display successful payment', () => {
  for (const state of ['succeeded', 'CAPTURED']) assert.equal(paymentState(state), 'success');
  for (const state of ['processing', 'AUTHORIZED', 'CREATED']) assert.equal(paymentState(state), 'pending');
  for (const state of ['ABORTED', 'requires_payment_method']) assert.equal(paymentState(state), 'failed');
});

test('unknown payment status does not invite another payment', () => { assert.equal(paymentState(undefined), 'unverified'); });

test('HKM requests preserve school earmarking and fail safely on service errors', async () => {
  const { paymentRequest } = await import('../src/lib/school-payments.js');
  const original = globalThis.fetch;
  try {
    let request;
    globalThis.fetch = async (url, options) => { request = { url, ...options }; return { ok: true, json: async () => ({ clientSecret: 'test_secret' }) }; };
    const payload = paymentPayload({ ...details, gift: false, plan: 'annual' });
    assert.equal((await paymentRequest('card', payload)).clientSecret, 'test_secret');
    assert.equal(request.url, 'https://createpaymentintent-42bhgdjkcq-uc.a.run.app');
    assert.equal(JSON.parse(request.body).customerDetails.fund, 'hkpc');
    assert.equal(JSON.parse(request.body).amount, 10000);
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ error: 'internal configuration' }) });
    await assert.rejects(paymentRequest('card', payload), /payment-service-unavailable/);
  } finally { globalThis.fetch = original; }
});
