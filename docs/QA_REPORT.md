# GhostFlow QA Test Report

**Test object:** Original GhostFlow static companion app (NOT Ghost CMS itself).  
**Date:** November 2026  
**Environment:** Node.js 22 / npm; no third-party npm dependencies.

## Completed automated checks

| Suite | Test area | Status | How to reproduce |
| --- | --- | --- | --- |
| Node syntax | Parse all three main JavaScript modules | **PASS** | `npm run check` |
| Node unit tests | Request paths, 4 scenario models, cache restrictions, boundaries, metadata | **PASS — 30 checks** | `npm test` |
| HTTP tests | HTML, module, stylesheet MIME, 404, 405, traversal | **PASS — 6 checks** | `npm test` |
| Static build | Copies all required assets into `dist/` | **PASS** | `npm run build` |
| Local HTTP smoke | `curl -I http://localhost:4173/` returned `200 OK` | **PASS** | Start `npm run dev`, then run `curl -I ...` |

**Total Node test suite:** 36 / 36 passing. A student-supplied screenshot showing the 36 passing Node tests is preserved at [`evidence/01-automated-tests.png`](../evidence/01-automated-tests.png). The in-app QA Workbench has 14 *separate* self-checks, which should be run in-browser and are not included in the Node test count.

## Manual browser QA verification matrix

**Do not mark these as passed until you actually execute them.**

| ID | Procedure / expected result | Status |
| --- | --- | --- |
| F1 | Open site; Overview renders and diagram scenario selection highlights appropriate nodes | **Not yet manually verified** |
| F2 | Trace Lab: public, publish, headless scenarios show consistent steps | **Not yet manually verified** |
| F3 | Submit blank path; inline error appears and the control gets invalid state | **Not yet manually verified** |
| F4 | Enter `/<script>` and path longer than 180; rejected without crash | **Not yet manually verified** |
| R1 | 1920×1080: no page-level horizontal overflow or clipping | **Not yet manually verified** |
| R2 | 768×1024: tablet layout adapts without overlapping content | **Not yet manually verified** |
| R3 | 390×844: mobile navigation, forms, and scrollable diagram work | **Not yet manually verified** |
| B1 | Chromium desktop browser works without broken controls | **Not yet manually verified** |
| B2 | Firefox or Safari works without broken controls | **Not yet manually verified** |
| C1 | DevTools Console shows zero uncaught JS errors | **Not yet manually verified** |
| C2 | DevTools Network shows 200 for assets, no 404 | **Not yet manually verified** |
| A1 | Keyboard Tab / Enter / Escape supports nav, dialog, form | **Not yet manually verified** |
| P1 | Page loads quickly, no external blocking runtime requests | **Not yet manually verified** |

### Browser automation attempt

A headless Chromium smoke-test script (`tests/browser_smoke.py`) was prepared, but the restricted build environment returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` on local navigation before loading the page. **This is an environment limitation, not an application pass or fail.** Do not count automated cross-browser checks as completed.

## Verification methodology

Manual browser verification is intentionally distinct from the deterministic unit/HTTP suite. The recorded test outcome for each matrix item must be based on actual observation in the target browser and viewport. Where a browser or environment has not been tested, its status remains **Not yet manually verified**. Failed checks should retain a description of the observed behavior and a subsequent rerun result after remediation.

## Acceptance statement

Automated model and server tests passed in this build environment. Manual functional, responsive, cross-browser, Console, Network, keyboard, and performance checks remain unverified until they are independently executed and documented.
