# DECIAP — interface system

DECIAP is a decision architecture: a calm, evidence-led surface for making one consequential call. The visual language is deliberately editorial and exacting—strong dark/light structure, a protected identity gradient, three functional accent roles, compact technical labels, and no decorative noise.

## Brand

- Primary working name: `DECIAP`.
- Wordmark: the supplied custom `DECIAP` SVG, used as the real source asset at `public/assets/deciap-wordmark.svg`. Its mint-to-deep-green gradient remains protected as the identity signature, not sprayed across the interface.
- Alternate under test: `DESIAP`. The wordmark is isolated in `src/App.jsx`, so the alternate can be tested without changing the product hierarchy.
- Brand promise: choose one path, know why.

## Colour tokens

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#101B1A` | Primary type, rules, active controls |
| Deep | `#0C1817` | Hero, commit action, proof panel |
| Paper | `#FBFBF6` | Main surfaces and form fields |
| Canvas | `#F2F0E8` | Warm page background and negative space |
| Signal mint | `#65E8CA` | Recommendation, progress, primary action |
| Mint dark | `#0A7F69` | Accessible text, rails, score bars |
| Pressure coral | `#EF685C` | Trade-offs and unresolved risk |
| Human blue | `#5967FF` | Human-authored changes and focused proof |
| Rule | `#D6D9D0` | Borders and dividers |

Mint is reserved for “this helps the decision”. Coral is reserved for “look closer”. Blue identifies a human action or the proof currently in focus. No accent colour is used as decoration.

## Type system

- Display: `Arial Narrow`, `Helvetica Neue`, `Segoe UI`, Arial, sans-serif.
- Body: `Inter`, `Helvetica Neue`, `Segoe UI`, Arial, sans-serif.
- Technical labels: `IBM Plex Mono`, `SFMono-Regular`, Consolas, monospace.
- Display headlines use tight tracking (`-0.07em` to `-0.085em`) and short line-height (`0.86–0.98`) to create a decisive silhouette.
- Body copy stays between 1.4 and 1.55 line-height so evidence remains scan-friendly.
- Technical labels use uppercase, 8–9px sizing, and deliberate tracking; they are metadata, never the main message.
- Numeric scores use tabular monospace styling so comparisons align visually.

## Spacing and shape

- Base rhythm: 6px micro steps, 13px section gaps, 20–27px panel padding, 48px page gutters on wide screens.
- Surfaces use square corners or a 1px rule. No pill-shaped containers are used for ordinary content.
- Depth comes from one restrained shadow on the hero and near-flat panels elsewhere.
- The page is intentionally asymmetric: the recommendation receives a dark column, the matrix carries the largest width, and proof stays visually quieter until opened.

## Core components

- `Wordmark`: supplied DECIAP lockup with its original proportions and gradient.
- `Decision sequence`: Frame → Compare → Commit. This replaces generic dashboard status language with the actual user journey.
- `Recommendation`: one prominent path, one fit score, one reason, one next action.
- `Brief panel`: raw brief, time available, hard constraints, and five adjustable priorities.
- `Path row`: rank, path, fit, four-signal profile, and a single “Open proof” action.
- `Proof panel`: selected path, evidence, pressure points, and the decision note.
- `Commit gate`: draft first; human commit second. The final action is explicit and never implied by an agent action.
- `Changes`: compact trust layer showing what moved, without pretending to be a monitoring dashboard.

## Content rules

- Prefer verbs and concrete nouns: “Open proof”, “Use this path”, “Commit decision”.
- Avoid synthetic product language such as “live”, “system status”, “ranked live”, “AI-powered”, “seamless”, and “unlock”.
- Keep one primary question visible per panel: what must be true, three ways forward, what could break, make the call.
- Explain a score with evidence and pressure points; never let the number stand alone.
- Keep agent capability in the tool layer and the shared state model. The human-facing UI should read as a clear decision tool first.

## Responsive rules

- Wide: three-column decision surface with sticky proof panel.
- Mid: brief + matrix first; proof becomes a full-width review panel.
- Small: one column, stacked recommendation, readable path rows, hidden secondary profile numbers, and full-width actions.
- Minimum tested width: 390px with no horizontal overflow.

