# DECIAP — visual QA

## Evidence

- Source visual truth: `C:/Users/Dell/Documents/Codex/2026-09-04/https-www-figma-com-design-hvtwjftuctsxjthkzdahms/work/figma-741-2.png`, captured from the provided Figma direction and inspected at 607 × 3000 source pixels.
- Final implementation: `http://localhost:4173/`, Codex in-app browser tab 5, opening state after reset.
- Implementation screenshot path: live CUA browser capture in Codex in-app browser tab 5; the connector exposes the accepted capture for inspection but does not expose a filesystem path for the PNG.
- Desktop capture: 1440 × 900 CSS pixels, 1× browser density. The CUA browser capture was inspected in-browser; the chat renderer resized the displayed image for presentation.
- Compact desktop capture: 927 × 534 CSS pixels, 1× browser density, confirming the stacked recommendation layout used by the current browser viewport.
- Mobile capture: 390 × 844 CSS pixels, 1× browser density. `scrollWidth` measured 375px against a 390px viewport, with no horizontal overflow.
- Focused interaction captures: path inspection, human staging, human commit, and reset were exercised in the live preview. The final preview was returned to the opening state.
- Console evidence: a fresh preview tab returned an empty error/warning log.

## Source relationship

The provided Figma source is a Big Data Supply marketplace screen, while this build is the selected DECIAP decision-architecture concept. This is an intentional product divergence, not a cloning task. The implementation carries forward the source's relevant visual language: black/white contrast, mint signal colour, hard rules, editorial display type, and dense but ordered information surfaces.

## Comparison

### Full view

The source uses a strong dark opening field followed by white data sections and a cyan anchor. DECIAP keeps that same black/white/mint cadence, but gives the recommendation a dedicated dark column so the user sees the proposed call before scanning the matrix. The three-step `Frame → Compare → Commit` sequence makes the task hierarchy explicit.

### Focused regions

- Hero and recommendation: inspected at 1440 × 900 and 927 × 534. The DECIAP wordmark, tight display type, mint decision phrase, and recommendation score form one clear entry point.
- Matrix rows: inspected in the scrolled wide view. The recommended path has a mint rail and quiet alternatives; each row has one proof action rather than multiple competing controls.
- Proof and commit: inspected in the scrolled wide view and through the staged/committed states. Evidence, pressure points, decision note, and human commit are separate visual steps.
- Mobile: inspected at 390 × 844 and after scrolling through the matrix, proof, commit, and changes sections. The hierarchy remains intact and actions stay readable.

## Comparison history

### Pass 1 — baseline audit

- Finding: [P2] The opening surface gave equal emphasis to room telemetry, matrix ranking, and review, with labels such as “LIVE NOTE”, “RANKED LIVE”, “LOCAL SESSION”, and “STATE v01”.
- Fix: replaced telemetry language with a decision sequence, a single recommendation spine, “Next move” guidance, and user-centred labels: “Frame”, “Compare”, “Pressure test”, and “Commit”.
- Finding: [P2] The existing `DR / Decision Room` lockup read as a placeholder rather than an authored product identity.
- Fix: replaced the placeholder lockup with the supplied custom DECIAP wordmark asset and documented the colour/type system.

### Pass 2 — post-fix review

- P0: none.
- P1: none.
- P2: none.
- Post-fix evidence: the fresh preview rendered the revised title, wordmark, decision sequence, recommendation, proof panel, and commit gate; wide and mobile captures showed no layout break or overflow.

### Pass 3 — supplied logo integration

- Finding: [P1] The product identity still used a generated placeholder lockup rather than the supplied authored mark.
- Fix: added the exact source asset at `public/assets/deciap-wordmark.svg` and replaced the placeholder markup with an image using its native 196 × 69 proportions.
- Post-fix evidence: the fresh preview loaded the asset successfully at 111 × 39.075 CSS pixels, with natural dimensions 196 × 69 and an empty error/warning log. Mobile retained the same asset without overflow.

## Required fidelity surfaces

- Fonts and typography: checked display family fallback, tight headline tracking, compact mono metadata, score alignment, body line-height, wrapping, and mobile scaling. The exact source font is not bundled; the self-contained fallback is intentional and recorded as P3.
- Spacing and layout rhythm: checked page gutters, panel padding, rules, asymmetric column proportions, recommendation height, path-row density, sticky proof panel, and mobile stacking.
- Colours and visual tokens: checked deep hero, paper panels, warm canvas, mint recommendation/advantage, amber pressure points, blue human changes, and rule contrast against the source direction.
- Image quality and asset fidelity: the supplied custom wordmark is used as the real SVG asset at `public/assets/deciap-wordmark.svg`; no source imagery or custom icon asset was substituted. The optional standalone icon was not added because it would duplicate the wordmark without improving comprehension.
- Copy and content: removed generic monitoring language and kept only content needed to frame, compare, pressure-test, and commit a decision. Agent capability remains in the registered tool layer and shared state rather than dominating the human-facing copy.

## Interaction and accessibility spot-check

- Primary controls work: reset case, brief edit, time edit, weighting sliders, recalculate fit, test recommendation, open proof, use this path, edit rationale, and commit decision.
- Staging and commitment remain distinct; the final commit is human-controlled and disabled after commitment.
- Inputs have visible labels, controls have descriptive names, focus outlines are defined, and status is not conveyed by colour alone.
- `prefers-reduced-motion` is respected for the small hover transitions.

## Findings

- P0: none.
- P1: none.
- P2: none.
- P3: the exact Figma typeface is not bundled; the system fallback preserves the intended compressed editorial hierarchy without an external font dependency.

final result: passed

