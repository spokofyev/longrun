import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { REPO, checkToken, loadContent, saveContent } from './github.js'
import { FIXED, SECTION_TYPES } from './schema.js'

const TOKEN_KEY = 'longrun-cms-token'
const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new'

const store = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY) || ''
    } catch {
      return ''
    }
  },
  set: (v) => {
    try {
      if (v) localStorage.setItem(TOKEN_KEY, v)
      else localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* private mode: token lasts for this tab only */
    }
  },
}

const move = (arr, from, to) => {
  const next = arr.slice()
  const [x] = next.splice(from, 1)
  next.splice(to, 0, x)
  return next
}

export default function Admin() {
  const [token, setToken] = useState(store.get)
  const [user, setUser] = useState('')
  const [draft, setDraft] = useState(null)
  const [saved, setSaved] = useState(null)
  const [sha, setSha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(token))

  const open = useCallback(async (t) => {
    setLoading(true)
    setError('')
    try {
      const login = await checkToken(t)
      const { content, sha: s } = await loadContent(t)
      store.set(t)
      setToken(t)
      setUser(login)
      setDraft(content)
      setSaved(content)
      setSha(s)
    } catch (e) {
      setError(e.message)
      if (!draft) {
        store.set('')
        setToken('')
      }
    } finally {
      setLoading(false)
    }
  }, [draft])

  useEffect(() => {
    if (token && !draft) open(token)
    // Only on first load with a remembered token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = () => {
    store.set('')
    setToken('')
    setDraft(null)
    setSaved(null)
    setUser('')
  }

  if (!draft) return <Login onSubmit={open} loading={loading} error={error} />

  return (
    <Workspace
      token={token}
      user={user}
      draft={draft}
      setDraft={setDraft}
      saved={saved}
      setSaved={setSaved}
      sha={sha}
      setSha={setSha}
      reload={() => open(token)}
      signOut={signOut}
    />
  )
}

function Login({ onSubmit, loading, error }) {
  const [value, setValue] = useState('')
  return (
    <div className="cms-login">
      <form
        className="cms-login-card"
        onSubmit={(e) => {
          e.preventDefault()
          if (value.trim()) onSubmit(value.trim())
        }}
      >
        <p className="cms-brand">Longrun</p>
        <h1>Content</h1>
        <p className="cms-muted">
          Sign in with a GitHub token that can write to <strong>{REPO.owner}/{REPO.name}</strong>. Saving commits the
          new text to the repo, and the site redeploys.
        </p>
        <label className="cms-field">
          <span>GitHub token</span>
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="github_pat_…"
            autoComplete="off"
            spellCheck="false"
            autoFocus
          />
        </label>
        {error && <p className="cms-error">{error}</p>}
        <button className="cms-btn cms-btn-primary" type="submit" disabled={loading || !value.trim()}>
          {loading ? 'Checking…' : 'Sign in'}
        </button>
        <details className="cms-help">
          <summary>How to get a token</summary>
          <ol>
            <li>
              Open <a href={TOKEN_URL} target="_blank" rel="noopener noreferrer">GitHub → Fine-grained tokens → New</a>.
            </li>
            <li>
              Repository access: <em>Only select repositories</em> → <code>{REPO.owner}/{REPO.name}</code>.
            </li>
            <li>
              Permissions → Repository → <em>Contents: Read and write</em>.
            </li>
            <li>Generate, copy, paste it here. It stays in this browser only.</li>
          </ol>
        </details>
      </form>
    </div>
  )
}

function Workspace({ token, user, draft, setDraft, saved, setSaved, sha, setSha, reload, signOut }) {
  const [selected, setSelected] = useState(draft.sections[0]?.id || 'hero')
  const [status, setStatus] = useState({ kind: 'idle' })
  const [showPreview, setShowPreview] = useState(true)
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved])
  const pollRef = useRef(0)

  useEffect(() => {
    if (!dirty) return
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  useEffect(() => () => clearTimeout(pollRef.current), [])

  const update = (fn) => setDraft((d) => fn(structuredClone(d)))

  async function save() {
    clearTimeout(pollRef.current)
    setStatus({ kind: 'saving' })
    try {
      const snapshot = draft
      const out = await saveContent(token, snapshot, sha, `Update site content (${user} via /admin)`)
      setSha(out.sha)
      setSaved(snapshot)
      setStatus({ kind: 'deploying', commit: out.commit.html_url })
      waitForLive(snapshot, out.commit.html_url)
    } catch (e) {
      setStatus({ kind: 'error', message: e.message, conflict: e.conflict })
    }
  }

  // Polls the live site's content.json until it matches what was saved.
  function waitForLive(snapshot, commit, tries = 0) {
    const want = JSON.stringify(snapshot)
    pollRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/content.json?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok && JSON.stringify(await res.json()) === want) {
          setStatus({ kind: 'live', commit })
          return
        }
      } catch {
        /* keep waiting */
      }
      if (tries < 36) waitForLive(snapshot, commit, tries + 1)
      else setStatus({ kind: 'slow', commit })
    }, 5000)
  }

  const sectionIndex = draft.sections.findIndex((s) => s.id === selected)
  const isSection = sectionIndex >= 0
  const schema = isSection ? SECTION_TYPES[draft.sections[sectionIndex].type] : FIXED[selected]

  return (
    <div className="cms">
      <header className="cms-top">
        <div className="cms-top-left">
          <span className="cms-brand">Longrun</span>
          <span className="cms-sep">/</span>
          <span>Content</span>
        </div>
        <Status status={status} dirty={dirty} />
        <div className="cms-top-right">
          <button className="cms-btn cms-btn-ghost cms-hide-sm" type="button" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? 'Hide preview' : 'Show preview'}
          </button>
          <a className="cms-btn cms-btn-ghost" href="/" target="_blank" rel="noopener noreferrer">
            View site ↗
          </a>
          <button className="cms-btn cms-btn-ghost" type="button" disabled={!dirty} onClick={() => setDraft(saved)}>
            Discard
          </button>
          <button className="cms-btn cms-btn-primary" type="button" disabled={!dirty || status.kind === 'saving'} onClick={save}>
            {status.kind === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      <div className={`cms-body${showPreview ? ' with-preview' : ''}`}>
        <aside className="cms-nav">
          <NavGroup title="Page">
            {['site', 'hero'].map((k) => (
              <NavItem key={k} active={selected === k} onClick={() => setSelected(k)} label={FIXED[k].name} />
            ))}
          </NavGroup>
          <NavGroup title="Sections" hint="Drag to reorder">
            <SectionList
              sections={draft.sections}
              selected={selected}
              onSelect={setSelected}
              onMove={(from, to) => update((d) => ({ ...d, sections: move(d.sections, from, to) }))}
              onToggle={(i) =>
                update((d) => {
                  d.sections[i].hidden = !d.sections[i].hidden
                  return d
                })
              }
            />
          </NavGroup>
          <NavGroup title="Bottom">
            {['contact', 'footer'].map((k) => (
              <NavItem key={k} active={selected === k} onClick={() => setSelected(k)} label={FIXED[k].name} />
            ))}
          </NavGroup>
          <div className="cms-nav-foot">
            <span className="cms-muted">Signed in as {user}</span>
            <button className="cms-link" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </aside>

        <main className="cms-editor">
          {status.kind === 'error' && (
            <div className="cms-banner cms-banner-error">
              <p>{status.message}</p>
              {status.conflict && (
                <button className="cms-btn" type="button" onClick={reload}>
                  Reload latest
                </button>
              )}
            </div>
          )}
          {schema && (
            <>
              <div className="cms-editor-head">
                <p className="cms-eyebrow">{isSection ? 'Section' : 'Page'}</p>
                <h2>{isSection ? draft.sections[sectionIndex].title || schema.name : schema.name}</h2>
                {isSection && <p className="cms-muted">{schema.name}{draft.sections[sectionIndex].hidden ? ' · hidden on the site' : ''}</p>}
              </div>
              <Fields
                fields={schema.fields}
                value={isSection ? draft.sections[sectionIndex] : draft[selected]}
                onChange={(next) =>
                  update((d) => {
                    if (isSection) d.sections[sectionIndex] = next
                    else d[selected] = next
                    return d
                  })
                }
              />
            </>
          )}
        </main>

        {showPreview && <Preview content={draft} target={isSection ? draft.sections[sectionIndex] : null} />}
      </div>
    </div>
  )
}

