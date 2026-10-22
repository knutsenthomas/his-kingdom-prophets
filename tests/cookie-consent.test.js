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

import { initializeConsentMode, updateConsentMode, analyticsAllowed } from '../src/utils/cookieConsent.js';
test('Consent Mode v2 defaults denied before updates and ads always remain denied', () => {
 const target={}; initializeConsentMode(target); initializeConsentMode(target);
 assert.equal(target.dataLayer.length,2);
 assert.deepEqual(Array.from(target.dataLayer[0]),['consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'}]);
 updateConsentMode(true,target); assert.equal(target.dataLayer[2][1],'update'); assert.equal(target.dataLayer[2][2].analytics_storage,'granted'); assert.equal(target.dataLayer[2][2].ad_user_data,'denied');
 updateConsentMode(false,target); assert.equal(target.dataLayer[3][2].analytics_storage,'denied');
});
test('Global Privacy Control overrides previous and newly granted analytics consent',()=>{
 assert.equal(analyticsAllowed({analytics:true},true),false);
 assert.equal(analyticsAllowed({analytics:true},false),true);
 assert.equal(analyticsAllowed(null,false),false);
});
