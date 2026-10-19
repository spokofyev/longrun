import { useState } from 'react'
import Glow, { CardGlow } from './Glow.jsx'

// Content from the "RL environments for AI employees" deck.

const properties = [
  {
    title: 'Realistic + complex',
    body: 'Long-horizon workflows across apps, people, files and permissions.',
    tags: ['multi-app', 'stateful', '30–100 steps'],
  },
  {
    title: 'Non-stationary',
    body: 'Events happen while the agent acts; data, users and policies evolve.',
    tags: ['event streams', 'other actors', 'changing state'],
  },
  {
    title: 'Hard to hack',
    body: 'Hidden ground truth, randomized worlds, held-out seeds and verifier ensembles.',
    tags: ['private state', 'randomization', 'adversarial QA'],
  },
  {
    title: 'Built for business',
    body: 'Custom workflows, domain policy, private data shapes, auditability and controls.',
    tags: ['workflow packs', 'permissions', 'enterprise API'],
  },
]

const team = [
  'Author of the GAIA2 benchmark',
  'Led agentic synthetic data and RL environments for Muse Glimmer',
  'Work helped drive strong results on agentic benchmarks including WildClawBench and GAIA2',
  'Deep experience in agents, RL, synthetic data, evaluation and benchmark design',
]

const products = [
  {
    id: 'personal',
    label: 'Personal agent',
    problem: 'Solve real daily-life problems',
    items: [
      'Re-plan a trip when a flight is cancelled',
      'Coordinate email, calendar, bookings and documents',
      'Resolve a return / subscription / service issue',
      'Research options, compare constraints and prepare the action',
    ],
    difficulty: 'The world changes while the agent is acting.',
  },
  {
    id: 'employee',
    label: 'AI employee',
    problem: 'Do professional work across systems',
    items: [
      'Resolve a customer escalation across CRM + support + billing',
      'Prepare a renewal using account history, docs and internal chat',
      'Triage an incident, coordinate owners and update the runbook',
      'Execute finance / operations / legal workflows with policy constraints',
    ],
    difficulty: 'Success means correct side effects, not a plausible answer.',
  },
]

const escalation = {
  task: 'Resolve the escalation, preserve the account, follow policy, and leave every system consistent.',
  systems: ['Inbox', 'Support', 'CRM', 'Billing', 'Internal chat', 'Customer'],
  events: [
    { title: 'New customer reply', body: 'details change midway' },
    { title: 'Policy update', body: 'refund limit changes' },
    { title: 'Record conflict', body: 'CRM and billing disagree' },
    { title: 'Permission failure', body: 'agent needs an alternative path' },
  ],
  success: [
    { label: 'Outcome', body: 'customer issue actually resolved' },
    { label: 'State', body: 'CRM / billing / ticket state consistent' },
    { label: 'Policy', body: 'business rules followed' },
    { label: 'Safety', body: 'no unintended side effect' },
  ],
}

const factory = [
  { title: 'Workflow spec', body: 'What the employee actually does' },
  { title: 'World generator', body: 'Org graph, accounts, files, histories, policies' },
  { title: 'Tool layer', body: 'CRM, email, docs, tickets, browser, DB, APIs' },
  { title: 'Task + event engine', body: 'Hidden goals, difficulty, interrupts, other actors' },
  { title: 'Verifier stack', body: 'Outcome + state + artifact + policy checks' },
  { title: 'Adversarial QA', body: 'Rollouts, exploit mining, regression tests' },
]

const environmentParts = [
  'seeded world',
  'persistent state',
  'tool suite',
  'event stream',
  'task family',
  'verifier',
  'reset function',
  'train/eval split',
]

const pack = [
  'realistic multi-system world state',
  'non-stationary event schedules',
  'task families, not single prompts',
  'hard-to-game verifier stack',
  'automatic resets + train/eval seeds',
]

const scale = [
  { value: '200', label: 'worlds' },
  { value: '× 50', label: 'task variants' },
  { value: '× 10', label: 'event schedules' },
  { value: '≈ 100k', label: 'distinct episodes' },
]

const num = (i) => String(i + 1).padStart(2, '0')

