import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CRITERIA = [
  { key: "speed", label: "Speed", short: "SPD" },
  { key: "impact", label: "User value", short: "VAL" },
  { key: "distinctiveness", label: "Distinctiveness", short: "DST" },
  { key: "confidence", label: "Delivery confidence", short: "CNF" },
  { key: "maintainability", label: "Maintainability", short: "MNT" },
];

const PATHS = [
  {
    id: "lean-site",
    index: "01",
    name: "Lean conversion site",
    label: "Lower risk",
    description: "A focused public surface with one high-confidence task and minimal moving parts.",
    profile: { speed: 94, impact: 63, distinctiveness: 48, confidence: 91, maintainability: 86 },
    summary: "The safest route to a polished launch, with less room for adaptive help.",
    evidence: [
      { label: "Time to first use", value: "4–6 hrs", note: "One route, one task, no external services.", tone: "positive" },
      { label: "Shared context", value: "Narrow", note: "Mostly read-only guidance and a structured handoff.", tone: "neutral" },
      { label: "Primary tension", value: "Low distinction", note: "Could feel like a strong marketing site, not a new interaction model.", tone: "watch" },
    ],
    tradeoffs: ["Most confident delivery", "Less room for adaptive help", "Shared context stays narrow"],
  },
  {
    id: "agent-native",
    index: "02",
    name: "Agent-native workflow",
    label: "Recommended",
    description: "A compact workspace where an agent structures the brief and a human decides what ships.",
    profile: { speed: 78, impact: 88, distinctiveness: 96, confidence: 78, maintainability: 74 },
    summary: "The best balance of a memorable first release and a controlled delivery surface.",
    evidence: [
      { label: "Time to first use", value: "6–8 hrs", note: "One shared state model with a small, testable tool surface.", tone: "positive" },
      { label: "Shared context", value: "Rich", note: "Five typed actions update the same visible decision room.", tone: "positive" },
      { label: "Primary tension", value: "Tool clarity", note: "The journey must stay narrow enough for a three-minute explanation.", tone: "watch" },
    ],
    tradeoffs: ["Most memorable interaction", "Human approval stays explicit", "Needs disciplined scope"],
  },
  {
    id: "full-platform",
    index: "03",
    name: "Full platform build",
    label: "High scope",
    description: "A multi-surface product with accounts, integrations, and a broader operating model.",
    profile: { speed: 34, impact: 92, distinctiveness: 82, confidence: 36, maintainability: 52 },
    summary: "The largest long-term opportunity, but too much surface area for this release window.",
    evidence: [
      { label: "Time to first use", value: "12+ hrs", note: "Multiple states and services need to be made believable.", tone: "watch" },
      { label: "Shared context", value: "Broad", note: "Powerful in theory, but harder to explain and test.", tone: "neutral" },
      { label: "Primary tension", value: "Scope drift", note: "A wide product can hide the core human and agent moment.", tone: "watch" },
    ],
    tradeoffs: ["Highest long-term upside", "Weakest deadline fit", "Too many unproven dependencies"],
  },
];

const DEFAULT_WEIGHTS = {
  speed: 26,
  impact: 24,
  distinctiveness: 22,
  confidence: 18,
  maintainability: 10,
};