function Status({ status, dirty }) {
  let text = dirty ? 'Unsaved changes' : 'All changes saved'
  let cls = dirty ? 'is-dirty' : ''
  if (status.kind === 'saving') text = 'Saving to GitHub…'
  if (status.kind === 'deploying') [text, cls] = ['Saved. Publishing to the site…', 'is-busy']
  if (status.kind === 'live') [text, cls] = ['Live on the site', 'is-ok']
  if (status.kind === 'slow') [text, cls] = ['Saved to GitHub, but the site didn’t rebuild. Check Vercel → longrun → Settings → Git is connected to spokofyev/longrun.', 'is-dirty']
  if (status.kind === 'error') [text, cls] = ['Not saved', 'is-error']
  if (dirty && (status.kind === 'live' || status.kind === 'deploying' || status.kind === 'slow')) {
    text = 'Unsaved changes'
    cls = 'is-dirty'
  }
  return (
    <p className={`cms-status ${cls}`} role="status">
      <span className="cms-dot" aria-hidden="true" />
      {text}
      {status.commit && !dirty && (
        <a href={status.commit} target="_blank" rel="noopener noreferrer">
          commit
        </a>
      )}
    </p>
  )
}

function NavGroup({ title, hint, children }) {
  return (
    <div className="cms-nav-group">
      <p className="cms-nav-title">
        {title}
        {hint && <span>{hint}</span>}
      </p>
      {children}
    </div>
  )
}

