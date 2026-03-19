import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const CC = {
  verde:    { bg:'#1a3d1f', text:'#4ade80', dot:'#22c55e', label:'Verde' },
  laranja:  { bg:'#3d2a0a', text:'#fb923c', dot:'#f97316', label:'Laranja' },
  vermelho: { bg:'#3d0f0f', text:'#f87171', dot:'#ef4444', label:'Vermelho' },
  roxo:     { bg:'#1e1040', text:'#a78bfa', dot:'#8b5cf6', label:'Roxo' },
  _:        { bg:'#1a1e2a', text:'#64748b', dot:'#475569', label:'—' },
}
const cs = (cor) => CC[cor] || CC._
const ini = (n) => n.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()
const fd = (d) => {
  if (!d) return '—'
  const dt = new Date(d + 'T12:00:00')
  return dt.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'2-digit' })
}

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#0d0f14; --surface:#13161e; --surface2:#1a1e2a;
    --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.13);
    --text:#e2e8f0; --muted:#64748b; --accent:#3b82f6; --accent-dim:rgba(59,130,246,0.12);
    --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace;
  }
  html,body,#root{height:100%}
  body{background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}
  select,input,textarea,button{font-family:var(--font)}
  ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
  @keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
`

function NavItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:7,
      fontSize:13,color:active?'var(--accent)':'var(--muted)',
      background:active?'var(--accent-dim)':'transparent',
      cursor:'pointer',marginBottom:1,transition:'all 0.15s',
    }}>
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{opacity:active?1:0.7}}>
        <path d={icon}/>
      </svg>
      {label}
    </div>
  )
}

function Badge({ cor }) {
  const c = cs(cor)
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10,fontWeight:500,padding:'3px 8px',borderRadius:20,fontFamily:'var(--mono)',background:c.bg,color:c.text}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:c.dot,flexShrink:0}}/>
      {c.label}
    </span>
  )
}

function StudentCard({ aluno, onClick }) {
  const c = cs(aluno.churn_cor)
  return (
    <div onClick={onClick}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.transform='translateY(-1px)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(0)'}}
      style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:13,cursor:'pointer',transition:'all 0.18s',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:c.dot,borderRadius:'12px 12px 0 0'}}/>
      <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:9}}>
        <div style={{width:34,height:34,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,flexShrink:0,background:c.bg,color:c.text}}>
          {ini(aluno.nome)}
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:500,lineHeight:1.3}}>{aluno.nome}</div>
          <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>{aluno.turma_nome} · {aluno.consultor_nome}</div>
        </div>
      </div>
      <Badge cor={aluno.churn_cor}/>
      {aluno.churn_score!=null && <span style={{fontSize:10,color:'var(--muted)',fontFamily:'var(--mono)',marginLeft:6}}>{Math.round(aluno.churn_score)}%</span>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginTop:9,paddingTop:9,borderTop:'1px solid var(--border)'}}>
        {[
          {label:'Aulas',val:`${aluno.aulas_presentes??0}/${aluno.total_aulas_realizadas??0}`},
          {label:'Reuniões',val:aluno.total_reunioes??0},
          {label:'Leads',val:aluno.leads_preenchido?'Sim':'Não',color:aluno.leads_preenchido?'#4ade80':'#f87171'},
          {label:'Financeiro',val:aluno.financeiro_preenchido?'Sim':'Não',color:aluno.financeiro_preenchido?'#4ade80':'#f87171'},
        ].map(st=>(
          <div key={st.label} style={{fontSize:11,color:'var(--muted)'}}>
            <strong style={{display:'block',fontSize:12,fontWeight:500,color:st.color||'var(--text)',fontFamily:'var(--mono)'}}>{st.val}</strong>
            {st.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function Panel({ aluno, aulas, reunioes, tarefas, presencas, notas, historico, onClose, onNotaSaved }) {
  const [novaNota, setNovaNota] = useState('')
  const [salvando, setSalvando] = useState(false)
  const c = cs(aluno.churn_cor)
  const turmaAulas = aulas.filter(a=>a.turma_id===aluno.turma_id).sort((a,b)=>a.numero-b.numero)
  const presMap = {}
  presencas.filter(p=>p.aluno_id===aluno.id).forEach(p=>{presMap[p.aula_id]=p.presente})

  async function salvarNota() {
    if (!novaNota.trim()) return
    setSalvando(true)
    await supabase.from('notas_internas').insert({aluno_id:aluno.id,conteudo:novaNota.trim()})
    setNovaNota('')
    setSalvando(false)
    onNotaSaved(aluno.id)
  }

  const crits = [
    {l:'U2A · perdeu 2 últimas aulas',v:aluno.u2a,p:'25%'},
    {l:'P3A · perdeu 3+ aulas',v:aluno.p3a,p:'25%'},
    {l:'Leads não preenchido',v:!aluno.leads_preenchido,p:'15%'},
    {l:'Financeiro não preenchido',v:!aluno.financeiro_preenchido,p:'15%'},
    {l:'Sem resposta aos fups',v:aluno.sem_resposta,p:'20%',full:true},
  ]

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:50,display:'flex',alignItems:'flex-start',justifyContent:'flex-end'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:455,height:'100vh',background:'var(--surface)',borderLeft:'1px solid var(--border)',overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:16,animation:'slideIn 0.2s ease'}}>

        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:16,fontWeight:600}}>{aluno.nome}</div>
            <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>{aluno.turma_nome} · {aluno.consultor_nome} · {aluno.especialidade||'—'}</div>
            <div style={{marginTop:8}}><Badge cor={aluno.churn_cor}/></div>
          </div>
          <button onClick={onClose} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,width:27,height:27,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--muted)',fontSize:13,flexShrink:0}}>✕</button>
        </div>

        {(aluno.churn_cor==='vermelho'||aluno.churn_cor==='roxo') && (
          <div style={{background:'#3d0f0f',border:'1px solid #7f1d1d',borderRadius:9,padding:'11px 13px'}}>
            <div style={{fontSize:12,fontWeight:500,color:'#f87171',marginBottom:3}}>Ação recomendada</div>
            <div style={{fontSize:11,color:'#fca5a5',lineHeight:1.5}}>
              {aluno.churn_cor==='roxo'?'Matheus deve elaborar plano estratégico. Follow-up em 14 dias.':`${aluno.consultor_nome} deve agendar reunião de resgate. Follow-up em 14 dias.`}
            </div>
          </div>
        )}

        <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
          <div style={{fontSize:10,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Score antichurn</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
            <span style={{fontSize:26,fontWeight:600,fontFamily:'var(--mono)',color:c.text}}>{aluno.churn_score!=null?Math.round(aluno.churn_score):0}%</span>
            <span style={{fontSize:11,color:'var(--muted)'}}>{c.label}</span>
          </div>
          <div style={{height:5,borderRadius:3,background:'var(--surface2)',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:3,width:`${aluno.churn_score||0}%`,background:c.dot}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:10}}>
            {crits.map((cr,i)=>(
              <div key={i} style={{padding:'9px 11px',borderRadius:8,background:cr.v?'#3d0f0f':'#1a3d1f',gridColumn:cr.full?'1/-1':undefined}}>
                <div style={{fontSize:10,color:'var(--muted)',marginBottom:2}}>{cr.l}</div>
                <div style={{fontSize:12,fontWeight:500,fontFamily:'var(--mono)',color:cr.v?'#f87171':'#4ade80'}}>{cr.v?'Sim':'Não'}</div>
                <div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>Peso {cr.p}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
          <div style={{fontSize:10,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Presença nas aulas</div>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {turmaAulas.map(au=>{
              const v=presMap[au.id]
              return (
                <div key={au.id} title={`Aula ${au.numero}: ${au.tema}`}
                  style={{width:25,height:25,borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:500,fontFamily:'var(--mono)',
                    background:v===true?'#1a3d1f':v===false?'#3d0f0f':'var(--surface2)',
                    color:v===true?'#4ade80':v===false?'#f87171':'var(--muted)'}}>
                  {au.numero}
                </div>
              )
            })}
            {turmaAulas.length===0&&<span style={{fontSize:12,color:'var(--muted)'}}>Sem aulas</span>}
          </div>
        </div>

        <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
          <div style={{fontSize:10,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Reuniões ({reunioes.length})</div>
          {reunioes.length===0&&<div style={{textAlign:'center',padding:'16px 0',color:'var(--muted)',fontSize:13}}>Nenhuma reunião</div>}
          {reunioes.map(r=>(
            <div key={r.id} style={{padding:'10px 12px',background:'var(--surface2)',borderRadius:8,marginBottom:7}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:10,fontFamily:'var(--mono)',color:'var(--muted)'}}>{fd(r.data_reuniao)}</span>
                {r.consultores?.nome&&<span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:'var(--accent-dim)',color:'var(--accent)'}}>{r.consultores.nome}</span>}
              </div>
              <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>{r.resumo||<em>Sem resumo</em>}</div>
            </div>
          ))}
        </div>

        <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
          <div style={{fontSize:10,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Tarefas ({tarefas.filter(t=>!t.concluida).length} abertas)</div>
          {tarefas.length===0&&<div style={{textAlign:'center',padding:'16px 0',color:'var(--muted)',fontSize:13}}>Nenhuma tarefa</div>}
          {tarefas.map(t=>(
            <div key={t.id} style={{display:'flex',alignItems:'flex-start',gap:8,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:14,height:14,borderRadius:4,border:`1.5px solid ${t.concluida?'#3b82f6':'var(--border2)'}`,background:t.concluida?'#3b82f6':'transparent',flexShrink:0,marginTop:1}}/>
              <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.4,flex:1,textDecoration:t.concluida?'line-through':'none',opacity:t.concluida?0.5:1}}>{t.descricao}</div>
            </div>
          ))}
        </div>

        <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
          <div style={{fontSize:10,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Informações</div>
          <table style={{width:'100%',fontSize:12}}>
            <tbody>
              {[['Especialidade',aluno.especialidade],['Cidade',aluno.cidade],['WhatsApp',aluno.whatsapp,'var(--accent)'],['Início',fd(aluno.data_entrada)],['Término',fd(aluno.data_fim_prevista)],['Consultor',aluno.consultor_nome]].map(([k,v,color])=>(
                <tr key={k}>
                  <td style={{padding:'6px 0',color:'var(--muted)',borderBottom:'1px solid var(--border)',width:'45%'}}>{k}</td>
                  <td style={{padding:'6px 0',fontWeight:500,textAlign:'right',borderBottom:'1px solid var(--border)',color:color||'var(--text)'}}>{v||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {historico.length>0&&(
          <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
            <div style={{fontSize:10,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Histórico de status</div>
            <div style={{paddingLeft:16,position:'relative'}}>
              <div style={{position:'absolute',left:4,top:4,bottom:4,width:1,background:'var(--border)'}}/>
              {historico.map(h=>{
                const hc=cs(h.cor_nova)
                return (
                  <div key={h.id} style={{position:'relative',marginBottom:11}}>
                    <div style={{position:'absolute',left:-14,top:4,width:7,height:7,borderRadius:'50%',background:hc.dot}}/>
                    <div style={{fontSize:10,color:'var(--muted)',fontFamily:'var(--mono)',marginBottom:1}}>{fd(h.criado_em?.split('T')[0])}</div>
                    <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.4}}>
                      <strong style={{color:hc.text}}>{hc.label}</strong> · score {Math.round(h.score_novo)}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
          <div style={{fontSize:10,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Notas internas</div>
          {notas.map(n=>(
            <div key={n.id} style={{padding:'10px 12px',background:'var(--surface2)',borderRadius:8,marginBottom:7}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:10,fontFamily:'var(--mono)',color:'var(--muted)'}}>{fd(n.created_at?.split('T')[0])}</span>
              </div>
              <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>{n.conteudo}</div>
            </div>
          ))}
          <textarea rows={3} value={novaNota} onChange={e=>setNovaNota(e.target.value)} placeholder="Adicionar nota..."
            style={{fontSize:12,padding:'9px 11px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',resize:'none',width:'100%',outline:'none',lineHeight:1.5,marginTop:8}}/>
          <button onClick={salvarNota} disabled={salvando}
            style={{fontSize:12,padding:'7px 14px',borderRadius:7,border:'1px solid var(--accent)',background:'var(--accent)',color:'#fff',cursor:'pointer',width:'100%',marginTop:6,opacity:salvando?0.6:1}}>
            {salvando?'Salvando...':'Salvar nota'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function App() {
  const [alunos,setAlunos]=useState([])
  const [turmas,setTurmas]=useState([])
  const [aulas,setAulas]=useState([])
  const [reunioes,setReunioes]=useState([])
  const [tarefas,setTarefas]=useState([])
  const [presencas,setPresencas]=useState([])
  const [notas,setNotas]=useState([])
  const [historico,setHistorico]=useState([])
  const [loading,setLoading]=useState(true)
  const [filterTurma,setFilterTurma]=useState('')
  const [filterChurn,setFilterChurn]=useState('')
  const [search,setSearch]=useState('')
  const [selected,setSelected]=useState(null)

  const loadAll=useCallback(async()=>{
    setLoading(true)
    const [a,t,au,r,ta,p,n,h]=await Promise.all([
      supabase.from('view_alunos_dashboard').select('*'),
      supabase.from('turmas').select('*'),
      supabase.from('aulas').select('*').order('numero'),
      supabase.from('reunioes').select('*,consultores(nome)').order('data_reuniao',{ascending:false}),
      supabase.from('tarefas').select('*,consultores(nome)').order('created_at',{ascending:false}),
      supabase.from('presencas').select('*,aulas(numero,tema,data_aula)'),
      supabase.from('notas_internas').select('*,consultores(nome)').order('created_at',{ascending:false}),
      supabase.from('churn_historico').select('*').order('criado_em',{ascending:false}),
    ])
    setAlunos(a.data||[]);setTurmas(t.data||[]);setAulas(au.data||[])
    setReunioes(r.data||[]);setTarefas(ta.data||[]);setPresencas(p.data||[])
    setNotas(n.data||[]);setHistorico(h.data||[])
    setLoading(false)
  },[])

  useEffect(()=>{loadAll()},[loadAll])

  async function reloadNotas(alunoId){
    const{data}=await supabase.from('notas_internas').select('*,consultores(nome)').eq('aluno_id',alunoId).order('created_at',{ascending:false})
    setNotas(prev=>[...(data||[]),...prev.filter(n=>n.aluno_id!==alunoId)])
  }

  const filtered=alunos.filter(a=>{
    if(filterTurma&&a.turma_id!==filterTurma)return false
    if(filterChurn&&a.churn_cor!==filterChurn)return false
    if(search&&!a.nome.toLowerCase().includes(search.toLowerCase()))return false
    return true
  })

  const counts={verde:0,laranja:0,vermelho:0,roxo:0}
  alunos.forEach(a=>{if(a.churn_cor&&counts[a.churn_cor]!==undefined)counts[a.churn_cor]++})
  const selectedAluno=selected?alunos.find(a=>a.id===selected):null

  return (
    <>
      <style>{G}</style>
      <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
        <div style={{width:210,minWidth:210,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'18px 16px 14px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:13,fontWeight:600,letterSpacing:'0.01em'}}>MBA Exponencial</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>Gestão de turmas</div>
          </div>
          <nav style={{padding:'10px 8px',flex:1}}>
            {[
              {id:'dashboard',label:'Dashboard',icon:'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z'},
              {id:'alunos',label:'Alunos',icon:'M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z'},
              {id:'calendario',label:'Calendário',icon:'M3 4h18v17H3zM16 2v4M8 2v4M3 10h18'},
              {id:'tarefas',label:'Tarefas',icon:'M9 11l3 3 8-8M5 12l2 2 4-4'},
            ].map(n=><NavItem key={n.id} {...n} active={true} onClick={()=>{}}/>)}
          </nav>
        </div>

        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'13px 22px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
            <div>
              <div style={{fontSize:15,fontWeight:500}}>Dashboard</div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{alunos.length} alunos · {turmas.length} turma{turmas.length!==1?'s':''}</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <select value={filterTurma} onChange={e=>setFilterTurma(e.target.value)}
                style={{fontSize:12,padding:'6px 10px',background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none'}}>
                <option value="">Todas as turmas</option>
                {turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
              <select value={filterChurn} onChange={e=>setFilterChurn(e.target.value)}
                style={{fontSize:12,padding:'6px 10px',background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none'}}>
                <option value="">Todos os status</option>
                <option value="verde">Verde</option>
                <option value="laranja">Laranja</option>
                <option value="vermelho">Vermelho</option>
                <option value="roxo">Roxo</option>
              </select>
            </div>
          </div>

          <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:9,marginBottom:18}}>
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 15px'}}>
                <div style={{fontSize:10,color:'var(--muted)',marginBottom:5,fontFamily:'var(--mono)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Total</div>
                <div style={{fontSize:22,fontWeight:600}}>{alunos.length}</div>
              </div>
              {[{k:'verde',c:'#22c55e'},{k:'laranja',c:'#f97316'},{k:'vermelho',c:'#ef4444'},{k:'roxo',c:'#8b5cf6'}].map(m=>(
                <div key={m.k} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 15px'}}>
                  <div style={{fontSize:10,color:'var(--muted)',marginBottom:5,fontFamily:'var(--mono)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{m.k.charAt(0).toUpperCase()+m.k.slice(1)}</div>
                  <div style={{fontSize:22,fontWeight:600,color:m.c}}>{counts[m.k]}</div>
                </div>
              ))}
            </div>

            <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
              {[{id:'',label:'Todas'},...turmas.map(t=>({id:t.id,label:`${t.nome} (${alunos.filter(a=>a.turma_id===t.id).length})`}))].map(t=>(
                <button key={t.id} onClick={()=>setFilterTurma(t.id)}
                  style={{fontSize:12,padding:'5px 12px',borderRadius:20,border:'1px solid',fontFamily:'var(--font)',cursor:'pointer',
                    background:filterTurma===t.id?'var(--accent)':'transparent',
                    borderColor:filterTurma===t.id?'var(--accent)':'var(--border)',
                    color:filterTurma===t.id?'#fff':'var(--muted)'}}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{display:'flex',gap:8,marginBottom:14}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar aluno..."
                style={{fontSize:12,padding:'6px 10px',background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none',width:200}}/>
            </div>

            {loading?(
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:180,color:'var(--muted)',fontSize:13,fontFamily:'var(--mono)'}}>Carregando dados...</div>
            ):filtered.length===0?(
              <div style={{textAlign:'center',padding:40,color:'var(--muted)',fontSize:13}}>Nenhum aluno encontrado</div>
            ):(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:9}}>
                {filtered.map(a=><StudentCard key={a.id} aluno={a} onClick={()=>setSelected(a.id)}/>)}
              </div>
            )}
          </div>
        </div>

        {selectedAluno&&(
          <Panel
            aluno={selectedAluno}
            aulas={aulas}
            reunioes={reunioes.filter(r=>r.aluno_id===selectedAluno.id)}
            tarefas={tarefas.filter(t=>t.aluno_id===selectedAluno.id)}
            presencas={presencas}
            notas={notas.filter(n=>n.aluno_id===selectedAluno.id)}
            historico={historico.filter(h=>h.aluno_id===selectedAluno.id)}
            onClose={()=>setSelected(null)}
            onNotaSaved={reloadNotas}
          />
        )}
      </div>
    </>
  )
}
