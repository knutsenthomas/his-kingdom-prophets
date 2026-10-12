# App promotion page

Draft route: `/apper?lang=no` (Norwegian) and `/apper?lang=en` (English).

The page is prepared locally and must be deployed before printed QR codes are distributed. All native platforms are marked coming soon. No private testing links or unverified store URLs are advertised.

At launch:
- Set each verified public download URL in `src/lib/app-releases.js`.
- Update the page's introductory launch copy to reflect availability.
- Update the prelaunch assertions in `tests/app-releases.test.js`.
- Add navigation to `/apper` when ready to advertise it.
- Verify each destination on a physical device before publication.

QR PNGs and their destinations are in `public/app-qr/`. They open permanent language-aware landing links, so they do not need replacing when store links become available. The browser app links to https://app.hkpc.no.
