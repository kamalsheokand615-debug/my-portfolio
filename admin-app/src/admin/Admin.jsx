import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import './admin.css'

// ---- Har section ki config: yahan se form aur list apne aap bante hain ----
const SECTIONS = {
  skills: {
    label: 'Skills & Tools', table: 'skills', title: 'title', sub: 'category', flag: 'visible',
    fields: [
      ['title', 'Skill name', 'text'], ['category', 'Category', 'text'],
      ['level', 'Level (0-100)', 'number'], ['icon_url', 'Icon', 'image'],
      ['sort_order', 'Order', 'number'], ['visible', 'Show on portfolio', 'toggle'],
    ],
  },
  projects: {
    label: 'Projects', table: 'projects', title: 'title', sub: 'live_url', flag: 'visible', img: 'image_url',
    fields: [
      ['title', 'Project title', 'text'], ['description', 'Description', 'textarea'],
      ['image_url', 'Cover image', 'image'], ['live_url', 'Live link', 'text'],
      ['tags', 'Tags (comma separated)', 'tags'], ['sort_order', 'Order', 'number'],
      ['visible', 'Show on portfolio', 'toggle'],
    ],
  },
  certifications: {
    label: 'Certifications', table: 'certifications', title: 'title', sub: 'issuer', flag: 'visible', img: 'image_url',
    fields: [
      ['title', 'Certificate name', 'text'], ['issuer', 'Issued by', 'text'],
      ['issued_on', 'Date', 'date'], ['image_url', 'Certificate image', 'image'],
      ['link', 'Verify link', 'text'], ['sort_order', 'Order', 'number'],
      ['visible', 'Show on portfolio', 'toggle'],
    ],
  },
  coding_profiles: {
    label: 'Coding Profiles', table: 'coding_profiles', title: 'platform', sub: 'url', flag: 'visible',
    fields: [
      ['platform', 'Platform (GitHub, LinkedIn...)', 'text'], ['url', 'Profile link', 'text'],
      ['username', 'Username', 'text'], ['sort_order', 'Order', 'number'],
      ['visible', 'Show on portfolio', 'toggle'],
    ],
  },
  blogs: {
    label: 'Blogs', table: 'blogs', title: 'title', sub: 'excerpt', flag: 'published', img: 'cover_url', order: 'created_at',
    fields: [
      ['title', 'Title', 'text'], ['slug', 'URL slug', 'text'], ['excerpt', 'Short summary', 'textarea'],
      ['content', 'Content', 'textarea-lg'], ['cover_url', 'Cover image', 'image'],
      ['published', 'Published', 'toggle'],
    ],
  },
}

const SETTINGS_FIELDS = [
  ['name', 'Your name', 'text'], ['tagline', 'Tagline', 'text'], ['bio', 'About you', 'textarea-lg'],
  ['photo_url', 'Profile photo', 'image'], ['resume_url', 'Resume (PDF link)', 'text'],
  ['email', 'Email', 'text'], ['phone', 'Phone', 'text'],
  ['primary_color', 'Theme color', 'color'],
]

const NAV = [
  ['dashboard', 'Dashboard'], ['settings', 'Hero, About & SEO'],
  ...Object.entries(SECTIONS).map(([k, v]) => [k, v.label]),
  ['messages', 'Messages'], ['media', 'Media Library'],
]

// ---- Chhote helpers ----
function useToast() {
  const [t, setT] = useState(null)
  const show = (msg, bad) => { setT({ msg, bad }); setTimeout(() => setT(null), 2800) }
  return [t, show]
}

async function uploadImage(file) {
  const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
  const { error } = await supabase.storage.from('media').upload(path, file)
  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}

function Field({ def, value, onChange, toast }) {
  const [key, label, type] = def
  const [busy, setBusy] = useState(false)
  const set = (v) => onChange(key, v)
  let input
  if (type === 'textarea' || type === 'textarea-lg')
    input = <textarea rows={type === 'textarea' ? 3 : 9} value={value ?? ''} onChange={(e) => set(e.target.value)} />
  else if (type === 'toggle')
    input = (
      <button type="button" className={'switch' + (value ? ' on' : '')} onClick={() => set(!value)} aria-pressed={!!value}>
        <span />
      </button>
    )
  else if (type === 'tags')
    input = <input value={(value || []).join(', ')} onChange={(e) => set(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
  else if (type === 'image')
    input = (
      <div className="imgfield">
        {value && <img src={value} alt="" />}
        <input placeholder="Image link ya upload karo" value={value ?? ''} onChange={(e) => set(e.target.value)} />
        <label className="btn ghost">
          {busy ? 'Uploading…' : 'Upload'}
          <input type="file" accept="image/*" hidden onChange={async (e) => {
            const f = e.target.files[0]; if (!f) return
            setBusy(true)
            try { set(await uploadImage(f)) } catch (err) { toast(err.message, true) }
            setBusy(false)
          }} />
        </label>
      </div>
    )
  else
    input = <input type={type === 'number' ? 'number' : type === 'date' ? 'date' : type === 'color' ? 'color' : 'text'}
      value={value ?? ''} onChange={(e) => set(type === 'number' ? Number(e.target.value) : e.target.value)} />
  return <div className={'field' + (type === 'toggle' ? ' row' : '')}><label>{label}</label>{input}</div>
}

// ---- Login ----
function Login() {
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState('')
  const go = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) setErr(error.message)
  }
  return (
    <div className="login">
      <form onSubmit={go} className="card">
        <h1>Portfolio Admin</h1>
        <p>Apna portfolio yahan se manage karo.</p>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        {err && <div className="err">{err}</div>}
        <button className="btn">Sign in</button>
      </form>
    </div>
  )
}

