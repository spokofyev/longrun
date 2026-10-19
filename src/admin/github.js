// Reads and writes src/content.json in the repo through the GitHub API.
// Saving a new commit to main triggers a Vercel redeploy of the site.

export const REPO = { owner: 'spokofyev', name: 'longrun', branch: 'main', path: 'src/content.json' }

const API = 'https://api.github.com'
const contentsUrl = `${API}/repos/${REPO.owner}/${REPO.name}/contents/${REPO.path}`

function headers(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

const decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)))

function encode(text) {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

async function fail(res, what) {
  let detail = ''
  try {
    detail = (await res.json()).message
  } catch {
    /* no body */
  }
  const err = new Error(`${what} failed (${res.status})${detail ? `: ${detail}` : ''}`)
  err.status = res.status
  throw err
}

// Confirms the token can push to the repo. Returns the GitHub login.
export async function checkToken(token) {
  const [repoRes, userRes] = await Promise.all([
    fetch(`${API}/repos/${REPO.owner}/${REPO.name}`, { headers: headers(token) }),
    fetch(`${API}/user`, { headers: headers(token) }),
  ])
  if (repoRes.status === 401 || userRes.status === 401) throw new Error('GitHub rejected this token.')
  if (!repoRes.ok) await fail(repoRes, 'Reading the repository')
  const repo = await repoRes.json()
  if (!repo.permissions?.push) throw new Error(`This token can read ${REPO.owner}/${REPO.name} but not write to it.`)
  const user = userRes.ok ? await userRes.json() : {}
  return user.login || 'GitHub user'
}

export async function loadContent(token) {
  const res = await fetch(`${contentsUrl}?ref=${REPO.branch}&t=${Date.now()}`, { headers: headers(token), cache: 'no-store' })
  if (!res.ok) await fail(res, 'Loading content')
  const file = await res.json()
  return { content: JSON.parse(decode(file.content)), sha: file.sha }
}

export async function saveContent(token, content, sha, message) {
  const res = await fetch(contentsUrl, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: encode(`${JSON.stringify(content, null, 2)}\n`),
      sha,
      branch: REPO.branch,
    }),
  })
  if (res.status === 409 || res.status === 422) {
    const err = new Error('The content changed on GitHub since you opened it. Reload to get the latest version, then redo your edit.')
    err.conflict = true
    throw err
  }
  if (!res.ok) await fail(res, 'Saving')
  const out = await res.json()
  return { sha: out.content.sha, commit: out.commit }
}
