# School feature structure

`src/pages/` owns routing, page state, effects and authorization. `src/features/bible/` contains Bible reference parsing, study data, reader/timeline panels and the selector. `src/features/bible-resources/` contains resource reading, timeline and selector panels. `src/features/admission/` contains admission constants, date helpers, tuition information and the application form.

Panel components receive the page state and callbacks explicitly. Admission submission, eligibility logic, payment handling and existing API calls retain their current owners. Keep pure reference/date helpers separate from Firebase and rendering.

Run `npm run build` and `node --test tests/*.test.js test/*.test.js`. Never infer successful payments from a page visit; keep the existing payment and access checks intact.
