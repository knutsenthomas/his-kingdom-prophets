import test from 'node:test';
import assert from 'node:assert/strict';
import { parseConsent, CONSENT_MAX_AGE, analyticsPage, cleanAnalyticsEvent } from '../src/utils/cookieConsent.js';
test('only explicit current unexpired consent is accepted', () => {
 const now=1e12;
 const record={version:2,analytics:true,savedAt:now};
 assert.equal(parseConsent(JSON.stringify(record),now)?.analytics,true);
 assert.equal(parseConsent(JSON.stringify({...record,analytics:false}),now)?.analytics,false);
 for (const value of [null,{}, {...record,analytics:'true'}, {...record,version:1}, {...record,savedAt:now+1}, {...record,savedAt:now-CONSENT_MAX_AGE}]) assert.equal(parseConsent(JSON.stringify(value),now),null);
 assert.equal(parseConsent('broken',now),null);
});
test('sensitive and unknown routes are excluded and public URLs are sanitized', () => {
 for(const path of ['/betaling','/gi-gave','/opptak','/admission','/admin','/student/courses','/support','/login','/unknown']) assert.equal(analyticsPage(path),false);
 assert.equal(cleanAnalyticsEvent({url:'https://www.hkpc.no/betaling?email=private@example.no'}),null);
 assert.deepEqual(cleanAnalyticsEvent({url:'https://www.hkpc.no/about?email=private@example.no#secret',type:'pageview'}),{url:'https://www.hkpc.no/about',type:'pageview'});
});