// ---- Dashboard ----
function Dashboard({ go }) {
  const [n, setN] = useState({})
  useEffect(() => {
    const tables = ['skills', 'projects', 'certifications', 'coding_profiles', 'blogs']
    Promise.all([
      ...tables.map((t) => supabase.from(t).select('*', { count: 'exact', head: true })),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
    ]).then((r) => setN(Object.fromEntries([...tables, 'unread'].map((k, i) => [k, r[i].count ?? 0]))))
  }, [])
  const cards = [
    ['projects', 'Projects'], ['skills', 'Skills'], ['certifications', 'Certifications'],
    ['blogs', 'Blog posts'], ['unread', 'Unread messages'],
  ]
  return (
    <>
      <div className="stats">
        {cards.map(([k, l]) => (
          <button key={k} className="stat" onClick={() => go(k === 'unread' ? 'messages' : k)}>
            <b>{n[k] ?? '–'}</b><span>{l}</span>
          </button>
        ))}
      </div>
      <div className="card">
        <h3>Shuruat kaise karein</h3>
        <p>Left menu se koi bhi section kholo, content add ya edit karo aur Save dabao. Portfolio me change turant dikhega. Kisi item ko chhupana ho to uska “Show on portfolio” switch band kar do.</p>
      </div>
    </>
  )
}

// ---- Settings (single row) ----
function Settings({ toast }) {
  const [v, setV] = useState(null)
  useEffect(() => { supabase.from('site_settings').select('*').eq('id', 1).single().then(({ data }) => setV(data)) }, [])
  if (!v) return <p>Loading…</p>
  const save = async () => {
    const { error } = await supabase.from('site_settings').update({ ...v, updated_at: new Date() }).eq('id', 1)
    toast(error ? error.message : 'Saved', !!error)
  }
  return (
    <div className="card form">
      {SETTINGS_FIELDS.map((d) => <Field key={d[0]} def={d} value={v[d[0]]} onChange={(k, x) => setV({ ...v, [k]: x })} toast={toast} />)}
      <button className="btn" onClick={save}>Save changes</button>
    </div>
  )
}