function NavItem({ active, onClick, label }) {
  return (
    <button type="button" className={`cms-nav-item${active ? ' is-active' : ''}`} onClick={onClick}>
      {label}
    </button>
  )
}

function SectionList({ sections, selected, onSelect, onMove, onToggle }) {
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(null)

  const drop = (to) => {
    if (drag !== null && to !== drag) onMove(drag, to > drag ? to - 1 : to)
    setDrag(null)
    setOver(null)
  }

  return (
    <ol className="cms-sections" onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setOver(null)}>
      {sections.map((s, i) => (
        <li
          key={s.id}
          className={[
            'cms-section',
            selected === s.id && 'is-active',
            s.hidden && 'is-hidden',
            drag === i && 'is-dragging',
            over === i && drag !== null && drag !== i && drag !== i - 1 && 'drop-before',
          ]
            .filter(Boolean)
            .join(' ')}
          draggable
          onDragStart={(e) => {
            setDrag(i)
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', s.id)
          }}
          onDragEnd={() => {
            setDrag(null)
            setOver(null)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            const r = e.currentTarget.getBoundingClientRect()
            setOver(e.clientY > r.top + r.height / 2 ? i + 1 : i)
          }}
          onDrop={(e) => {
            e.preventDefault()
            drop(over ?? i)
          }}
        >
          <span className="cms-grip" aria-hidden="true">
            ⋮⋮
          </span>
          <button type="button" className="cms-section-name" onClick={() => onSelect(s.id)} title={s.title}>
            <span>{SECTION_TYPES[s.type]?.name || s.type}</span>
            <small>{s.title}</small>
          </button>
          <span className="cms-section-tools">
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => onMove(i, i - 1)}>
              ↑
            </button>
            <button type="button" aria-label="Move down" disabled={i === sections.length - 1} onClick={() => onMove(i, i + 1)}>
              ↓
            </button>
            <button
              type="button"
              className={s.hidden ? 'is-off' : ''}
              aria-label={s.hidden ? 'Show on site' : 'Hide from site'}
              title={s.hidden ? 'Hidden. Click to show' : 'Shown. Click to hide'}
              onClick={() => onToggle(i)}
            >
              {s.hidden ? '◌' : '●'}
            </button>
          </span>
        </li>
      ))}
      {drag !== null && (
        <li
          className={`cms-drop-end${over === sections.length ? ' drop-before' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(sections.length)
          }}
          onDrop={(e) => {
            e.preventDefault()
            drop(sections.length)
          }}
        />
      )}
    </ol>
  )
}

function Fields({ fields, value, onChange }) {
  const set = (key, v) => onChange({ ...value, [key]: v })
  return (
    <div className="cms-fields">
      {fields.map((f) => {
        const v = value?.[f.key]
        if (f.kind === 'list') return <ListField key={f.key} field={f} value={v || []} onChange={(x) => set(f.key, x)} />
        if (f.kind === 'items') return <ItemsField key={f.key} field={f} value={v || []} onChange={(x) => set(f.key, x)} />
        return <TextField key={f.key} field={f} value={v ?? ''} onChange={(x) => set(f.key, x)} />
      })}
    </div>
  )
}

function AutoTextarea({ value, onChange, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])
  return <textarea ref={ref} rows={1} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
}

function TextField({ field, value, onChange }) {
  return (
    <label className="cms-field">
      <span>{field.label}</span>
      {field.kind === 'long' ? (
        <AutoTextarea value={value} onChange={onChange} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

function RowTools({ i, n, onMove, onRemove, name }) {
  return (
    <span className="cms-row-tools">
      <button type="button" aria-label={`Move ${name} up`} disabled={i === 0} onClick={() => onMove(i, i - 1)}>
        ↑
      </button>
      <button type="button" aria-label={`Move ${name} down`} disabled={i === n - 1} onClick={() => onMove(i, i + 1)}>
        ↓
      </button>
      <button type="button" aria-label={`Remove ${name}`} className="is-danger" onClick={() => onRemove(i)}>
        ×
      </button>
    </span>
  )
}

function ListField({ field, value, onChange }) {
  const name = (field.itemName || 'item').toLowerCase()
  return (
    <div className="cms-field">
      <span>{field.label}</span>
      <ol className="cms-list">
        {value.map((item, i) => (
          <li key={i}>
            <input type="text" value={item} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            <RowTools
              i={i}
              n={value.length}
              name={name}
              onMove={(a, b) => onChange(move(value, a, b))}
              onRemove={(j) => onChange(value.filter((_, k) => k !== j))}
            />
          </li>
        ))}
      </ol>
      <button type="button" className="cms-add" onClick={() => onChange([...value, ''])}>
        + Add {name}
      </button>
    </div>
  )
}

function ItemsField({ field, value, onChange }) {
  const name = (field.itemName || 'item').toLowerCase()
  return (
    <div className="cms-field">
      <span>{field.label}</span>
      <ol className="cms-items">
        {value.map((item, i) => (
          <li key={i} className="cms-item">
            <div className="cms-item-head">
              <p>
                {field.itemName} {i + 1}
                {item.title || item.label ? <em> · {item.title || item.label}</em> : null}
              </p>
              <RowTools
                i={i}
                n={value.length}
                name={name}
                onMove={(a, b) => onChange(move(value, a, b))}
                onRemove={(j) => onChange(value.filter((_, k) => k !== j))}
              />
            </div>
            <Fields fields={field.fields} value={item} onChange={(next) => onChange(value.map((x, j) => (j === i ? next : x)))} />
          </li>
        ))}
      </ol>
      <button type="button" className="cms-add" onClick={() => onChange([...value, structuredClone(field.blank)])}>
        + Add {name}
      </button>
    </div>
  )
}

// The real page in an iframe, fed the draft. Scrolls to the section being edited.
function Preview({ content, target }) {
  const ref = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin === window.location.origin && e.data?.type === 'cms-ready') setReady(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    if (ready) ref.current?.contentWindow?.postMessage({ type: 'cms-preview', content }, window.location.origin)
  }, [ready, content])

  const targetId = target?.id
  const targetHidden = target?.hidden
  useEffect(() => {
    if (!ready) return
    const doc = ref.current?.contentDocument
    if (!doc) return
    if (!targetId || targetHidden) {
      doc.defaultView?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const visible = content.sections.filter((s) => !s.hidden)
    const idx = visible.findIndex((s) => s.id === targetId)
    const el = doc.querySelectorAll('main > section')[idx]
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Scroll only when the selection changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, targetId, targetHidden])

  return (
    <section className="cms-preview" aria-label="Preview">
      <p className="cms-preview-label">Preview · not saved until you click Save</p>
      <iframe ref={ref} src="/?preview" title="Page preview" />
    </section>
  )
}
