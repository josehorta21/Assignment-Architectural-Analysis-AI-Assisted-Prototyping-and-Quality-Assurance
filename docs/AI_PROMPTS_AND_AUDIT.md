# AI Disclosure, Prompt Record & Verification Audit

**Author:** José Antonio Horta Herrera  
**Assistant:** OpenAI ChatGPT, GPT-6  
**Source review:** November 2026

## A. Original task input received (verbatim excerpts and scope summary)

> ### Objective & Overview
> In software engineering, architects do not simply analyze system design on a whiteboard; they validate their ideas by spinning up proofs-of-concept (PoCs), probing open-source repositories, and running automated or systematic QA suites to confirm that functional and non-functional requirements are met.
>
> In this assignment, you will:
> 1. **Analyze a real-world application** (open-source codebase or published case study) to identify its architectural style and key components.
> 2. **Use an AI tool** (ChatGPT, Claude, Gemini, GitHub Copilot) to generate an initial architectural breakdown and scaffold a working companion prototype or interactive architectural visualizer/dashboard.
> 3. **Verify, customize, and test** the application using a rigorous QA checklist.
> 4. **Deploy and submit** your source code, live URL, GitHub repository with full AI prompts, and a video walkthrough demonstrating functionality and testing.
>
> ### Step 1: Select & Analyze an Existing System
> Pick a prominent open-source system (e.g., Mastodon, Ghost, Supabase, Discourse, Mattermost) or a published case study architecture (e.g., Netflix playback engine, Uber dispatch, Spotify audio pipeline).
> - Identify its **primary architectural style** (e.g., modular monolith, event-driven microservices, serverless, layered/tier-based).
> - Map its **core components** (compute engines, databases, queues/brokers, caches, reverse proxies).
>
> ### Step 2: Leverage AI for Initial Draft & Scaffolding
> - Use an LLM to generate an initial breakdown of the system and scaffold a lightweight companion application (e.g., an architectural dashboard, an API client interfacing with the open-source tool, or a functional PoC recreating one subsystem like authentication or queue processing).
> - **Fact-check the AI:** Verify the AI's architectural breakdown against official documentation or source code. Document any hallucinations, outdated library versions, or inaccurate assumptions.
> - **Customize:** Refactor and tailor the generated code to your specific design, styling, and functionality needs.
>
> ### Step 3: Web Project Testing & Quality Assurance (QA) Checklist
> - Functional flows and graceful edge cases
> - Responsive UI at desktop and mobile/tablet sizes
> - Chromium-based plus Firefox/Safari browser checks, no uncaught console errors or broken assets
> - Accessible labels, keyboard navigation, prompt loading
>
> ### Video Demonstration Requirements (5 to 7 Minutes)
> Screen and webcam both visible, architecture + audit (0–2m), functionality (2–4m), live QA (4–6m), conclusion (6–7m).

**Disclosure:** The paragraph-style copy above preserves the original requested content and ordering, with QA checklist sub-bullets summarized here for readability. The full original course rubric was pasted directly in the ChatGPT conversation and is the authoritative original prompt. No follow-on user prompt was issued to choose Ghost or design GhostFlow; those choices were made by the AI assistant while carrying out the assignment.

## B. AI implementation instructions (reproducible specification; not separate user messages)

The assistant used the following specification to develop the artifact. These are included for reproducibility; they are **not falsely attributed to the user as separate submitted prompts**.

```text
Build an original educational companion PoC called GhostFlow Architecture Lab.
Analyze the contemporary Ghost CMS source of truth before describing its runtime.
Represent Ghost Core as one Node.js process with Express frontend/backend,
Content API, Admin API, server services, and conventional MySQL persistence.
Show separate React Admin plus legacy Ember migration code where applicable.
Implement a responsive semantic HTML/CSS/JavaScript architecture diagram,
scenario buttons, a deterministic request trace simulator, accessible validation,
an AI claim verification panel with URLs, and a browser QA workbench.
Do not claim the simulator connects to Ghost or measures production latency.
Use Node built-in test runner, a no-dependency local server, and static Pages build.
Write all source code, documentation, and video script in English.
```

Additional QA specification:

```text
Test invalid paths, overlong input, unexpected characters, unknown scenarios,
valid route selection, public frontend path avoiding the external Content API,
Admin write route, headless read route, hypothetical CDN hit, reproducible trace
results, and static server HTTP behavior. Identify browser and manual tests
that cannot be independently completed in the build environment.
```

## C. Candidate AI assumptions: verified and corrected

These candidate hypotheses were considered in the assistant's analysis and deliberately **not copied into the finished architecture**. They are not presented as transcripts of separately submitted LLM responses.

| Candidate assumption | Evidence | Verified decision |
| --- | --- | --- |
| Ghost Admin is entirely Ember.js. | Ghost monorepo guide, Admin README | React Admin exists; legacy Ember coexists during migration. |
| Every Ghost frontend and API is a microservice. | Ghost runtime architecture | Ghost Core shares one Node.js process; code modules are not separately deployed services. |
| Theme rendering fetches public Content API via HTTP. | Ghost runtime architecture, frontend proxy description | Theme invokes in-process capabilities; headless client uses Content API HTTP. |
| Every production setup needs Redis/Kubernetes/sharded MySQL. | Ghost hosting guide | Recommended conventional stack is Node.js, MySQL and NGINX; Ghost states clustering/sharding not supported. |

### Audit evidence and sources

1. **Runtime boundaries** — https://github.com/TryGhost/Ghost/blob/main/docs/codebase/runtime-architecture.md
   - Core is one Node.js application with API routes, theme rendering and server-side services.
   - Built browser apps communicate over HTTP; internal theme capabilities do not always do so.
2. **Workspace / UI implementation** — https://github.com/TryGhost/Ghost/blob/main/docs/codebase/monorepo-structure.md
   - React Admin, legacy Ember Admin, Portal, Search, and Comment UI are separate browser apps.
3. **React Admin source** — https://github.com/TryGhost/Ghost/blob/main/apps/admin/README.md
   - Source explicitly names the React Admin app and its framework / design system.
4. **Official hosting** — https://docs.ghost.org/hosting/
   - Supported production stack and scaling recommendations; Ghost 6 optional separate services acknowledged.

## D. Initial output → verified customization summary

**AI-assisted draft elements produced:** baseline component registry, route scenarios, UI structure, deterministic request simulator, and documentation/QA plan. These are original companion application elements, not Ghost source files.

**Review changes / deliberate safeguards:**

- Modeled `public` path as `browser → ingress → theme → services → database` rather than incorrectly jumping to external Content API HTTP.
- Separated `headless` path through the actual Content API boundary.
- Clarified that NGINX and CDN are hosting/deployment-dependent infrastructure and a modeled cache hit is hypothetical.
- Labeled all timings synthetic and illustrative; did not state benchmark numbers as facts.
- Implemented strict request-path validation and user-facing errors instead of accepting arbitrary markup.
- Used `textContent` / DOM element creation for data instead of injecting unsafe HTML strings.
- Implemented semantic buttons, form labels, focus styles, responsive layouts, and automated tests.

## E. Limitations and integrity

No live Ghost instance, API key, MySQL database, deployment URL, or real production telemetry was available or used. No cross-browser pass is claimed without manual execution. A headless Chromium attempt from the restricted creation environment was blocked before navigation; manual browser verification remains outstanding until explicitly observed.
