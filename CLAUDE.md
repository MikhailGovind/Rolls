# Rolls — project standing instructions

**Source of truth:** `Rolls - Design & Technical Spec.dc.html` is the Design & Technical Specification for this app. Consult it whenever there is any doubt about vocabulary, design system, screen behavior, themes, data model, or the build plan — keep all work cohesive with it.

**Maintaining the spec:** Keep it reasonably current, but do NOT rewrite it on every small change. Update it when a change is significant (a new/changed screen, a design-system or theme change, a data-model or platform decision). When you update it, add a dated entry to its "Revision history" section.

**App vocabulary (use consistently):** Roll · Frame · Shelf (home) · Cosmos (Calendar → Map → Globe) · the dial · leader/canister.

**Design guardrails:** Hanken Grotesk (headings/UI/wordmark/roll titles) + DM Mono (labels, values, metadata). Warm-paper base (Portra default theme); film-stock themes each with light+dark; appearance = System/Light/Dark. Calm/analog/darkroom feel — no gradients, no emoji, no left-accent-border cards, no Inter/Roboto. Colors resolve through `--t-*` CSS custom properties (see `themes.js`). Mobile + desktop parity.

**Key files:** `Opening Screen.dc.html` (Shelf + Cosmos), `Frame Logging Screen.dc.html`, `Auth Screen.dc.html`, `themes.js` (palettes + `resolveTheme`). `Rolls - *.dc.html` files are the showcase/preview wrappers.
