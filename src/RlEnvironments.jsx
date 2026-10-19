import { useState } from 'react'
import Glow, { CardGlow } from './Glow.jsx'

// Renders the page from content.json (edited in /admin). Sections appear in
// the order of content.sections; a section with hidden: true is skipped.

const num = (i) => String(i + 1).padStart(2, '0')

function Properties({ s }) {
  return (
    <section className="container section">
      <h2 className="section-title">{s.title}</h2>
      <ol className="rl-cards rl-cards-4">
        {s.items.map((p, i) => (
          <li key={i} className="rl-card">
            <span className="rl-card-num">{num(i)}</span>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
            {p.tags?.length > 0 && (
              <ul className="tags">
                {p.tags.map((t, j) => (
                  <li key={j} className="tag">
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
      {s.footnote && <p className="rl-footnote">{s.footnote}</p>}
    </section>
  )
}

function Team({ s }) {
  return (
    <section className="container section">
      <h2 className="section-title">{s.title}</h2>
      <ul className="ap-checks rl-team">
        {s.items.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </section>
  )
}

function Products({ s }) {
  const [active, setActive] = useState(0)
  const id = (i) => `${s.id}-${i}`
  return (
    <section className="container section">
      {s.eyebrow && <p className="rl-eyebrow">{s.eyebrow}</p>}
      <h2 className="section-title">{s.title}</h2>
      {s.lead && <p className="section-lead">{s.lead}</p>}
      <div className="rl-tabs" role="tablist" aria-label={s.title}>
        {s.cards.map((c, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            id={`tab-${id(i)}`}
            aria-selected={active === i}
            aria-controls={`panel-${id(i)}`}
            className={`rl-tab${active === i ? ' is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="clients rl-products">
        {s.cards.map((c, i) => (
          <article
            key={i}
            id={`panel-${id(i)}`}
            role="tabpanel"
            aria-labelledby={`tab-${id(i)}`}
            className={`client ${i % 2 === 0 ? 'client-companies' : 'client-investors'}${active === i ? ' is-active' : ''}`}
          >
            {i % 2 === 0 && <CardGlow />}
            <p className="client-label">{c.label}</p>
            <h3 className="client-problem">{c.problem}</h3>
            <ul className="client-list">
              {c.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
            {c.difficulty && (
              <p className="rl-difficulty">
                <span>{s.difficultyLabel}</span>
                {c.difficulty}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function Scenario({ s }) {
  return (
    <section className="band dark rl-scenario">
      <div className="container section">
        {s.eyebrow && <p className="rl-eyebrow">{s.eyebrow}</p>}
        <h2 className="section-title">{s.title}</h2>
        {s.lead && <p className="section-lead">{s.lead}</p>}

        <div className="rl-console">
          <div className="rl-console-task">
            <p className="rl-console-label">{s.taskLabel}</p>
            <p className="rl-console-quote">&ldquo;{s.task}&rdquo;</p>
          </div>
          <ul className="rl-systems" aria-label="Systems involved">
            {s.systems.map((x, i) => (
              <li key={i}>
                <span aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </div>

        <p className="rl-console-label rl-track-label">{s.eventsLabel}</p>
        <ol className="rl-track">
          {s.events.map((e, i) => (
            <li key={i}>
              <span className="rl-track-dot" aria-hidden="true" />
              <h3>{e.title}</h3>
              <p>{e.body}</p>
            </li>
          ))}
        </ol>

        {s.note && <p className="rl-scenario-note">{s.note}</p>}

        <p className="rl-console-label rl-track-label">{s.successLabel}</p>
        <ul className="rl-verdicts">
          {s.success.map((x, i) => (
            <li key={i}>
              <span className="rl-verdict-check" aria-hidden="true" />
              <p className="rl-verdict-label">{x.title}</p>
              <p>{x.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Factory({ s }) {
  return (
    <section className="container section">
      <h2 className="section-title">{s.title}</h2>
      {s.lead && <p className="section-lead">{s.lead}</p>}
      <ol className="rl-pipeline">
        {s.steps.map((f, i) => (
          <li key={i} className="rl-stage">
            <span className="rl-stage-num">{i + 1}</span>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </li>
        ))}
      </ol>
      <div className="rl-define">
        <h3>{s.defineTitle}</h3>
        <p className="rl-formula">
          {s.parts.map((p, i) => (
            <span key={i}>
              {i > 0 && <span className="rl-plus">+</span>}
              <span className="rl-part">{p}</span>
            </span>
          ))}
        </p>
        {s.defineNote && <p>{s.defineNote}</p>}
      </div>
    </section>
  )
}

function Pack({ s }) {
  return (
    <section className="container section">
      {s.eyebrow && <p className="rl-eyebrow">{s.eyebrow}</p>}
      <h2 className="section-title">{s.title}</h2>
      {s.lead && <p className="section-lead">{s.lead}</p>}
      <div className="rl-pack">
        <CardGlow />
        <div className="rl-pack-head">
          <p className="rl-console-label">{s.packLabel}</p>
          <p className="rl-big">{s.big}</p>
          <p className="rl-big-label">{s.bigLabel}</p>
        </div>
        <div className="rl-pack-body">
          <p className="rl-console-label">{s.includesLabel}</p>
          <ul className="client-list">
            {s.includes.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rl-scale-wrap">
        <h3 className="rl-sub">{s.scaleTitle}</h3>
        <ol className="rl-scale">
          {s.scale.map((x, i) => (
            <li key={i}>
              <span className="rl-scale-value">{x.title}</span>
              <span className="rl-scale-label">{x.body}</span>
            </li>
          ))}
        </ol>
        {s.scaleCaveat && <p className="ap-text-muted">{s.scaleCaveat}</p>}
        {s.scaleNote && <p className="rl-scale-note">{s.scaleNote}</p>}
      </div>
    </section>
  )
}

export const SECTION_COMPONENTS = {
  properties: Properties,
  team: Team,
  products: Products,
  scenario: Scenario,
  factory: Factory,
  pack: Pack,
}

export default function RlEnvironments({ content, topBar }) {
  const { hero, sections } = content
  return (
    <>
      <header className="band dark home-hero sub-hero has-glow">
        <Glow />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="container home-hero-inner">
          {topBar}
          <div className="home-hero-body">
            <h1 className="page-title">{hero.title}</h1>
            {hero.subtitle && <p className="hero-sub">{hero.subtitle}</p>}
            {hero.cta && (
              <div className="hero-actions">
                <a className="button" href="#contact">
                  {hero.cta} <ArrowIcon />
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {sections
          .filter((s) => !s.hidden)
          .map((s) => {
            const Section = SECTION_COMPONENTS[s.type]
            return Section ? <Section key={s.id} s={s} /> : null
          })}
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
