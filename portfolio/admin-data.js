// Portfolio content ko Supabase se laata hai. DB available na ho to purana hardcoded content dikhta hai.
const URL = 'https://zmzaagojbcdzrpmakddf.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptemFhZ29qYmNkenJwbWFrZGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0OTE3NDksImV4cCI6MjExMTA2Nzc0OX0.88AW5A6ClEvFz4pDlR6y-ll6CUaOvBNftvJ4Ub-ytVE'
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` }
const EMAIL = 'kamalsheokand615@gmail.com'

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const safeUrl = (v) => {
  try {
    const u = new URL(String(v || ''), location.href)
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? u.href : '#'
  } catch { return '#' }
}

async function get(table, query = 'select=*') {
  try {
    const res = await fetch(`${URL}/rest/v1/${table}?${query}`, { headers: HEADERS })
    if (!res.ok) { console.warn(`[portfolio] ${table}: ${res.status}`); return null }
    return await res.json()
  } catch (err) {
    console.warn(`[portfolio] ${table} unavailable`, err)
    return null
  }
}

function observe(root) {
  const io = window.__portfolioIO
  root.querySelectorAll('.rv').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`
    el.addEventListener('transitionend', () => { el.style.transitionDelay = '' }, { once: true })
    io ? io.observe(el) : el.classList.add('in')
  })
}

function replace(selector, html) {
  const box = document.querySelector(selector)
  if (!box) return
  box.innerHTML = html
  observe(box)
}

function hide(selector, hidden) {
  const section = document.querySelector(selector)
  if (section) section.style.display = hidden ? 'none' : ''
}

function applySettings(s) {
  if (!s) return
  if (s.name) {
    const brand = document.querySelector('nav b')
    if (brand) brand.textContent = s.name
    const heroName = document.querySelector('.hero h1 .grad')
    if (heroName) heroName.textContent = s.name
    const avatar = document.querySelector('.avatar')
    if (avatar) avatar.textContent = s.name.split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase()
  }
  if (s.tagline) {
    const words = s.tagline.split(/\s*[|,]\s*/).filter(Boolean)
    if (words.length && typeof window.setTypeWords === 'function') window.setTypeWords(words)
  }
  if (s.bio) {
    const p = document.querySelector('.hero p')
    if (p) p.textContent = s.bio
  }
  if (s.resume_url) {
    const resume = document.querySelector('.hero .btn.sec')
    if (resume) resume.href = safeUrl(s.resume_url)
  }
  if (s.email) {
    document.querySelectorAll('a[href]').forEach((a) => {
      if (a.href.includes(EMAIL)) {
        a.href = a.href.replace(encodeURIComponent(EMAIL), encodeURIComponent(s.email)).replace(EMAIL, s.email)
      }
    })
  }
  if (s.primary_color) {
    const root = document.documentElement
    root.style.setProperty('--a', s.primary_color)
    root.style.setProperty('--b', `color-mix(in srgb, ${s.primary_color} 55%, #7dd3fc)`)
    root.style.setProperty('--c', `color-mix(in srgb, ${s.primary_color} 30%, #7dd3fc)`)
  }
}

function renderSkills(rows) {
  if (rows === null) return
  if (!rows.length) return hide('#skills', true)
  const groups = rows.reduce((acc, x) => {
    const k = x.category || 'Tools'
    ;(acc[k] ||= []).push(x)
    return acc
  }, {})
  const html = Object.entries(groups).map(([cat, items]) => {
    const hasLevels = items.some((x) => Number(x.level) > 0)
    const inner = hasLevels
      ? items.map((x) => `<div class="skl"><span>${esc(x.title)}</span><span>${Number(x.level) || 0}%</span></div><div class="bar"><div data-w="${Number(x.level) || 0}"></div></div>`).join('')
      : `<p>${esc(cat)} ke liye tools aur techniques.</p><div class="chips">${items.map((x) => `<i>${esc(x.title)}</i>`).join('')}</div>`
    return `<div class="card rv"><h3>${esc(cat)}</h3>${inner}</div>`
  }).join('')
  replace('#skills .grid', html)
  hide('#skills', false)
}

