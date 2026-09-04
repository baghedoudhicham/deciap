# DECIAP — Devpost submission draft

## One-line summary

DECIAP is a decision room where people and agents turn a launch brief into one defensible call.

## Description

### Why this is a strong WebMCP fit

High-stakes product decisions are difficult for agents because the useful context is usually trapped in a human's brief, scattered across documents, or hidden inside UI state. DECIAP exposes that decision state as typed browser tools. An agent can read the real brief, compare the available paths, inspect the evidence behind a recommendation, and stage a decision in the same room the person is reviewing.

This is not a chat transcript pretending to be a workflow. The agent operates on structured decision state, while the interface keeps the reasoning, tradeoffs, and next action visible.

### How it creates a better user experience

The product has one clear sequence: Frame → Compare → Commit. The recommended path is shown first, the comparison matrix explains why, and the pressure-test panel surfaces the proof still needed. Exploration and accountability are deliberately separated: an agent can stage a recommendation, but only the person can commit it.

There is no sign-in, API key, or setup ceremony. A seeded launch scenario makes the first interaction immediate, while the responsive layout keeps the hierarchy intact on smaller screens.

### What people and agents can do together

The agent can:

- read the current decision room and launch brief;
- update the brief when the person clarifies the goal, audience, or deadline;
- compare launch paths against weighted criteria;
- inspect a path's proof points and pressure-test;
- stage a recommendation for human review.

The person still owns the parts that require judgment: editing the brief, reviewing the tradeoffs, opening the proof, and committing the final call. Before DECIAP, this loop commonly required copying context into a chat, translating the answer back into a product document, and manually preserving the rationale. Here, people and agents work on the same state with an inspectable handoff.

### Implementation

DECIAP is a React + Vite frontend with five focused WebMCP tools registered in the browser through `document.modelContext.registerTool(...)`:

- `get_decision_room_state`
- `update_launch_brief`
- `compare_launch_paths`
- `inspect_launch_path`
- `stage_launch_decision`

Each tool has a typed input schema and an execute function that updates the same React state used by the visual interface. The demo uses deterministic local data and has no backend or external side effects, keeping the behavior reliable for judges. The repository includes source, assets, setup instructions, a design system, QA notes, and an MIT license.

## Judge test prompt

Open the live URL in ChatGPT's in-app browser and ask:

> Read the decision room. Compare the launch paths against the current brief, inspect the recommended path, and stage—but do not commit—the recommendation.

Then review the visible brief, matrix, proof panel, and staged decision. Click **Commit decision** to demonstrate the explicit human-only handoff.

## 2:30 demo run-of-show

1. Introduce the problem: launch decisions lose context when agents and people work in separate surfaces.
2. Show the DECIAP sequence: Frame → Compare → Commit.
3. Ask the agent to read the room, compare paths, inspect proof, and stage the recommendation.
4. Point out that the UI exposes the criteria, scoring, risks, and proof instead of hiding them in prose.
5. Edit or confirm the brief, then commit the choice as the human owner.
6. Close on the principle: agents can accelerate synthesis; people keep accountability.

## Final submission checklist

- [ ] Public live URL works in ChatGPT's in-app browser or Chrome with WebMCP enabled.
- [ ] Public source repository contains source, assets, instructions, `registerTool` implementation, and `LICENSE`.
- [ ] Public YouTube demo is under three minutes, has clear audio, and contains no third-party copyrighted music or marks.
- [ ] Devpost project name and branding use **DECIAP** consistently.
- [ ] Live URL, repository URL, and YouTube URL are pasted into the Devpost form.


