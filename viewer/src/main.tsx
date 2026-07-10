import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import ELK from 'elkjs/lib/elk.bundled.js'
import { Background, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, applyEdgeChanges, applyNodeChanges, type Edge, type Node, type NodeChange, type EdgeChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './styles.css'

type AtlasData = { meta:any; outcomes:any[]; systems:any[]; relationships:any[]; nodes:Node[]; edges:Edge[] }
const elk = new ELK()
const storageKey = 'ops-atlas-layout-v2'

function nodeClass(type:string){
  if(['host','proxmox-host','vm','lxc','container'].includes(type)) return 'node-host'
  if(type === 'web-service') return 'node-web'
  if(type === 'network') return 'node-network'
  if(type === 'external-integration') return 'node-external'
  if(type === 'agent') return 'node-agent'
  if(type === 'job' || type === 'automation') return 'node-job'
  return 'node-service'
}
function AtlasNode({ data }: any){
  const tags = Array.isArray(data.tags) ? data.tags.slice(0, 3) : []
  return <div className={`atlas-node ${nodeClass(data.type || '')}`}>
    <Handle className="atlas-handle atlas-handle-in" type="target" position={Position.Left} />
    <Handle className="atlas-handle atlas-handle-out" type="source" position={Position.Right} />
    <div className="node-type">{data.type || 'system'}</div>
    <div className="node-title">{data.label}</div>
    <div className="node-role">{data.role}</div>
    <div className="node-meta"><span>{data.status || 'unknown'}</span>{data.host ? <span>{data.host}</span> : null}{data.risk ? <b>{data.risk}</b> : null}</div>
    {tags.length ? <div className="node-tags">{tags.map((t:string)=><em key={t}>{t}</em>)}</div> : null}
  </div>
}
const nodeTypes = { default: AtlasNode }

async function layout(nodes:Node[], edges:Edge[]){
  const graph = { id:'root', layoutOptions:{ 'elk.algorithm':'layered', 'elk.direction':'RIGHT', 'elk.spacing.nodeNode':'90', 'elk.layered.spacing.nodeNodeBetweenLayers':'140', 'elk.edgeRouting':'ORTHOGONAL' }, children:nodes.map(n=>({ id:n.id, width:280, height:136 })), edges:edges.map(e=>({ id:e.id, sources:[e.source], targets:[e.target] })) }
  const res:any = await elk.layout(graph)
  return nodes.map(n => { const x = res.children?.find((c:any)=>c.id===n.id); return { ...n, position:{ x:x?.x || 0, y:x?.y || 0 } } })
}
function buildMermaid(nodes:Node[], edges:Edge[]){
  const clean=(s:string)=>s.replace(/[^a-zA-Z0-9_]+/g,'_')
  return ['flowchart LR', ...nodes.map(n=>`  ${clean(n.id)}["${String(n.data.label).replace(/"/g,"'")}"]`), ...edges.map(e=>`  ${clean(e.source)} -- "${e.label || ''}" --> ${clean(e.target)}`)].join('\n')
}
function decorateEdge(e:Edge):Edge{
  return {
    ...e,
    type: 'smoothstep',
    animated: false,
    zIndex: 2,
    interactionWidth: 24,
    markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#5f6f89' },
    style: { stroke:'#5f6f89', strokeWidth:2.4 },
    labelStyle: { fill:'#172033', fontWeight:800, fontSize:11 },
    labelBgStyle: { fill:'#ffffff', fillOpacity:.95, stroke:'#dfe4ee', strokeWidth:1 },
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 8,
  }
}
function App(){
  const [data,setData]=useState<AtlasData|null>(null)
  const [nodes,setNodes]=useState<Node[]>([])
  const [edges,setEdges]=useState<Edge[]>([])
  const [query,setQuery]=useState('')
  const [outcome,setOutcome]=useState('all')
  const [selected,setSelected]=useState<any>(null)
  const [showLabels,setShowLabels]=useState(true)
  useEffect(()=>{ fetch('/atlas-data.json').then(r=>r.json()).then(async d=>{ setData(d); const saved=JSON.parse(localStorage.getItem(storageKey)||'{}'); const rawNodes=d.nodes.map((n:Node)=>({ ...n, data:{...n.data, type:n.type}, position:saved[n.id] || {x:0,y:0} })); const laid=Object.keys(saved).length ? rawNodes : await layout(rawNodes, d.edges); setNodes(laid); setEdges(d.edges.map((e:Edge)=>decorateEdge(e))) }) },[])
  const activeIds = useMemo(()=>{ if(!data) return new Set<string>(); let ids = new Set(data.systems.map(s=>s.id)); if(outcome !== 'all'){ const o=data.outcomes.find(o=>o.id===outcome); ids = new Set(o?.systems || []) } if(query.trim()){ const q=query.toLowerCase(); ids = new Set([...ids].filter(id=>{ const s=data.systems.find(s=>s.id===id); const rels=data.relationships.filter(r=>r.from===id||r.to===id); return (JSON.stringify(s||{})+JSON.stringify(rels)).toLowerCase().includes(q) })) } return ids },[data,outcome,query])
  const shownNodes = nodes.filter(n=>activeIds.has(n.id))
  const shownEdges = edges.filter(e=>activeIds.has(e.source)&&activeIds.has(e.target)).map(e => showLabels ? e : { ...e, label: '' })
  const related = useMemo(()=> selected && data ? data.relationships.filter(r=>r.from===selected.id || r.to===selected.id) : [], [selected,data])
  const onNodesChange = useCallback((changes:NodeChange[])=>{ setNodes(nds=>{ const next=applyNodeChanges(changes,nds); const positions:any={}; for(const n of next) positions[n.id]=n.position; localStorage.setItem(storageKey,JSON.stringify(positions)); return next }) },[])
  const onEdgesChange = useCallback((changes:EdgeChange[])=>setEdges(eds=>applyEdgeChanges(changes,eds)),[])
  const relayout = async()=>{ const laid=await layout(nodes,edges); setNodes(laid); localStorage.removeItem(storageKey) }
  const downloadMermaid=()=>{ const blob=new Blob([buildMermaid(shownNodes,shownEdges)],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ops-atlas.mmd'; a.click(); URL.revokeObjectURL(a.href) }
  return <div className="app"><aside><div className="brand"><span className="brand-mark">◎</span><div><h1>Atlasys</h1><p>{data?.meta?.name || 'loading'}</p></div></div><label><span className="icon">⌕</span> Search</label><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="system, host, relationship, tag…"/><label>Outcome</label><select value={outcome} onChange={e=>setOutcome(e.target.value)}><option value="all">All outcomes</option>{data?.outcomes.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select><div className="stats"><b>{shownNodes.length}</b><span>systems</span><b>{shownEdges.length}</b><span>direct relations</span></div><button onClick={relayout}><span className="icon">↔</span> Auto layout</button><button onClick={()=>setShowLabels(v=>!v)}><span className="icon">⎇</span> {showLabels ? 'Hide' : 'Show'} labels</button><button onClick={downloadMermaid}><span className="icon">⇩</span> Export Mermaid</button><div className="legend"><span className="dot host"/>Host/VM/CT<span className="dot web"/>Web service<span className="dot network"/>Network<span className="dot external"/>External/API<span className="dot agent"/>Agent<span className="dot job"/>Job/automation</div>{selected?<div className="details"><h2>{selected.label}</h2><p>{selected.role}</p><dl><dt>Type</dt><dd>{selected.type||'—'}</dd><dt>Status</dt><dd>{selected.status||'—'}</dd><dt>Host</dt><dd>{selected.host||'—'}</dd><dt>URL</dt><dd>{selected.url||'—'}</dd><dt>Bind</dt><dd>{selected.bind||'—'}</dd><dt>Path</dt><dd>{selected.path||'—'}</dd><dt>Owner</dt><dd>{selected.owner||'—'}</dd><dt>Risk</dt><dd>{selected.risk||'—'}</dd></dl><h3>Direct relations</h3><div className="relations">{related.length ? related.map((r:any,i:number)=><div key={i}><b>{r.from === selected.id ? 'out' : 'in'}</b><span>{r.from} → {r.to}</span><em>{r.label}</em></div>) : <p>No direct relations.</p>}</div></div>:<p className="hint">Click a node to inspect. Lines are direct relationships. Drag nodes to arrange; layout saves in this browser.</p>}</aside><main><ReactFlow nodes={shownNodes} edges={shownEdges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={(_,n)=>setSelected({...n.data,id:n.id})} fitView minZoom={0.08} maxZoom={1.6}><Background gap={22}/><MiniMap/><Controls/></ReactFlow></main></div>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