function renderProjects(rows) {
  const grid = document.querySelector('#projectsGrid') || document.querySelector('#projects .grid')
  if (!grid) return
  if (rows === null) return // DB unavailable: hardcoded projects remain visible
  if (!rows.length) return hide('#projects', true)
  grid.innerHTML = rows.map((p) => {
    const tags = Array.isArray(p.tags) ? p.tags : []
    const old = Array.isArray(p.technologies) ? p.technologies : []
    const chips = [...tags, ...old].filter(Boolean)
    return `<div class="card rv">
      ${p.image_url ? `<img src="${esc(safeUrl(p.image_url))}" alt="${esc(p.title)}" loading="lazy" style="width:100%;height:160px;object-fit:cover;border-radius:12px;margin:-24px -24px 20px">` : ''}
      <h3>${esc(p.title)}</h3>
      ${p.description ? `<p>${esc(p.description)}</p>` : ''}
      ${p.problem ? `<p><b>Problem:</b> ${esc(p.problem)}</p>` : ''}
      ${p.outcome ? `<p><b>Outcome:</b> ${esc(p.outcome)}</p>` : ''}
      ${chips.length ? `<div class="chips">${chips.map((t) => `<i>${esc(t)}</i>`).join('')}</div>` : ''}
      <div class="lnk" style="margin-top:12px">
        ${p.live_url ? `<a target="_blank" rel="noopener" href="${esc(safeUrl(p.live_url))}">Live demo ↗</a>` : ''}
        ${p.github_url ? `<a target="_blank" rel="noopener" href="${esc(safeUrl(p.github_url))}">GitHub ↗</a>` : ''}
      </div>
    </div>`
  }).join('')
  observe(grid)
  hide('#projects', false)
}

function renderCerts(rows) {
  if (rows === null) return
  if (!rows.length) return hide('#certs', true)
  replace('#certs .grid', rows.map((c) => `<div class="card rv">
    ${c.image_url ? `<img src="${esc(safeUrl(c.image_url))}" alt="" loading="lazy" style="width:100%;height:150px;object-fit:contain;border-radius:12px;margin:-24px -24px 18px">` : ''}
    <h3>${esc(c.title)}</h3>
    <p>${esc(c.issuer || '')}${c.issued_on ? ` · ${esc(c.issued_on)}` : ''}</p>
    ${c.link ? `<p class="lnk"><a target="_blank" rel="noopener" href="${esc(safeUrl(c.link))}">Verify ↗</a></p>` : ''}
  </div>`).join(''))
  hide('#certs', false)
}

function renderProfiles(rows) {
  if (rows === null) return
  if (!rows.length) return hide('#profiles', true)
  replace('#profiles .grid', rows.map((p) => `<div class="card rv"><h3>${esc(p.platform)}</h3>
    <p>${esc(p.username || '')}</p><p class="lnk"><a target="_blank" rel="noopener" href="${esc(safeUrl(p.url))}">Open profile ↗</a></p></div>`).join(''))
  hide('#profiles', false)
}

function renderBlogs(rows) {
  if (rows === null) return
  if (!rows.length) return hide('#blog', true)
  replace('#blog .grid', rows.map((b) => `<div class="card rv"><h3>${esc(b.title)}</h3>
    <p>${esc(b.excerpt || '')}</p>
    ${b.content ? `<details style="margin-top:10px;color:var(--mu);font-size:.9rem"><summary style="cursor:pointer;color:var(--b)">Read more</summary><div style="white-space:pre-wrap;margin-top:10px">${esc(b.content)}</div></details>` : ''}
    ${b.cover_url ? `<img src="${esc(safeUrl(b.cover_url))}" alt="" loading="lazy" style="width:100%;height:140px;object-fit:cover;border-radius:12px;margin-top:14px">` : ''}
  </div>`).join(''))
  hide('#blog', false)
}

function bindContact() {
  const form = document.getElementById('cf')
  if (!form || form.dataset.bound) return
  form.dataset.bound = '1'
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const val = (id) => document.getElementById(id)?.value.trim() || ''
    const status = document.getElementById('st')
    const name = val('n'), email = val('e'), subject = val('s'), message = val('m')
    const payload = { name, email, message: (subject ? `${subject}\n\n` : '') + message }
    status.textContent = 'Sending…'
    let ok = false
    try {
      const res = await fetch(`${URL}/rest/v1/messages`, {
        method: 'POST',
        headers: { ...HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(payload),
      })
      ok = res.ok
      if (!ok) console.warn('[portfolio] message insert:', res.status)
    } catch (err) { console.warn('[portfolio] message insert failed', err) }
    if (ok) {
      status.textContent = 'Message sent. Thank you!'
      form.reset()
      return
    }
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)
    const sub = encodeURIComponent(subject || `Portfolio enquiry from ${name}`)
    const compose = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}&su=${sub}&body=${body}`
    window.open(compose, '_blank')
    status.textContent = 'Saved locally is nahi ho paya — Gmail open ho gaya, wahan se send kar dein.'
  })
}

async function init() {
  bindContact()
  const [settings, skills, projects, certs, profiles, blogs] = await Promise.all([
    get('site_settings', 'select=*&id=eq.1'),
    get('skills', 'select=*&visible=eq.true&order=sort_order.asc'),
    get('projects', 'select=*&visible=eq.true&order=sort_order.asc'),
    get('certifications', 'select=*&visible=eq.true&order=sort_order.asc'),
    get('coding_profiles', 'select=*&visible=eq.true&order=sort_order.asc'),
    get('blogs', 'select=*&published=eq.true&order=created_at.desc'),
  ])
  applySettings(Array.isArray(settings) ? settings[0] : settings)
  renderSkills(skills)
  renderProjects(projects)
  renderCerts(certs)
  renderProfiles(profiles)
  renderBlogs(blogs)
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
else init()
