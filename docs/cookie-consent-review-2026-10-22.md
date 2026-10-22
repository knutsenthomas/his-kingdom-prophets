# Cookie consent review — 22 October 2026

Scope: public hkpc.no website consent integration. This is a technical review, not certification of the organisation's complete GDPR compliance.

Sources reviewed:
- https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/cookies/
- https://www.edpb.europa.eu/system/files/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf
- https://support.google.com/analytics/answer/11397207
- https://vercel.com/docs/analytics/privacy-policy

Controls implemented:
- No optional analytics scripts until explicit consent. Equal accept/reject buttons in the initial banner; unchecked analytics for a new choice.
- Norwegian and English information; privacy policy includes purpose, providers, storage duration and withdrawal.
- Consent record in local storage includes a policy version, timestamp and boolean choice; 180-day expiry. A new policy version requires a fresh choice. This is local evidence, not a central consent receipt database.
- Visible settings button, footer link and privacy-page control; rejection after acceptance disables analytics, clears accessible GA cookies and reloads to remove running integrations. Cross-tab changes are respected.
- Analytics integration excludes payments, gifts, applications, accounts, support forms and admin routes; Vercel event URLs and manual GA page locations omit query strings/fragments. Google advertising consent stays denied, Google Signals and advertising personalisation disabled in site configuration.
- GA cookies configured to 180 days without renewal per visit.

Verification:
- 68 node tests passed, including malformed/expired consent and private-route/query filtering; Vite build passed.
- Production browser: reject hides banner; settings reopen with unchecked analytics; accept loads GA and Vercel scripts; withdrawal reloads and both script URLs are absent.

Operational checks still required before making a complete legal-compliance claim:
- Confirm controller identity/contact details and applicable processor agreements/EEA transfer safeguards for Google, Firebase and Vercel in the actual accounts.
- Verify GA property settings (including enhanced measurement, data retention and data-sharing settings); site code alone does not prove remote account settings.
- Review special-category implications of religious school activity and full account/application processing separately from this cookie review.
- Local consent record is not a central audit log. Assess organisational requirements for retaining evidence without collecting unnecessary identifying data.
- Recheck tracking/storage whenever integrations or purposes change. Do not classify new storage as necessary without evaluating the user-requested service.