const DEFAULT_BRIEF = {
  text: "We need to launch a useful public web product by tomorrow. It should solve one concrete problem, work without sign-in, prove its value in under three minutes, and remain maintainable after the demo.",
  deadlineHours: 8,
  mustHaves: ["No sign-in", "One core task", "3-minute proof", "Agent access"],
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getRankedPaths(criteria) {
  const total = Object.values(criteria).reduce((sum, value) => sum + value, 0) || 1;

  return PATHS.map((path) => {
    const score = Math.round(
      CRITERIA.reduce((sum, criterion) => {
        return sum + path.profile[criterion.key] * (criteria[criterion.key] || 0);
      }, 0) / total,
    );

    return { id: path.id, score };
  }).sort((a, b) => b.score - a.score);
}

function createInitialRoom() {
  return {
    brief: DEFAULT_BRIEF,
    criteria: DEFAULT_WEIGHTS,
    ranking: getRankedPaths(DEFAULT_WEIGHTS),
    focusedPathId: "agent-native",
    draft: null,
    committedAt: null,
    stateVersion: 1,
  };
}

function buildStatePayload(room) {
  return {
    stateVersion: room.stateVersion,
    brief: room.brief,
    criteria: room.criteria,
    ranking: room.ranking.map((item) => ({
      ...item,
      name: PATHS.find((path) => path.id === item.id)?.name,
    })),
    focusedPathId: room.focusedPathId,
    draft: room.draft,
    committedAt: room.committedAt,
  };
}

function successResponse(room, message, data = {}) {
  return {
    ok: true,
    message,
    stateVersion: room.stateVersion,
    data,
  };
}

function errorResponse(message, stateVersion) {
  return {
    ok: false,
    message,
    stateVersion,
  };
}

function formatClock(isoDate) {
  if (!isoDate) return "Not committed";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function ScoreBar({ score }) {
  return (
    <div className="score-bar" role="img" aria-label={score + " out of 100"}>
      <span style={{ width: score + "%" }} />
    </div>
  );
}

function SignalMark({ tone = "mint" }) {
  return <span className={"signal-mark " + tone} aria-hidden="true" />;
}

export function App() {
  const [room, setRoom] = useState(createInitialRoom);
  const [activity, setActivity] = useState([
    { id: 1, actor: "Room", text: "Brief loaded", tone: "room" },
    { id: 2, actor: "Room", text: "Three paths ready", tone: "room" },
  ]);
  const [notice, setNotice] = useState("Start with the brief, then test the path that wins.");
  const [webmcpStatus, setWebmcpStatus] = useState("checking");
  const roomRef = useRef(room);

  const pathById = useMemo(() => Object.fromEntries(PATHS.map((path) => [path.id, path])), []);
  const rankedPaths = useMemo(
    () => room.ranking.map((item) => ({ ...pathById[item.id], score: item.score })).filter(Boolean),
    [pathById, room.ranking],
  );
  const focusedPath = pathById[room.focusedPathId] || PATHS[1];
  const focusedScore = room.ranking.find((item) => item.id === focusedPath.id)?.score || 0;
  const recommendedPath = rankedPaths[0] || { ...PATHS[1], score: 0 };
  const rationaleReady = Boolean(room.draft?.rationale?.trim());

  const commitRoom = useCallback((nextRoom) => {
    roomRef.current = nextRoom;
    setRoom(nextRoom);
    return nextRoom;
  }, []);

  const notify = useCallback((message) => {
    setNotice(message);
  }, []);

  const addActivity = useCallback((actor, text, tone = "agent") => {
    setActivity((current) => [
      { id: String(Date.now()) + "-" + Math.random(), actor, text, tone },
      ...current,
    ].slice(0, 6));
  }, []);

  const getState = useCallback(() => {
    const current = roomRef.current;
    return successResponse(current, "Decision room state returned.", buildStatePayload(current));
  }, []);

  const updateLaunchBrief = useCallback((input = {}, actor = "Agent") => {
    const current = roomRef.current;
    const text = typeof input.brief === "string" ? input.brief.trim() : current.brief.text;
    if (!text) {
      return errorResponse("A launch brief is required before the room can be updated.", current.stateVersion);
    }

    const requestedDeadline = input.deadlineHours === undefined
      ? current.brief.deadlineHours
      : Number(input.deadlineHours);

    if (!Number.isFinite(requestedDeadline) || requestedDeadline < 1 || requestedDeadline > 168) {
      return errorResponse("deadlineHours must be a number between 1 and 168.", current.stateVersion);
    }

    const mustHaves = Array.isArray(input.mustHaves)
      ? input.mustHaves.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()).slice(0, 8)
      : current.brief.mustHaves;

    const next = {
      ...current,
      brief: { text, deadlineHours: requestedDeadline, mustHaves },
      stateVersion: current.stateVersion + 1,
    };

    commitRoom(next);
    addActivity(actor === "Agent" ? "Agent" : "Human", "Brief updated · " + requestedDeadline + " hour window", actor === "Agent" ? "agent" : "human");
    notify("Brief updated. Recheck the fit when the constraints feel right.");
    return successResponse(next, "Launch brief updated.", { brief: next.brief });
  }, [addActivity, commitRoom, notify]);

  const compareLaunchPaths = useCallback((input = {}, actor = "Agent") => {
    const current = roomRef.current;
    const incomingPriorities = input.priorities && typeof input.priorities === "object"
      ? input.priorities
      : {};
    const nextCriteria = CRITERIA.reduce((criteria, criterion) => {
      const value = incomingPriorities[criterion.key];
      criteria[criterion.key] = value === undefined
        ? current.criteria[criterion.key]
        : clamp(Number(value) || 0, 0, 100);
      return criteria;
    }, {});
    const ranking = getRankedPaths(nextCriteria);
    const topPath = pathById[ranking[0].id];
    const next = {
      ...current,
      criteria: nextCriteria,
      ranking,
      focusedPathId: ranking[0].id,
      stateVersion: current.stateVersion + 1,
    };

    commitRoom(next);
    addActivity(actor === "Agent" ? "Agent" : "Human", "Fit recalculated · " + topPath.name + " leads", actor === "Agent" ? "agent" : "human");
    notify("Fit recalculated. Review the path that moved to the top.");
    return successResponse(next, "Launch paths compared and ranked.", {
      topPath: { id: topPath.id, name: topPath.name, score: ranking[0].score },
      ranking,
    });
  }, [addActivity, commitRoom, notify, pathById]);

  const inspectLaunchPath = useCallback((input = {}, actor = "Agent") => {
    const current = roomRef.current;
    const path = pathById[input.pathId];
    if (!path) {
      return errorResponse("pathId must be one of lean-site, agent-native, or full-platform.", current.stateVersion);
    }

    const next = {
      ...current,
      focusedPathId: path.id,
      stateVersion: current.stateVersion + 1,
    };
    commitRoom(next);
    addActivity(actor === "Agent" ? "Agent" : "Human", "Proof opened · " + path.name, actor === "Agent" ? "agent" : "human");
    notify("Proof opened for " + path.name + ".");
    if (actor === "Human") {
      window.requestAnimationFrame(() => {
        document.querySelector(".ledger-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    return successResponse(next, "Launch path evidence opened.", {
      path: {
        id: path.id,
        name: path.name,
        summary: path.summary,
        profile: path.profile,
        evidence: path.evidence,
        tradeoffs: path.tradeoffs,
      },
    });
  }, [addActivity, commitRoom, notify, pathById]);

  const stageLaunchDecision = useCallback((input = {}, actor = "Agent") => {
    const current = roomRef.current;
    const path = pathById[input.pathId];
    const rationale = typeof input.rationale === "string" ? input.rationale.trim() : "";
    if (!path) {
      return errorResponse("pathId must reference a valid launch path.", current.stateVersion);
    }
    if (!rationale) {
      return errorResponse("A rationale is required before staging a decision.", current.stateVersion);
    }

    const unresolvedRisks = Array.isArray(input.unresolvedRisks)
      ? input.unresolvedRisks.filter((risk) => typeof risk === "string" && risk.trim()).map((risk) => risk.trim()).slice(0, 5)
      : [];
    const next = {
      ...current,
      focusedPathId: path.id,
      draft: {
        pathId: path.id,
        rationale,
        unresolvedRisks,
        status: "staged",
        stagedAt: new Date().toISOString(),
      },
      committedAt: null,
      stateVersion: current.stateVersion + 1,
    };

    commitRoom(next);
    addActivity(actor === "Agent" ? "Agent" : "Human", "Choice staged · " + path.name, actor === "Agent" ? "agent" : "human");
    notify("Choice staged. Check the note before committing.");
    return successResponse(next, "Decision staged for human review.", { draft: next.draft });
  }, [addActivity, commitRoom, notify, pathById]);

  const updateWeight = useCallback((key, value) => {
    const current = roomRef.current;
    const nextCriteria = { ...current.criteria, [key]: Number(value) };
    const ranking = getRankedPaths(nextCriteria);
    const next = {
      ...current,
      criteria: nextCriteria,
      ranking,
      focusedPathId: current.focusedPathId,
      stateVersion: current.stateVersion + 1,
    };
    commitRoom(next);
    notify("Fit updated from your weighting.");
  }, [commitRoom, notify]);

  const updateDraftRationale = useCallback((value) => {
    const current = roomRef.current;
    if (!current.draft) return;
    commitRoom({
      ...current,
      draft: { ...current.draft, rationale: value },
      stateVersion: current.stateVersion + 1,
    });
  }, [commitRoom]);

  const commitDecision = useCallback(() => {
    const current = roomRef.current;
    if (!current.draft) {
      notify("Use a path before committing the decision.");
      return;
    }
    if (!current.draft.rationale.trim()) {
      notify("Add a reason before committing the decision.");
      return;
    }
    const next = {
      ...current,
      committedAt: new Date().toISOString(),
      draft: { ...current.draft, status: "committed" },
      stateVersion: current.stateVersion + 1,
    };
    commitRoom(next);
    addActivity("Human", "Decision committed · " + pathById[next.draft.pathId].name, "human");
    notify("Decision committed. The reason stays with the choice.");
  }, [addActivity, commitRoom, notify, pathById]);

  const resetRoom = useCallback(() => {
    const next = createInitialRoom();
    commitRoom(next);
    setActivity([
      { id: String(Date.now()) + "-reset", actor: "Human", text: "Brief reset", tone: "human" },
      { id: String(Date.now()) + "-seed", actor: "Room", text: "Three paths ready", tone: "room" },
    ]);
    notify("Brief reset. The three paths are ready to compare.");
  }, [commitRoom, notify]);

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext || typeof modelContext.registerTool !== "function") {
      setWebmcpStatus("unavailable");
      return undefined;
    }

    const toolDefinitions = [
      {
        name: "get_decision_room_state",
        description: "Read the current launch brief, criteria, ranking, focused evidence, and staged decision.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true },
        execute: async () => getState(),
      },
      {
        name: "update_launch_brief",
        description: "Update the launch brief and constraints using raw user-provided text.",
        inputSchema: {
          type: "object",
          properties: {
            brief: { type: "string", description: "The concise launch brief." },
            deadlineHours: { type: "number", description: "Available hours, from 1 to 168." },
            mustHaves: { type: "array", items: { type: "string" }, description: "Non-negotiable constraints." },
          },
          required: ["brief"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, consequentialHint: false, untrustedContentHint: true },
        execute: async (input) => updateLaunchBrief(input || {}),
      },
      {
        name: "compare_launch_paths",
        description: "Rank the three launch paths against typed priorities and constraints.",
        inputSchema: {
          type: "object",
          properties: {
            priorities: {
              type: "object",
              description: "Weights from 0 to 100 for speed, impact, distinctiveness, confidence, and maintainability.",
              properties: {
                speed: { type: "number" },
                impact: { type: "number" },
                distinctiveness: { type: "number" },
                confidence: { type: "number" },
                maintainability: { type: "number" },
              },
              additionalProperties: false,
            },
            constraints: { type: "array", items: { type: "string" }, description: "Optional constraints to keep visible." },
          },
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, consequentialHint: false },
        execute: async (input) => compareLaunchPaths(input || {}),
      },
      {
        name: "inspect_launch_path",
        description: "Open one launch path and return its evidence, profile, and trade-offs.",
        inputSchema: {
          type: "object",
          properties: {
            pathId: { type: "string", enum: ["lean-site", "agent-native", "full-platform"], description: "Launch path identifier." },
          },
          required: ["pathId"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: async (input) => inspectLaunchPath(input || {}),
      },
      {
        name: "stage_launch_decision",
        description: "Stage a recommendation for human review without committing it.",
        inputSchema: {
          type: "object",
          properties: {
            pathId: { type: "string", enum: ["lean-site", "agent-native", "full-platform"], description: "Chosen launch path." },
            rationale: { type: "string", description: "Why this path fits the brief." },
            unresolvedRisks: { type: "array", items: { type: "string" }, description: "Risks the human should review." },
          },
          required: ["pathId", "rationale"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, consequentialHint: false },
        execute: async (input) => stageLaunchDecision(input || {}),
      },
    ];

    const registrations = toolDefinitions.map((tool) => modelContext.registerTool(tool));
    setWebmcpStatus("ready");
    setNotice("Workspace ready. Start with the brief, then test the path that wins.");
    addActivity("Agent", "Workspace connected", "agent");

    return () => {
      registrations.forEach((registration, index) => {
        if (typeof registration === "function") {
          registration();
        } else if (registration && typeof registration.unregister === "function") {
          registration.unregister();
        } else if (typeof modelContext.unregisterTool === "function") {
          modelContext.unregisterTool(toolDefinitions[index].name);
        }
      });
    };
  }, [addActivity, compareLaunchPaths, getState, inspectLaunchPath, stageLaunchDecision, updateLaunchBrief]);

  return (
    <div className="app-frame">
      <header className="topbar">
        <a className="wordmark" href="#room" aria-label="DECIAP home">
          <img className="wordmark-image" src="/assets/deciap-wordmark.svg" alt="DECIAP" />
        </a>
        <div className="topbar-meta">
          <span className="topbar-caption">Decision architecture / 01</span>
          <button className="text-button" type="button" onClick={resetRoom}>Reset case</button>
        </div>
      </header>

      <main className="workspace" id="room">
        <section className="hero-card">
          <div className="hero-copy">
            <div>
              <div className="eyebrow light">Decision architecture / launch</div>
              <h1>Choose one path.<br /><span>Know why.</span></h1>
              <p>DECIAP turns a launch brief into one clear choice. It compares three paths, shows the trade-offs, and keeps your reason with the decision.</p>
            </div>
            <div className="hero-bottom">
              <div className="decision-sequence" aria-label="Decision sequence">
                <span className="sequence-item active"><strong>01</strong> Frame</span>
                <span className="sequence-rule" aria-hidden="true" />
                <span className="sequence-item"><strong>02</strong> Compare</span>
                <span className="sequence-rule" aria-hidden="true" />
                <span className="sequence-item"><strong>03</strong> Commit</span>
              </div>
              <span className="hero-note">Evidence before commitment</span>
            </div>
          </div>

          <div className="hero-choice">
            <div className="choice-topline">
              <span className="eyebrow light">Current recommendation</span>
              <div className="choice-score-wrap">
                <span className="choice-score">{recommendedPath.score}</span>
                <span className="choice-score-meta">fit score</span>
              </div>
            </div>
            <div className="choice-fit" role="img" aria-label={recommendedPath.score + " out of 100 fit score"}>
              <span style={{ width: recommendedPath.score + "%" }} />
            </div>
            <div className="choice-index"><strong>{recommendedPath.index}</strong><span>fit score / 100</span></div>
            <h2>{recommendedPath.name}</h2>
            <p>{recommendedPath.summary}</p>
            <button className="choice-button" type="button" onClick={() => inspectLaunchPath({ pathId: recommendedPath.id }, "Human")}>
              Test this path <span aria-hidden="true">↗</span>
            </button>
          </div>
        </section>

        <div className="notice-bar" role="status" aria-live="polite">
          <span className="notice-index">Next move</span>
          <span>{notice}</span>
          <span className="notice-deadline">{room.brief.deadlineHours} hrs</span>
        </div>

        <div className="workspace-grid">
          <aside className="panel brief-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">01 / Frame</span>
                <h2>What must be true?</h2>
              </div>
              <span className="panel-code">BRIEF</span>
            </div>
            <p className="panel-intro">State the call in plain language. Keep the constraints that can change the answer.</p>
            <label className="field-label" htmlFor="launch-brief">Brief</label>
            <textarea
              id="launch-brief"
              className="brief-input"
              value={room.brief.text}
              onChange={(event) => {
                const next = { ...roomRef.current, brief: { ...roomRef.current.brief, text: event.target.value }, stateVersion: roomRef.current.stateVersion + 1 };
                commitRoom(next);
              }}
              onBlur={() => notify("Brief edited. Recalculate when the constraints feel right.")}
            />
            <div className="brief-meta">
              <label className="mini-field">
                <span className="field-label">Time available</span>
                <span className="number-input-wrap">
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={room.brief.deadlineHours}
                    onChange={(event) => updateLaunchBrief({ brief: room.brief.text, deadlineHours: event.target.value }, "Human")}
                  />
                  <span>hrs</span>
                </span>
              </label>
              <div className="mini-field">
                <span className="field-label">Hard constraints</span>
                <span className="signal-count">{String(room.brief.mustHaves.length).padStart(2, "0")} <span>held</span></span>
              </div>
            </div>
            <div className="tag-list" aria-label="Hard constraints">
              {room.brief.mustHaves.map((tag) => <span className="constraint-tag" key={tag}>{tag}</span>)}
            </div>

            <div className="section-divider" />
            <div className="subheading-row">
              <div>
                <span className="eyebrow">Weight the call</span>
                <h3>What wins if it gets tight?</h3>
              </div>
              <span className="mono-note">0 to 100</span>
            </div>
            <div className="criteria-list">
              {CRITERIA.map((criterion) => (
                <label className="criterion" key={criterion.key}>
                  <span className="criterion-topline">
                    <span>{criterion.label}</span>
                    <strong>{room.criteria[criterion.key]}</strong>
                  </span>
                  <input
                    aria-label={criterion.label + " priority"}
                    type="range"
                    min="0"
                    max="100"
                    value={room.criteria[criterion.key]}
                    onChange={(event) => updateWeight(criterion.key, event.target.value)}
                    style={{ "--range-fill": room.criteria[criterion.key] + "%" }}
                  />
                </label>
              ))}
            </div>
            <button className="primary-button full-button" type="button" onClick={() => compareLaunchPaths({ priorities: room.criteria }, "Human")}>
              Recalculate fit <span aria-hidden="true">↗</span>
            </button>
            <p className="micro-copy">Weights shift the recommendation; the evidence remains inspectable.</p>
          </aside>

          <section className="panel matrix-panel">
            <div className="panel-heading matrix-heading">
              <div>
                <span className="eyebrow">02 / Compare</span>
                <h2>Three ways forward</h2>
              </div>
              <div className="matrix-meta">
                <span className="path-count">03 paths</span>
                <span className="panel-code">FIT / 100</span>
              </div>
            </div>
            <div className="matrix-intro">
              <p>Compare each path using the same five criteria.</p>
              <span className="scale-note">strength →</span>
            </div>
            <div className="matrix-columns">
              <span>Path</span>
              <span>Fit</span>
              <span title="Speed, user value, distinctiveness, and delivery confidence.">Profile</span>
              <span>Proof</span>
            </div>
            <div className="path-list">
              {rankedPaths.map((path, index) => (
                <article className={["path-row", path.id === recommendedPath.id ? "recommended" : "", path.id === room.focusedPathId ? "focused" : ""].filter(Boolean).join(" ")} key={path.id}>
                  <div className="path-rank">{String(index + 1).padStart(2, "0")}</div>
                  <div className="path-main">
                    <div className="path-title-line">
                      <h3>{path.name}</h3>
                      <span className={"path-label " + (path.id === recommendedPath.id ? "best-label" : "")}>{path.id === recommendedPath.id ? "Recommended" : path.label}</span>
                    </div>
                    <p>{path.description}</p>
                    <div className="path-mobile-score">
                      <span>FIT</span><strong>{path.score}</strong>
                    </div>
                  </div>
                  <div className="path-score">
                    <div className="score-number">{path.score}</div>
                    <ScoreBar score={path.score} />
                    <span className="score-caption">out of 100</span>
                  </div>
                  <div className="profile-grid">
                    {CRITERIA.slice(0, 4).map((criterion) => (
                      <div
                        className="profile-item"
                        key={criterion.key}
                      >
                        <abbr
                          className="metric-abbr"
                          title={criterion.label + ": " + path.profile[criterion.key] + " out of 100"}
                          aria-label={criterion.label + ": " + path.profile[criterion.key] + " out of 100"}
                          tabIndex="0"
                        >
                          {criterion.short}
                        </abbr>
                        <strong>{path.profile[criterion.key]}</strong>
                      </div>
                    ))}
                  </div>
                  <button
                    className={"row-action " + (path.id === room.focusedPathId ? "active" : "")}
                    type="button"
                    aria-pressed={path.id === room.focusedPathId}
                    aria-label={(path.id === room.focusedPathId ? "Proof open for " : "Open proof for ") + path.name}
                    onClick={() => inspectLaunchPath({ pathId: path.id }, "Human")}
                  >
                    {path.id === room.focusedPathId ? "Proof open" : "Open proof"} <span aria-hidden="true">↗</span>
                  </button>
                </article>
              ))}
            </div>
            <div className="matrix-footer">
              <span className="legend-copy"><i className="legend-dot mint" /> advantage <i className="legend-dot coral" /> pressure point</span>
              <span className="mono-note" title="Every path uses the same five weighted criteria.">same scale / five criteria</span>
            </div>
          </section>

          <aside className="panel ledger-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">03 / Pressure test</span>
                <h2>What could break?</h2>
              </div>
              <span className="panel-code">{focusedPath.index} / {focusedScore}</span>
            </div>
            <div className="focused-path">
              <div className="focused-path-topline">
                <span className="eyebrow">Proof open</span>
                <span className="focused-score">{focusedScore}<small>/100</small></span>
              </div>
              <h3>{focusedPath.name}</h3>
              <p>{focusedPath.summary}</p>
            </div>
            <div className="evidence-list">
              {focusedPath.evidence.map((item) => (
                <div className={"evidence-item " + item.tone} key={item.label}>
                  <div className="evidence-topline">
                    <span>{item.label}</span>
                    <SignalMark tone={item.tone === "positive" ? "mint" : item.tone === "watch" ? "coral" : "slate"} />
                  </div>
                  <strong>{item.value}</strong>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
            <div className="tradeoff-block">
              <div className="subheading-row compact">
                <span className="eyebrow">Pressure points</span>
                <span className="mono-note">3 visible</span>
              </div>
              <ul>
                {focusedPath.tradeoffs.map((tradeoff) => <li key={tradeoff}>{tradeoff}</li>)}
              </ul>
            </div>

            <div className="draft-section">
              <div className="subheading-row">
                <div>
                  <span className="eyebrow">04 / Commit</span>
                  <h3>{room.draft ? "Review your note" : "Make the call"}</h3>
                </div>
                {room.draft && <span className={"draft-status " + (room.committedAt ? "committed" : "")}>{room.committedAt ? "Committed" : "Draft"}</span>}
              </div>
              {room.draft ? (
                <>
                  <div className="draft-path">{pathById[room.draft.pathId].name}</div>
                  <label className="field-label" htmlFor="decision-rationale">Why this path?</label>
                  <textarea
                    id="decision-rationale"
                    className="rationale-input"
                    value={room.draft.rationale}
                    onChange={(event) => updateDraftRationale(event.target.value)}
                    aria-label="Decision rationale"
                    disabled={Boolean(room.committedAt)}
                  />
                  {room.draft.unresolvedRisks?.length > 0 && (
                    <div className="risk-line">
                      <span>Open risks</span>
                      <span>{room.draft.unresolvedRisks.length}</span>
                    </div>
                  )}
                  <button className="commit-button" type="button" onClick={commitDecision} disabled={Boolean(room.committedAt) || !rationaleReady}>
                    {room.committedAt ? "Decision committed" : rationaleReady ? "Commit decision" : "Add a reason first"} <span aria-hidden="true">↗</span>
                  </button>
                  <p className="commit-helper">Only you can finalize this decision{room.committedAt ? " · committed at " + formatClock(room.committedAt) : ""}.</p>
                </>
              ) : (
                <div className="empty-draft">
                  <p>Once the path survives pressure-testing, keep the reason with it.</p>
                  <button className="secondary-button" type="button" onClick={() => stageLaunchDecision({
                    pathId: focusedPath.id,
                    rationale: "Choose " + focusedPath.name + " because it best balances the active deadline, user value, and delivery confidence.",
                    unresolvedRisks: focusedPath.tradeoffs.slice(-1),
                  }, "Human")}>
                    Use this path <span aria-hidden="true">↗</span>
                  </button>
                </div>
              )}
            </div>

            <div className="activity-section">
              <div className="subheading-row compact">
                <span className="eyebrow">Changes</span>
                <span className="mono-note">{activity.length} updates</span>
              </div>
              <div className="activity-list">
                {activity.map((event) => (
                  <div className="activity-item" key={event.id}>
                    <SignalMark tone={event.tone === "human" ? "blue" : event.tone === "room" ? "slate" : "mint"} />
                    <div><strong>{event.actor}</strong><span>{event.text}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="app-footer">
        <span>DECIAP / Decision architecture</span>
        <span>Brief → Fit → Reason → Commit</span>
      </footer>
    </div>
  );
}

