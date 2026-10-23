# Browser storage review — 2026-10-23

Scope: his-kingdom-prophets client source and configured public website.

| Storage/service | Purpose and duration |
| --- | --- |
| hkp-app-privacy-v1 | Consent categories, version and time are remembered for 180 days. Reject or withdraw using the cookie settings link. |
| Google Analytics / Vercel Analytics | Optional visitor analytics starts only after approval. Google may use _ga and _ga_* (configured for up to 180 days). Vercel measures aggregated usage. Withdrawal stops future measurement and removes accessible analytics cookies on our domain. |
| Firebase / hkm-current-user | Sign-in and local account/access state support the school portal. Visitor analytics choices do not control your account. Sign-out and account deletion are separate actions. |
| Språk og portalvalg | hkm-language, sidebar choices, text size and completed onboarding remember your preferences. Public CMS content stays in page memory rather than automatic localStorage persistence. |
| Søknadsutkast, notater og oppgaver | Application drafts, hkm-notes-*, hkm-bible-note-*, task lists and sharing drafts are stored when you use these features. Some content syncs to your Firebase account and may reveal religious beliefs or personal matters. |
| Betaling | Stripe/PayPal load for the payment feature. Session request IDs prevent duplicate agreements. Rejecting analytics does not block payment; providers have their own privacy terms. |

Verification must cover initial rejection, selective approval, withdrawal, cross-tab updates, unavailable storage, service-worker cleanup, and existing login/cart functions. Provider retention and agreements are not certified by this source review. No real payment or message submission is part of the review.
