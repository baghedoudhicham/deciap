# DECIAP

DECIAP is a single-page WebMCP prototype for turning a messy product-launch brief into one defensible call.

The page keeps the human and the agent in the same decision surface:

- The human edits the brief and weighting criteria.
- The agent can read the room, compare launch paths, open evidence, and stage a recommendation.
- The human reviews the rationale and commits the final decision.

The demo uses deterministic seeded data so every tool call is inspectable and repeatable. There is no login, backend, external API key, payment flow, or external side effect.

The visual system is documented in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). `DECIAP` is the current working identity; the UI keeps the wordmark in one place so `DESIAP` can be tested later without changing the interaction model.

## WebMCP tools

- get_decision_room_state
- update_launch_brief
- compare_launch_paths
- inspect_launch_path
- stage_launch_decision

The tools are registered imperatively at the top level with document.modelContext.registerTool(). The application remains usable with ordinary controls when WebMCP is not available.

## Try the agent journey

Open the hosted page in a WebMCP-enabled browser and ask:

> We need to launch a useful public web product in eight hours, with no login, one clear user task, strong differentiation, and low delivery risk. Read the decision room, compare the launch paths, inspect the best two, and stage—but do not commit—the recommendation.

The staged recommendation is intentionally reversible. Use the human button to commit it.

## Local development

~~~bash
npm install
npm run dev
~~~

Production checks:

~~~bash
npm run build
npm run test:sites
~~~

The prototype is designed for a static HTTPS deployment such as Vercel, Cloudflare Pages, Netlify, or Render.