function Products() {
  const [active, setActive] = useState(products[0].id)
  return (
    <>
      <div className="rl-tabs" role="tablist" aria-label="Agent type">
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`rl-tab-${p.id}`}
            aria-selected={active === p.id}
            aria-controls={`rl-panel-${p.id}`}
            className={`rl-tab${active === p.id ? ' is-active' : ''}`}
            onClick={() => setActive(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="clients rl-products">
        {products.map((p, i) => (
          <article
            key={p.id}
            id={`rl-panel-${p.id}`}
            role="tabpanel"
            aria-labelledby={`rl-tab-${p.id}`}
            className={`client ${i === 0 ? 'client-companies' : 'client-investors'}${active === p.id ? ' is-active' : ''}`}
          >
            {i === 0 && <CardGlow />}
            <p className="client-label">{p.label}</p>
            <h3 className="client-problem">{p.problem}</h3>
            <ul className="client-list">
              {p.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
            <p className="rl-difficulty">
              <span>Key difficulty</span>
              {p.difficulty}
            </p>
          </article>
        ))}
      </div>
    </>
  )
}

export default function RlEnvironments({ topBar }) {
  return (
    <>
      <header className="band dark home-hero sub-hero has-glow">
        <Glow />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="container home-hero-inner">
          {topBar}
          <div className="home-hero-body">
            <h1 className="page-title">Train AI agents inside the work they will actually do.</h1>
            <p className="hero-sub">
              Synthetic RL environments for personal agents and AI employees &mdash; realistic, dynamic,
              business-specific, and hard to game.
            </p>
            <div className="hero-actions">
              <a className="button" href="#contact">
                Request sample dataset <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="container section">
          <h2 className="section-title">A production-grade RL environment</h2>
          <ol className="rl-cards rl-cards-4">
            {properties.map((p, i) => (
              <li key={p.title} className="rl-card">
                <span className="rl-card-num">{num(i)}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <ul className="tags">
                  {p.tags.map((t) => (
                    <li key={t} className="tag">
                      {t}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="rl-footnote">
            Design target: the model cannot win by memorizing patterns or exploiting one weak reward channel.
          </p>
        </section>

        <section className="container section">
          <h2 className="section-title">Research and engineering team who have built agent systems at Meta</h2>
          <ul className="ap-checks rl-team">
            {team.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="container section">
          <p className="rl-eyebrow">The product</p>
          <h2 className="section-title">Digital workplaces for agents</h2>
          <p className="section-lead">
            Not another static benchmark. A repeatable world where an agent must actually finish the job.
          </p>
          <Products />
        </section>

        <section className="band dark rl-scenario">
          <div className="container section">
            <p className="rl-eyebrow">Sample scenario</p>
            <h2 className="section-title">A customer escalation is a long-horizon task</h2>
            <p className="section-lead">
              One environment can force 30&ndash;60+ decisions across systems, people, policies and evolving
              state.
            </p>

            <div className="rl-console">
              <div className="rl-console-task">
                <p className="rl-console-label">Task</p>
                <p className="rl-console-quote">&ldquo;{escalation.task}&rdquo;</p>
              </div>
              <ul className="rl-systems" aria-label="Systems involved">
                {escalation.systems.map((s) => (
                  <li key={s}>
                    <span aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <p className="rl-console-label rl-track-label">While the agent is working&hellip;</p>
            <ol className="rl-track">
              {escalation.events.map((e) => (
                <li key={e.title}>
                  <span className="rl-track-dot" aria-hidden="true" />
                  <h3>{e.title}</h3>
                  <p>{e.body}</p>
                </li>
              ))}
            </ol>

            <p className="rl-scenario-note">
              The agent must read, decide, message, update records, trigger actions, recover from failures and
              verify the result.
            </p>

            <p className="rl-console-label rl-track-label">Success only if</p>
            <ul className="rl-verdicts">
              {escalation.success.map((s) => (
                <li key={s.label}>
                  <span className="rl-verdict-check" aria-hidden="true" />
                  <p className="rl-verdict-label">{s.label}</p>
                  <p>{s.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container section">
          <h2 className="section-title">Environment factory: from a business process to trainable worlds</h2>
          <p className="section-lead">
            Every environment ships as a self-contained, resettable unit with its own state, events, tasks and
            verifiers.
          </p>
          <ol className="rl-pipeline">
            {factory.map((f, i) => (
              <li key={f.title} className="rl-stage">
                <span className="rl-stage-num">{i + 1}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </li>
            ))}
          </ol>
          <div className="rl-define">
            <h3>What counts as 1 environment?</h3>
            <p className="rl-formula">
              {environmentParts.map((p, i) => (
                <span key={p}>
                  {i > 0 && <span className="rl-plus">+</span>}
                  <span className="rl-part">{p}</span>
                </span>
              ))}
            </p>
            <p>One world can generate many fresh episodes without manually labeling every trajectory.</p>
          </div>
        </section>

        <section className="container section">
          <p className="rl-eyebrow">The first product we ship</p>
          <h2 className="section-title">Environment Pack v1</h2>
          <p className="section-lead">
            200 production-ready environments in 8 weeks. Start narrow, prove quality, then scale the factory.
          </p>
          <div className="rl-pack">
            <CardGlow />
            <div className="rl-pack-head">
              <p className="rl-console-label">Environment Pack v1</p>
              <p className="rl-big">200</p>
              <p className="rl-big-label">high-quality environments</p>
            </div>
            <div className="rl-pack-body">
              <p className="rl-console-label">Every environment includes</p>
              <ul className="client-list">
                {pack.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rl-scale-wrap">
            <h3 className="rl-sub">Why 200 worlds can create much more than 200 examples</h3>
            <ol className="rl-scale">
              {scale.map((s) => (
                <li key={s.label}>
                  <span className="rl-scale-value">{s.value}</span>
                  <span className="rl-scale-label">{s.label}</span>
                </li>
              ))}
            </ol>
            <p className="ap-text-muted">
              Illustrative scale &mdash; actual episode count depends on task depth and QA gates.
            </p>
            <p className="rl-scale-note">The scaling unit is the world generator, not the annotation workforce.</p>
          </div>
        </section>
      </main>
    </>
  )
}

function ArrowIcon() {
  return (
    <svg className="arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 8L8 2M3.5 2H8V6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
