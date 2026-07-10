#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
const cmd = args[0]
const arg = (name, fallback = '') => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
}
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}
function projectDir() {
  return path.resolve(arg('--project', process.cwd()))
}
function loadProject(project) {
  const inv = path.join(project, 'inventory')
  return {
    meta: readJson(path.join(project, 'atlas.json'), { name: path.basename(project), version: '0.1.0' }),
    outcomes: readJson(path.join(inv, 'outcomes.json'), []),
    systems: readJson(path.join(inv, 'systems.json'), []),
    relationships: readJson(path.join(inv, 'relationships.json'), []),
    views: readJson(path.join(inv, 'views.json'), defaultViews()),
  }
}
function defaultViews() {
  return [
    { id: 'outcomes', title: 'Outcomes', type: 'outcomes' },
    { id: 'runtime', title: 'Runtime', type: 'systems', includeTypes: ['host', 'proxmox-host', 'service', 'web-service', 'knowledge-graph', 'content-corpus'] },
    { id: 'network', title: 'Network', type: 'systems', includeTypes: ['host', 'proxmox-host', 'vm', 'lxc', 'container', 'network', 'web-service'] },
    { id: 'integrations', title: 'Integrations', type: 'systems', includeTypes: ['service', 'web-service', 'external-integration', 'knowledge-graph', 'content-corpus'] },
  ]
}
const cleanId = v => String(v).trim().replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^([0-9])/, 'n_$1') || 'node'
const label = v => String(v ?? '').replace(/"/g, "'").replace(/\n/g, ' ')
function validateData(data) {
  const errors = []
  const ids = new Set(data.systems.map(s => s.id))
  for (const s of data.systems) {
    if (!s.id || !s.name) errors.push(`system missing id/name: ${JSON.stringify(s)}`)
    if (!s.role) errors.push(`system ${s.id} missing role`)
  }
  for (const r of data.relationships) {
    if (!ids.has(r.from)) errors.push(`relationship.from missing: ${r.from}`)
    if (!ids.has(r.to)) errors.push(`relationship.to missing: ${r.to}`)
    if (!r.label) errors.push(`relationship ${r.from}->${r.to} missing label`)
  }
  for (const o of data.outcomes) {
    if (!o.id || !o.name) errors.push(`outcome missing id/name: ${JSON.stringify(o)}`)
    for (const sid of o.systems || []) if (!ids.has(sid)) errors.push(`outcome ${o.id} references missing system: ${sid}`)
  }
  const linked = new Set()
  for (const r of data.relationships) { linked.add(r.from); linked.add(r.to) }
  for (const o of data.outcomes) for (const sid of o.systems || []) linked.add(sid)
  for (const s of data.systems) if (!linked.has(s.id)) errors.push(`orphan system: ${s.id}`)
  return errors
}
function classFor(sys) {
  if (['host', 'proxmox-host', 'vm', 'lxc', 'container'].includes(sys.type)) return sys.status === 'stopped' ? 'stopped' : 'host'
  if (sys.type === 'web-service') return 'web'
  if (sys.type === 'network') return 'network'
  if (sys.type === 'external-integration') return 'external'
  if (sys.status === 'stopped' || sys.status === 'disabled') return 'stopped'
  return 'service'
}
function nodeLabel(sys) {
  const detail = sys.url || sys.bind || sys.private || sys.host_ip || sys.role || ''
  return detail ? `${sys.name}<br/>${detail}` : sys.name
}
function mermaidSystem(data, view) {
  const allowed = new Set(data.systems.filter(s => !view.includeTypes || view.includeTypes.includes(s.type)).map(s => s.id))
  const lines = ['flowchart LR', '  classDef host fill:#101827,stroke:#101827,color:#ffffff', '  classDef service fill:#ffffff,stroke:#cfd6e4,color:#172033', '  classDef web fill:#f0e9ff,stroke:#7d17f4,color:#22103a', '  classDef network fill:#e7f8ef,stroke:#21a366,color:#0b5132', '  classDef external fill:#fff6db,stroke:#d6a600,color:#4a3100', '  classDef stopped fill:#f4f5f7,stroke:#a0a8b8,color:#687386,stroke-dasharray: 4 3']
  for (const s of data.systems.filter(s => allowed.has(s.id)).sort((a,b)=>a.id.localeCompare(b.id))) lines.push(`  sys_${cleanId(s.id)}["${label(nodeLabel(s))}"]:::${classFor(s)}`)
  for (const r of data.relationships) if (allowed.has(r.from) && allowed.has(r.to)) lines.push(`  sys_${cleanId(r.from)} -- "${label(r.label)}" --> sys_${cleanId(r.to)}`)
  return lines.join('\n') + '\n'
}
function mermaidOutcomes(data) {
  const idx = Object.fromEntries(data.systems.map(s => [s.id, s]))
  const lines = ['flowchart LR', '  classDef outcome fill:#f0e9ff,stroke:#7d17f4,color:#22103a,stroke-width:1px', '  classDef system fill:#ffffff,stroke:#cfd6e4,color:#172033', '  classDef external fill:#fff6db,stroke:#d6a600,color:#4a3100']
  const used = new Set()
  for (const o of data.outcomes) {
    const oid = `out_${cleanId(o.id)}`
    lines.push(`  ${oid}["${label(o.name)}"]:::outcome`)
    for (const sid of o.systems || []) {
      const s = idx[sid]; if (!s) continue
      const nid = `sys_${cleanId(sid)}`
      if (!used.has(sid)) { lines.push(`  ${nid}["${label(s.name)}"]:::${s.type === 'external-integration' ? 'external' : 'system'}`); used.add(sid) }
      lines.push(`  ${oid} --> ${nid}`)
    }
  }
  return lines.join('\n') + '\n'
}
function graphData(data) {
  const nodes = data.systems.map(s => ({
    id: s.id,
    type: s.type || 'system',
    data: { ...s, label: s.name, role: s.role || '', status: s.status || '', host: s.host || '', url: s.url || '', bind: s.bind || '', path: s.path || '', owner: s.owner || '', risk: s.risk || '', tags: s.tags || [] }
  }))
  const edges = data.relationships.map((r, i) => ({ id: `e-${i}-${r.from}-${r.to}`, source: r.from, target: r.to, label: r.label || '', data: { ...r } }))
  return { meta: data.meta, outcomes: data.outcomes, systems: data.systems, relationships: data.relationships, nodes, edges }
}
function render(project) {
  const data = loadProject(project)
  const errors = validateData(data)
  if (errors.length) throw new Error(errors.join('\n'))
  const out = path.join(project, 'generated')
  const diag = path.join(out, 'diagrams')
  fs.mkdirSync(diag, { recursive: true })
  const views = data.views?.length ? data.views : defaultViews()
  for (const v of views) fs.writeFileSync(path.join(diag, `${v.id}.mmd`), v.type === 'outcomes' ? mermaidOutcomes(data) : mermaidSystem(data, v))
  writeJson(path.join(out, 'atlas-data.json'), graphData(data))
  fs.writeFileSync(path.join(out, 'system-map.md'), markdown(data, views), 'utf8')
  writeJson(path.join(out, 'manifest.json'), { generatedAt: new Date().toISOString(), systems: data.systems.length, outcomes: data.outcomes.length, relationships: data.relationships.length, views: views.map(v => v.id) })
  const dist = path.join(root, 'viewer/dist')
  if (fs.existsSync(dist)) copyDir(dist, path.join(out, 'viewer'))
  if (fs.existsSync(path.join(out, 'viewer'))) fs.copyFileSync(path.join(out, 'atlas-data.json'), path.join(out, 'viewer/atlas-data.json'))
  console.log(JSON.stringify({ ok: true, out, systems: data.systems.length, outcomes: data.outcomes.length, relationships: data.relationships.length }, null, 2))
}
function markdown(data, views) {
  const lines = [`# ${data.meta.name || 'Atlasys Map'}`, '', `Generated: ${new Date().toISOString()}`, '', '## Outcomes', '']
  for (const o of data.outcomes) lines.push(`- **${o.name}**: ${o.description || ''}`)
  lines.push('', '## Mermaid diagrams', '')
  for (const v of views) lines.push(`- \`${v.id}\`: \`generated/diagrams/${v.id}.mmd\``)
  lines.push('', '## Systems', '', '| System | Type | Host | Status | Role |', '|---|---|---|---|---|')
  for (const s of data.systems) lines.push(`| ${s.name || ''} | ${s.type || ''} | ${s.host || ''} | ${s.status || ''} | ${String(s.role || '').replace(/\|/g, '/')} |`)
  return lines.join('\n') + '\n'
}
function serve(project) {
  const dir = path.join(project, 'generated/viewer')
  const port = Number(arg('--port', '8787'))
  if (!fs.existsSync(dir)) throw new Error('viewer not generated. Run atlas render first.')
  http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${port}`)
    const rel = url.pathname === '/' ? '/index.html' : url.pathname
    const file = path.normalize(path.join(dir, rel))
    if (!file.startsWith(dir)) { res.writeHead(403); return res.end('forbidden') }
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end('not found') }
    const ext = path.extname(file)
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' }
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  }).listen(port, '127.0.0.1', () => console.log(`Atlasys viewer: http://127.0.0.1:${port}`))
}
try {
  if (cmd === 'init') {
    const dest = path.resolve(args[1] || 'atlasys-project')
    copyDir(path.join(root, 'templates/project'), dest)
    fs.copyFileSync(path.join(root, 'AGENT.md'), path.join(dest, 'AGENT.md'))
    console.log(`created ${dest}`)
  } else if (cmd === 'validate') {
    const project = projectDir(); const errors = validateData(loadProject(project))
    if (errors.length) { console.error(errors.join('\n')); process.exit(2) }
    console.log('OK')
  } else if (cmd === 'render') render(projectDir())
  else if (cmd === 'serve') serve(projectDir())
  else {
    console.log('Usage: atlasys init <dir> | validate --project <dir> | render --project <dir> | serve --project <dir> [--port 8787]')
    process.exit(cmd ? 2 : 0)
  }
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