// ---- Generic CRUD list + form ----
function Crud({ cfg, toast }) {
  const [rows, setRows] = useState(null), [edit, setEdit] = useState(null), [q, setQ] = useState('')
  const load = useCallback(async () => {
    const order = cfg.order || 'sort_order'
    const { data } = await supabase.from(cfg.table).select('*').order(order, { ascending: order === 'sort_order' })
    setRows(data || [])
  }, [cfg])
  useEffect(() => { setRows(null); setEdit(null); load() }, [load])

  const save = async () => {
    const { id, created_at, ...body } = edit
    const { error } = id ? await supabase.from(cfg.table).update(body).eq('id', id) : await supabase.from(cfg.table).insert(body)
    if (error) return toast(error.message, true)
    toast('Saved'); setEdit(null); load()
  }
  const remove = async (r) => {
    if (!confirm('Ye item delete kar du?')) return
    const { error } = await supabase.from(cfg.table).delete().eq('id', r.id)
    toast(error ? error.message : 'Deleted', !!error); load()
  }
  const flip = async (r) => { await supabase.from(cfg.table).update({ [cfg.flag]: !r[cfg.flag] }).eq('id', r.id); load() }

  if (edit) return (
    <div className="card form">
      <h3>{edit.id ? 'Edit' : 'Add new'} · {cfg.label}</h3>
      {cfg.fields.map((d) => <Field key={d[0]} def={d} value={edit[d[0]]} onChange={(k, x) => setEdit({ ...edit, [k]: x })} toast={toast} />)}
      <div className="actions">
        <button className="btn" onClick={save}>Save changes</button>
        <button className="btn ghost" onClick={() => setEdit(null)}>Cancel</button>
      </div>
    </div>
  )
  const shown = (rows || []).filter((r) => (r[cfg.title] || '').toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <div className="bar">
        <input className="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn" onClick={() => setEdit(Object.fromEntries(cfg.fields.map((f) => [f[0], f[2] === 'toggle' ? cfg.flag === f[0] && f[0] === 'visible' : f[2] === 'tags' ? [] : f[2] === 'number' ? 0 : ''])))}>
          Add new
        </button>
      </div>
      {rows === null ? <p>Loading…</p> : shown.length === 0 ? (
        <div className="card empty">Abhi kuch nahi hai. “Add new” dabakar pehla item banao.</div>
      ) : (
        <div className="list">
          {shown.map((r) => (
            <div className="item" key={r.id}>
              {cfg.img && r[cfg.img] ? <img src={r[cfg.img]} alt="" /> : <div className="ph" />}
              <div className="txt"><b>{r[cfg.title]}</b><span>{r[cfg.sub]}</span></div>
              <button type="button" className={'switch' + (r[cfg.flag] ? ' on' : '')} onClick={() => flip(r)} aria-label="Show or hide"><span /></button>
              <button className="btn ghost sm" onClick={() => setEdit(r)}>Edit</button>
              <button className="btn danger sm" onClick={() => remove(r)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ---- Messages ----
function Messages({ toast }) {
  const [rows, setRows] = useState([])
  const load = () => supabase.from('messages').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []))
  useEffect(() => { load() }, [])
  if (!rows.length) return <div className="card empty">Abhi koi message nahi aaya.</div>
  return (
    <div className="list">
      {rows.map((m) => (
        <div className={'card msg' + (m.is_read ? '' : ' unread')} key={m.id}>
          <div className="top"><b>{m.name}</b><a href={`mailto:${m.email}`}>{m.email}</a><span>{new Date(m.created_at).toLocaleString()}</span></div>
          <p>{m.message}</p>
          <div className="actions">
            <button className="btn ghost sm" onClick={async () => { await supabase.from('messages').update({ is_read: !m.is_read }).eq('id', m.id); load() }}>
              {m.is_read ? 'Mark unread' : 'Mark read'}
            </button>
            <button className="btn danger sm" onClick={async () => { if (confirm('Delete message?')) { await supabase.from('messages').delete().eq('id', m.id); toast('Deleted'); load() } }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---- Media Library ----
function Media({ toast }) {
  const [files, setFiles] = useState([])
  const load = () => supabase.storage.from('media').list('', { sortBy: { column: 'created_at', order: 'desc' } }).then(({ data }) => setFiles(data || []))
  useEffect(() => { load() }, [])
  const url = (n) => supabase.storage.from('media').getPublicUrl(n).data.publicUrl
  return (
    <>
      <div className="bar">
        <span />
        <label className="btn">Upload image
          <input type="file" accept="image/*" hidden onChange={async (e) => {
            try { await uploadImage(e.target.files[0]); toast('Uploaded'); load() } catch (err) { toast(err.message, true) }
          }} />
        </label>
      </div>
      <div className="grid">
        {files.filter((f) => f.name !== '.emptyFolderPlaceholder').map((f) => (
          <div className="card thumb" key={f.name}>
            <img src={url(f.name)} alt="" />
            <div className="actions">
              <button className="btn ghost sm" onClick={() => { navigator.clipboard.writeText(url(f.name)); toast('Link copied') }}>Copy link</button>
              <button className="btn danger sm" onClick={async () => { await supabase.storage.from('media').remove([f.name]); load() }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ---- Shell ----
export default function Admin() {
  const [session, setSession] = useState(undefined)
  const [page, setPage] = useState('dashboard')
  const [open, setOpen] = useState(false)
  const [toastObj, toast] = useToast()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  if (session === undefined) return null
  if (!session) return <Login />

  const go = (p) => { setPage(p); setOpen(false) }
  const label = NAV.find((n) => n[0] === page)[1]
  let body
  if (page === 'dashboard') body = <Dashboard go={go} />
  else if (page === 'settings') body = <Settings toast={toast} />
  else if (page === 'messages') body = <Messages toast={toast} />
  else if (page === 'media') body = <Media toast={toast} />
  else body = <Crud key={page} cfg={SECTIONS[page]} toast={toast} />

  return (
    <div className="shell">
      <aside className={open ? 'open' : ''}>
        <div className="brand">Portfolio Admin</div>
        <nav>{NAV.map(([k, l]) => <button key={k} className={page === k ? 'on' : ''} onClick={() => go(k)}>{l}</button>)}</nav>
        <a className="out" href="../portfolio/" target="_blank" rel="noopener">View portfolio ↗</a>
        <button className="out" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <main>
        <header>
          <button className="burger" onClick={() => setOpen(true)} aria-label="Menu">☰</button>
          <h2>{label}</h2>
        </header>
        <section>{body}</section>
      </main>
      {toastObj && <div className={'toast' + (toastObj.bad ? ' bad' : '')}>{toastObj.msg}</div>}
    </div>
  )
}
