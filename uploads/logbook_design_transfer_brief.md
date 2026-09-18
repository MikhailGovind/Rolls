# Logbook — Design Transfer Brief

## What it is
A mobile film photography logbook app. Tracks every frame of a roll — exposure data, location, images, notes. Built by Miks (Unreal Engine developer, also a game design lecturer, photographer, musician, artist).

## Core UX principle
**Speed over completeness.** Users are shooting on the fly. Logging a frame must take minimal taps. Every UX decision gets evaluated against this constraint first — if a flow adds friction, it's wrong, even if it's "more complete."

## Aesthetic direction
Warm, paper-like, calm — eggshell whites, tawny browns, muted ambers. Deliberately evokes a physical logbook: tactile, analog, grounded in real camera/film hardware references (not flat "skeuomorphism for its own sake" — actual mimicry of how film and cameras physically work).

**Exception:** the calendar/map tab intentionally breaks this — dark space aesthetic, globe view. Contrast is deliberate.

## Three colour themes
- **Matte Graphite** (default)
- **Modern Original**
- **Fujifilm Velvia**

## Screens designed (v0 stage)
1. **Rolls start screen** — roll cards, three-dot context menu (PDF generation, roll management)
2. **Main frame logging page** — film header with horizontal perforation strips; film advance dial styled like a camera advance knob viewed from the side; tap-to-edit inline fields with bottom sheet pickers (scroll wheel for aperture/shutter/distance, chip selectors for light conditions, GPS location search, auto-stamped date/time)
3. **Calendar/map tab** — dark space aesthetic, globe view
4. **Settings/profile screen** — functional toggles, live theme switching
5. **PDF export preview** — cover page, choice of 3-frames-per-page or 1-frame-per-page layout

## Known sensitivities (read before touching these)
- **Buttons must look dark/active at rest** — not reliant on hover state. This has been corrected multiple times. Don't let it regress.
- **Film canister roll icon** — the most fought-over asset in the whole project. Target look: minimal outline-style canister, spool prongs top and bottom, a single colour band as the only fill, C-shaped film leader with perforation dots along both edges. Explicitly **not** cartoonish, chubby, or overly rounded. If a generated version drifts toward "cute," revert — don't iterate forward on it.

## Target build environment
Originally scoped for hand-off to **v0** (Vercel's AI frontend builder). Now considering **Claude Design** as an alternative/parallel path, given its design-system import and scratchpad/annotation features — worth testing for the canister icon work specifically, since sketching corrections directly may be faster than describing them.

## Tools/context
- Miks works in Claude's desktop web app (the iPhone Claude app doesn't support the visualizer tool).
- Background: Unreal Engine development, game design lecturing.
