import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const CC = {
  verde:    { bg:'#dcfce7', text:'#14532d', dot:'#16a34a', label:'Verde',    border:'#86efac' },
  laranja:  { bg:'#fff7ed', text:'#7c2d12', dot:'#ea580c', label:'Laranja',  border:'#fdba74' },
  vermelho: { bg:'#fee2e2', text:'#7f1d1d', dot:'#dc2626', label:'Vermelho', border:'#fca5a5' },
  roxo:     { bg:'#ede9fe', text:'#2e1065', dot:'#7c3aed', label:'Roxo',     border:'#c4b5fd' },
  _:        { bg:'#f1f5f9', text:'#475569', dot:'#94a3b8', label:'—',        border:'#cbd5e1' },
}
const cs = c => CC[c] || CC._
const ini = n => n.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()
const fd = d => {
  if (!d) return '—'
  return new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'2-digit'})
}

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#f8fafc;--surface:#fff;--surface2:#f1f5f9;
    --border:#e2e8f0;--border2:#cbd5e1;
    --text:#0f172a;--text2:#334155;--muted:#64748b;
    --accent:#2563eb;--accent-dim:#eff6ff;--accent-text:#1d4ed8;
    --font:'DM Sans',sans-serif;--mono:'DM Mono',monospace;
  }
  html,body,#root{height:100%}
  body{background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}
  select,input,textarea,button{font-family:var(--font)}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
  @keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
`

// ─── Componentes base ───────────────────────────────────────────────

function Badge({ cor }) {
  const c = cs(cor)
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,fontFamily:'var(--mono)',background:c.bg,color:c.text,border:`1px solid ${c.border}`}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:c.dot,flexShrink:0}}/>
      {c.label}
    </span>
  )
}

function Btn({ children, onClick, variant='default', disabled, style={} }) {
  const base = {fontSize:13,fontWeight:500,padding:'7px 14px',borderRadius:8,cursor:disabled?'not-allowed':'pointer',transition:'all 0.15s',border:'none',opacity:disabled?0.6:1,...style}
  const variants = {
    default:{background:'var(--surface)',border:'1.5px solid var(--border2)',color:'var(--text2)'},
    primary:{background:'var(--accent)',color:'#fff'},
    danger:{background:'#fee2e2',color:'#7f1d1d',border:'1px solid #fca5a5'},
    ghost:{background:'transparent',color:'var(--muted)',border:'1px solid var(--border)'},
  }
  return <button onClick={onClick} disabled={disabled} style={{...base,...variants[variant]}}>{children}</button>
}

function Input({ label, value, onChange, type='text', placeholder, required }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label && <label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}{required&&<span style={{color:'#dc2626'}}> *</span>}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{fontSize:13,padding:'8px 11px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:8,color:'var(--text)',outline:'none',width:'100%'}}/>
    </div>
  )
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label && <label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}{required&&<span style={{color:'#dc2626'}}> *</span>}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{fontSize:13,padding:'8px 11px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:8,color:'var(--text)',outline:'none',width:'100%'}}>
        <option value="">Selecionar...</option>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Textarea({ label, value, onChange, rows=3, placeholder }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label && <label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}</label>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder}
        style={{fontSize:13,padding:'8px 11px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:8,color:'var(--text)',outline:'none',resize:'vertical',lineHeight:1.6}}/>
    </div>
  )
}

function Modal({ title, onClose, children, width=520 }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'var(--surface)',borderRadius:14,width:'100%',maxWidth:width,maxHeight:'90vh',overflowY:'auto',animation:'fadeIn 0.2s ease',boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',borderBottom:'1px solid var(--border)'}}>
          <div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>{title}</div>
          <button onClick={onClose} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--muted)',fontSize:14}}>✕</button>
        </div>
        <div style={{padding:'20px 22px',display:'flex',flexDirection:'column',gap:16}}>{children}</div>
      </div>
    </div>
  )
}

// ─── Navbar lateral ────────────────────────────────────────────────

function NavItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:7,fontSize:13,fontWeight:active?500:400,color:active?'var(--accent-text)':'var(--muted)',background:active?'var(--accent-dim)':'transparent',cursor:'pointer',marginBottom:1,transition:'all 0.15s'}}>
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{flexShrink:0}}><path d={icon}/></svg>
      {label}
    </div>
  )
}

// ─── Painel lateral de aluno ───────────────────────────────────────

function StudentPanel({ aluno, aulas, reunioes, tarefas, presencas, notas, historico, consultores, turmas, onClose, onUpdate }) {
  const [tab, setTab] = useState('perfil')
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    nome: aluno.nome||'', whatsapp: aluno.whatsapp||'', cidade: aluno.cidade||'',
    especialidade: aluno.especialidade||'', clinica: aluno.clinica||'',
    consultor_id: aluno.consultor_id||'', turma_id: aluno.turma_id||'',
    ativo: aluno.ativo,
  })
  const [saving, setSaving] = useState(false)

  // Reunião nova
  const [novaReuniao, setNovaReuniao] = useState({ data_reuniao: '', resumo: '', consultor_id: aluno.consultor_id||'' })
  const [savingReuniao, setSavingReuniao] = useState(false)

  // Nota nova
  const [novaNota, setNovaNota] = useState('')
  const [savingNota, setSavingNota] = useState(false)

  const c = cs(aluno.churn_cor)
  const turmaAulas = aulas.filter(a=>a.turma_id===aluno.turma_id).sort((a,b)=>a.numero-b.numero)
  const presMap = {}
  presencas.filter(p=>p.aluno_id===aluno.id).forEach(p=>{ presMap[p.aula_id]=p.presente })
  const psec = { borderTop:'1px solid var(--border)', paddingTop:16, marginTop:4 }

  async function salvarEdicao() {
    setSaving(true)
    await supabase.from('alunos').update({
      nome: form.nome, whatsapp: form.whatsapp, cidade: form.cidade,
      especialidade: form.especialidade, clinica: form.clinica,
      consultor_id: form.consultor_id, turma_id: form.turma_id,
      ativo: form.ativo,
    }).eq('id', aluno.id)
    setSaving(false)
    setEditMode(false)
    onUpdate()
  }

  async function salvarReuniao() {
    if (!novaReuniao.data_reuniao || !novaReuniao.resumo.trim()) return
    setSavingReuniao(true)
    await supabase.from('reunioes').insert({
      aluno_id: aluno.id,
      consultor_id: novaReuniao.consultor_id || aluno.consultor_id,
      data_reuniao: novaReuniao.data_reuniao,
      resumo: novaReuniao.resumo.trim(),
    })
    setNovaReuniao({ data_reuniao:'', resumo:'', consultor_id: aluno.consultor_id||'' })
    setSavingReuniao(false)
    onUpdate()
  }

  async function salvarNota() {
    if (!novaNota.trim()) return
    setSavingNota(true)
    await supabase.from('notas_internas').insert({ aluno_id: aluno.id, conteudo: novaNota.trim() })
    setNovaNota('')
    setSavingNota(false)
    onUpdate()
  }

  const tabs = [
    { id:'perfil', label:'Perfil' },
    { id:'presenca', label:'Presença' },
    { id:'reunioes', label:`Reuniões (${reunioes.length})` },
    { id:'notas', label:'Notas' },
  ]

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',zIndex:50,display:'flex',alignItems:'flex-start',justifyContent:'flex-end'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:480,height:'100vh',background:'var(--surface)',borderLeft:'1px solid var(--border)',overflowY:'auto',display:'flex',flexDirection:'column',animation:'slideIn 0.2s ease'}}>

        {/* Header */}
        <div style={{padding:'18px 20px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
            <div>
              <div style={{fontSize:17,fontWeight:700,color:'var(--text)'}}>{aluno.nome}</div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>{aluno.turma_nome} · {aluno.consultor_nome} · {aluno.especialidade||'—'}</div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
                <Badge cor={aluno.churn_cor}/>
                {!aluno.ativo && <span style={{fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,background:'#f1f5f9',color:'#64748b',border:'1px solid #cbd5e1'}}>Inativo</span>}
              </div>
            </div>
            <div style={{display:'flex',gap:6}}>
              <Btn onClick={()=>setEditMode(!editMode)} variant={editMode?'primary':'default'} style={{fontSize:12,padding:'5px 12px'}}>
                {editMode ? 'Cancelar' : 'Editar'}
              </Btn>
              <button onClick={onClose} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--muted)',fontSize:14}}>✕</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:2}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{fontSize:12,fontWeight:tab===t.id?600:400,padding:'6px 12px',borderRadius:7,border:'none',background:tab===t.id?'var(--accent-dim)':'transparent',color:tab===t.id?'var(--accent-text)':'var(--muted)',cursor:'pointer',transition:'all 0.15s'}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{flex:1,overflowY:'auto',padding:'18px 20px',display:'flex',flexDirection:'column',gap:16}}>

          {/* ── TAB PERFIL ── */}
          {tab==='perfil' && (<>
            {(aluno.churn_cor==='vermelho'||aluno.churn_cor==='roxo')&&(
              <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:9,padding:'12px 14px'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#991b1b',marginBottom:4}}>Ação recomendada</div>
                <div style={{fontSize:12,color:'#7f1d1d',lineHeight:1.6}}>
                  {aluno.churn_cor==='roxo'?'Matheus deve elaborar plano estratégico. Follow-up em 14 dias.':`${aluno.consultor_nome} deve agendar reunião de resgate. Follow-up em 14 dias.`}
                </div>
              </div>
            )}

            {/* Score */}
            <div style={psec}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Score antichurn</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:8}}>
                <span style={{fontSize:28,fontWeight:700,color:c.text,fontFamily:'var(--mono)'}}>{aluno.churn_score!=null?Math.round(aluno.churn_score):0}%</span>
                <span style={{fontSize:12,color:'var(--muted)',fontWeight:500}}>{c.label}</span>
              </div>
              <div style={{height:6,borderRadius:3,background:'var(--surface2)',overflow:'hidden',border:'1px solid var(--border)'}}>
                <div style={{height:'100%',borderRadius:3,width:`${aluno.churn_score||0}%`,background:c.dot}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:12}}>
                {[
                  {l:'U2A · perdeu 2 últimas aulas',v:aluno.u2a,p:'25%'},
                  {l:'P3A · perdeu 3+ aulas',v:aluno.p3a,p:'25%'},
                  {l:'Leads não preenchido',v:!aluno.leads_preenchido,p:'15%'},
                  {l:'Financeiro não preenchido',v:!aluno.financeiro_preenchido,p:'15%'},
                  {l:'Sem resposta aos fups',v:aluno.sem_resposta,p:'20%',full:true},
                ].map((cr,i)=>(
                  <div key={i} style={{padding:'9px 11px',borderRadius:8,background:cr.v?'#fef2f2':'#f0fdf4',border:`1px solid ${cr.v?'#fca5a5':'#86efac'}`,gridColumn:cr.full?'1/-1':undefined}}>
                    <div style={{fontSize:10,color:'var(--muted)',marginBottom:3,lineHeight:1.3}}>{cr.l}</div>
                    <div style={{fontSize:12,fontWeight:700,fontFamily:'var(--mono)',color:cr.v?'#dc2626':'#16a34a'}}>{cr.v?'Sim':'Não'}</div>
                    <div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>Peso {cr.p}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edição ou visualização de dados */}
            <div style={psec}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12,fontFamily:'var(--mono)'}}>Informações</div>
              {editMode ? (
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <Input label="Nome" value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))} required/>
                    <Input label="WhatsApp" value={form.whatsapp} onChange={v=>setForm(f=>({...f,whatsapp:v}))}/>
                    <Input label="Especialidade" value={form.especialidade} onChange={v=>setForm(f=>({...f,especialidade:v}))}/>
                    <Input label="Cidade" value={form.cidade} onChange={v=>setForm(f=>({...f,cidade:v}))}/>
                  </div>
                  <Select label="Consultor responsável" value={form.consultor_id} onChange={v=>setForm(f=>({...f,consultor_id:v}))} required
                    options={consultores.map(c=>({value:c.id,label:c.nome}))}/>
                  <Select label="Turma" value={form.turma_id} onChange={v=>setForm(f=>({...f,turma_id:v}))} required
                    options={turmas.map(t=>({value:t.id,label:t.nome}))}/>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <input type="checkbox" id="ativo" checked={form.ativo} onChange={e=>setForm(f=>({...f,ativo:e.target.checked}))} style={{width:15,height:15}}/>
                    <label htmlFor="ativo" style={{fontSize:13,color:'var(--text2)',fontWeight:500}}>Aluno ativo</label>
                  </div>
                  <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4}}>
                    <Btn onClick={()=>setEditMode(false)} variant='ghost'>Cancelar</Btn>
                    <Btn onClick={salvarEdicao} variant='primary' disabled={saving}>{saving?'Salvando...':'Salvar alterações'}</Btn>
                  </div>
                </div>
              ) : (
                <table style={{width:'100%',fontSize:13,borderCollapse:'collapse'}}>
                  <tbody>
                    {[
                      ['Especialidade',aluno.especialidade],
                      ['Clínica',aluno.clinica],
                      ['Cidade',aluno.cidade],
                      ['WhatsApp',aluno.whatsapp,'var(--accent-text)'],
                      ['Início',fd(aluno.data_entrada)],
                      ['Término previsto',fd(aluno.data_fim_prevista)],
                      ['Consultor',aluno.consultor_nome],
                      ['Turma',aluno.turma_nome],
                      ['Status',aluno.ativo?'Ativo':'Inativo',aluno.ativo?'#15803d':'#dc2626'],
                    ].map(([k,v,color])=>(
                      <tr key={k}>
                        <td style={{padding:'7px 0',color:'var(--muted)',borderBottom:'1px solid var(--border)',width:'45%'}}>{k}</td>
                        <td style={{padding:'7px 0',fontWeight:600,textAlign:'right',borderBottom:'1px solid var(--border)',color:color||'var(--text)'}}>{v||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Histórico churn */}
            {historico.length>0&&(
              <div style={psec}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Histórico de status</div>
                <div style={{paddingLeft:16,position:'relative'}}>
                  <div style={{position:'absolute',left:4,top:4,bottom:4,width:1.5,background:'var(--border)'}}/>
                  {historico.map(h=>{
                    const hc=cs(h.cor_nova)
                    return (
                      <div key={h.id} style={{position:'relative',marginBottom:12}}>
                        <div style={{position:'absolute',left:-14,top:4,width:8,height:8,borderRadius:'50%',background:hc.dot,border:`2px solid ${hc.border}`}}/>
                        <div style={{fontSize:10,color:'var(--muted)',fontFamily:'var(--mono)',marginBottom:2}}>{fd(h.criado_em?.split('T')[0])}</div>
                        <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.4}}>
                          <strong style={{color:hc.text}}>{hc.label}</strong> · score {Math.round(h.score_novo)}%
                          {h.cor_anterior&&<span style={{color:'var(--muted)'}}> (era {cs(h.cor_anterior).label})</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>)}

          {/* ── TAB PRESENÇA ── */}
          {tab==='presenca' && (
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12,fontFamily:'var(--mono)'}}>Aulas da turma</div>
              {turmaAulas.length===0 ? (
                <div style={{textAlign:'center',padding:'30px 0',color:'var(--muted)',fontSize:13}}>Sem aulas cadastradas</div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {turmaAulas.map(au=>{
                    const v = presMap[au.id]
                    return (
                      <div key={au.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 13px',background:'var(--surface2)',borderRadius:9,border:'1px solid var(--border)'}}>
                        <div style={{
                          width:30,height:30,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:11,fontWeight:700,fontFamily:'var(--mono)',flexShrink:0,
                          background:v===true?'#dcfce7':v===false?'#fee2e2':'var(--bg)',
                          color:v===true?'#14532d':v===false?'#7f1d1d':'var(--muted)',
                          border:`1.5px solid ${v===true?'#86efac':v===false?'#fca5a5':'var(--border2)'}`,
                        }}>{au.numero}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{au.tema}</div>
                          <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>{fd(au.data_aula)}</div>
                        </div>
                        <span style={{
                          fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,
                          background:v===true?'#dcfce7':v===false?'#fee2e2':'var(--surface2)',
                          color:v===true?'#14532d':v===false?'#7f1d1d':'var(--muted)',
                          border:`1px solid ${v===true?'#86efac':v===false?'#fca5a5':'var(--border)'}`,
                        }}>
                          {v===true?'Presente':v===false?'Faltou':'—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB REUNIÕES ── */}
          {tab==='reunioes' && (<>
            {/* Registrar nova reunião */}
            <div style={{background:'var(--accent-dim)',border:'1px solid #bfdbfe',borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--accent-text)',marginBottom:12}}>Registrar reunião</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <Input label="Data" type="date" value={novaReuniao.data_reuniao} onChange={v=>setNovaReuniao(r=>({...r,data_reuniao:v}))} required/>
                  <Select label="Consultor" value={novaReuniao.consultor_id} onChange={v=>setNovaReuniao(r=>({...r,consultor_id:v}))}
                    options={consultores.map(c=>({value:c.id,label:c.nome}))}/>
                </div>
                <Textarea label="Resumo da reunião" value={novaReuniao.resumo} onChange={v=>setNovaReuniao(r=>({...r,resumo:v}))} rows={4} placeholder="O que foi discutido, decisões tomadas, próximos passos..."/>
                <div style={{display:'flex',justifyContent:'flex-end'}}>
                  <Btn onClick={salvarReuniao} variant='primary' disabled={savingReuniao||!novaReuniao.data_reuniao||!novaReuniao.resumo.trim()}>
                    {savingReuniao?'Salvando...':'Salvar reunião'}
                  </Btn>
                </div>
              </div>
            </div>

            {/* Lista de reuniões */}
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Histórico ({reunioes.length})</div>
              {reunioes.length===0 ? (
                <div style={{textAlign:'center',padding:'24px 0',color:'var(--muted)',fontSize:13}}>Nenhuma reunião registrada</div>
              ) : reunioes.map(r=>(
                <div key={r.id} style={{padding:'12px 14px',background:'var(--surface2)',borderRadius:9,marginBottom:8,border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <span style={{fontSize:12,fontFamily:'var(--mono)',fontWeight:500,color:'var(--text2)'}}>{fd(r.data_reuniao)}</span>
                    {r.consultores?.nome&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'var(--accent-dim)',color:'var(--accent-text)',fontWeight:600}}>{r.consultores.nome}</span>}
                  </div>
                  <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>{r.resumo||<em style={{color:'var(--muted)'}}>Sem resumo</em>}</div>
                </div>
              ))}
            </div>
          </>)}

          {/* ── TAB NOTAS ── */}
          {tab==='notas' && (<>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <Textarea label="Nova nota interna" value={novaNota} onChange={setNovaNota} rows={3} placeholder="Observações, contexto, próximos passos..."/>
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <Btn onClick={salvarNota} variant='primary' disabled={savingNota||!novaNota.trim()}>
                  {savingNota?'Salvando...':'Adicionar nota'}
                </Btn>
              </div>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Notas ({notas.length})</div>
              {notas.length===0 ? (
                <div style={{textAlign:'center',padding:'24px 0',color:'var(--muted)',fontSize:13}}>Nenhuma nota</div>
              ) : notas.map(n=>(
                <div key={n.id} style={{padding:'11px 13px',background:'var(--surface2)',borderRadius:9,marginBottom:8,border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <span style={{fontSize:11,fontFamily:'var(--mono)',fontWeight:500,color:'var(--muted)'}}>{fd(n.created_at?.split('T')[0])}</span>
                    {n.consultores?.nome&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'var(--accent-dim)',color:'var(--accent-text)',fontWeight:600}}>{n.consultores.nome}</span>}
                  </div>
                  <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>{n.conteudo}</div>
                </div>
              ))}
            </div>
          </>)}

        </div>
      </div>
    </div>
  )
}

// ─── Modal de novo aluno ───────────────────────────────────────────

function NovoAlunoModal({ consultores, turmas, onClose, onSaved }) {
  const [form, setForm] = useState({
    nome:'', email:'', whatsapp:'', especialidade:'', clinica:'', cidade:'',
    consultor_id:'', turma_id:'', data_entrada: new Date().toISOString().split('T')[0],
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar() {
    if (!form.nome.trim()||!form.consultor_id||!form.turma_id||!form.data_entrada) {
      setErro('Preencha nome, consultor, turma e data de entrada.')
      return
    }
    setSaving(true)
    setErro('')
    const dataFim = new Date(form.data_entrada)
    dataFim.setFullYear(dataFim.getFullYear()+1)
    const { error } = await supabase.from('alunos').insert({
      nome: form.nome.trim(), email: form.email.trim()||null,
      whatsapp: form.whatsapp.trim()||null, especialidade: form.especialidade.trim()||null,
      clinica: form.clinica.trim()||null, cidade: form.cidade.trim()||null,
      consultor_id: form.consultor_id, turma_id: form.turma_id,
      data_entrada: form.data_entrada, data_fim_prevista: dataFim.toISOString().split('T')[0],
      ativo: true,
    })
    setSaving(false)
    if (error) { setErro('Erro ao cadastrar: '+error.message); return }
    onSaved()
  }

  return (
    <Modal title="Novo aluno" onClose={onClose} width={560}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{gridColumn:'1/-1'}}><Input label="Nome completo" value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))} placeholder="Dr(a). Nome Sobrenome" required/></div>
        <Input label="Especialidade" value={form.especialidade} onChange={v=>setForm(f=>({...f,especialidade:v}))} placeholder="Cardiologia"/>
        <Input label="Cidade" value={form.cidade} onChange={v=>setForm(f=>({...f,cidade:v}))} placeholder="São Paulo"/>
        <Input label="WhatsApp" value={form.whatsapp} onChange={v=>setForm(f=>({...f,whatsapp:v}))} placeholder="+55 11 99999-9999"/>
        <Input label="E-mail" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/>
        <Input label="Clínica" value={form.clinica} onChange={v=>setForm(f=>({...f,clinica:v}))} placeholder="Nome da clínica"/>
        <Input label="Data de entrada" value={form.data_entrada} onChange={v=>setForm(f=>({...f,data_entrada:v}))} type="date" required/>
        <div style={{gridColumn:'1/-1'}}>
          <Select label="Consultor responsável" value={form.consultor_id} onChange={v=>setForm(f=>({...f,consultor_id:v}))} required
            options={consultores.map(c=>({value:c.id,label:c.nome}))}/>
        </div>
        <div style={{gridColumn:'1/-1'}}>
          <Select label="Turma" value={form.turma_id} onChange={v=>setForm(f=>({...f,turma_id:v}))} required
            options={turmas.map(t=>({value:t.id,label:t.nome}))}/>
        </div>
      </div>
      {erro && <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,padding:'10px 12px',fontSize:12,color:'#7f1d1d'}}>{erro}</div>}
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4,borderTop:'1px solid var(--border)'}}>
        <Btn onClick={onClose} variant='ghost'>Cancelar</Btn>
        <Btn onClick={salvar} variant='primary' disabled={saving}>{saving?'Cadastrando...':'Cadastrar aluno'}</Btn>
      </div>
    </Modal>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────

function Dashboard({ alunos, turmas, filterTurma, setFilterTurma, filterChurn, setFilterChurn, search, setSearch, onSelectAluno }) {
  const filtered = alunos.filter(a=>{
    if (filterTurma && a.turma_id!==filterTurma) return false
    if (filterChurn && a.churn_cor!==filterChurn) return false
    if (search && !a.nome.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const counts = {verde:0,laranja:0,vermelho:0,roxo:0}
  alunos.forEach(a=>{if(a.churn_cor&&counts[a.churn_cor]!==undefined)counts[a.churn_cor]++})
  const selStyle={fontSize:12,padding:'6px 10px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none',cursor:'pointer',fontWeight:500}

  return (
    <>
      <div style={{padding:'13px 22px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>Dashboard</div>
          <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{alunos.filter(a=>a.ativo).length} alunos ativos · {turmas.length} turma{turmas.length!==1?'s':''}</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <select value={filterTurma} onChange={e=>setFilterTurma(e.target.value)} style={selStyle}>
            <option value="">Todas as turmas</option>
            {turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <select value={filterChurn} onChange={e=>setFilterChurn(e.target.value)} style={selStyle}>
            <option value="">Todos os status</option>
            {['verde','laranja','vermelho','roxo'].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
          {[{label:'Total',val:alunos.filter(a=>a.ativo).length,color:'var(--text)'},{label:'Verde',val:counts.verde,color:'#15803d'},{label:'Laranja',val:counts.laranja,color:'#c2410c'},{label:'Vermelho',val:counts.vermelho,color:'#dc2626'},{label:'Roxo',val:counts.roxo,color:'#7c3aed'}].map(m=>(
            <div key={m.label} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 16px'}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:5,fontWeight:500,textTransform:'uppercase',letterSpacing:'0.04em'}}>{m.label}</div>
              <div style={{fontSize:24,fontWeight:700,color:m.color}}>{m.val}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
          {[{id:'',label:'Todas'},...turmas.map(t=>({id:t.id,label:`${t.nome} (${alunos.filter(a=>a.turma_id===t.id).length})`}))].map(t=>(
            <button key={t.id} onClick={()=>setFilterTurma(t.id)} style={{fontSize:12,fontWeight:500,padding:'5px 14px',borderRadius:20,border:`1.5px solid ${filterTurma===t.id?'var(--accent)':'var(--border2)'}`,background:filterTurma===t.id?'var(--accent)':'var(--surface)',color:filterTurma===t.id?'#fff':'var(--text2)',cursor:'pointer'}}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{marginBottom:16}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar aluno..."
            style={{fontSize:13,padding:'7px 12px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:8,color:'var(--text)',outline:'none',width:220}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(235px,1fr))',gap:10}}>
          {filtered.map(a=>(
            <div key={a.id} onClick={()=>onSelectAluno(a.id)}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=cs(a.churn_cor).border;e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none'}}
              style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:14,cursor:'pointer',transition:'all 0.18s',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:cs(a.churn_cor).dot,borderRadius:'12px 12px 0 0'}}/>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,background:cs(a.churn_cor).bg,color:cs(a.churn_cor).text,border:`1.5px solid ${cs(a.churn_cor).border}`}}>{ini(a.nome)}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1.3}}>{a.nome}</div>
                  <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{a.turma_nome} · {a.consultor_nome}</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <Badge cor={a.churn_cor}/>
                {a.churn_score!=null&&<span style={{fontSize:11,color:'var(--muted)',fontFamily:'var(--mono)',fontWeight:500}}>{Math.round(a.churn_score)}%</span>}
                {!a.ativo&&<span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,background:'#f1f5f9',color:'#64748b',border:'1px solid #cbd5e1'}}>Inativo</span>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:10,paddingTop:10,borderTop:'1px solid var(--border)'}}>
                {[{label:'Aulas',val:`${a.aulas_presentes??0}/${a.total_aulas_realizadas??0}`},{label:'Reuniões',val:a.total_reunioes??0},{label:'Leads',val:a.leads_preenchido?'Sim':'Não',ok:a.leads_preenchido},{label:'Financeiro',val:a.financeiro_preenchido?'Sim':'Não',ok:a.financeiro_preenchido}].map(st=>(
                  <div key={st.label} style={{fontSize:11,color:'var(--muted)'}}>
                    <strong style={{display:'block',fontSize:12,fontWeight:600,color:st.ok===false?'#dc2626':st.ok===true?'#15803d':'var(--text2)',fontFamily:'var(--mono)'}}>{st.val}</strong>
                    {st.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Módulo Alunos ─────────────────────────────────────────────────

function AlunosModule({ alunos, turmas, consultores, onSelectAluno, onNovoAluno }) {
  const [view, setView] = useState('cards')
  const [search, setSearch] = useState('')
  const [filterTurma, setFilterTurma] = useState('')
  const [filterStatus, setFilterStatus] = useState('ativos')

  const filtered = alunos.filter(a=>{
    if (filterStatus==='ativos' && !a.ativo) return false
    if (filterStatus==='inativos' && a.ativo) return false
    if (filterTurma && a.turma_id!==filterTurma) return false
    if (search && !a.nome.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const selStyle={fontSize:12,padding:'6px 10px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none',cursor:'pointer',fontWeight:500}

  return (
    <>
      <div style={{padding:'13px 22px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>Alunos</div>
          <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{filtered.length} alunos exibidos</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..."
            style={{fontSize:12,padding:'6px 10px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none',width:160}}/>
          <select value={filterTurma} onChange={e=>setFilterTurma(e.target.value)} style={selStyle}>
            <option value="">Todas as turmas</option>
            {turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={selStyle}>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
            <option value="todos">Todos</option>
          </select>
          {/* Toggle view */}
          <div style={{display:'flex',border:'1.5px solid var(--border2)',borderRadius:8,overflow:'hidden'}}>
            {[{id:'cards',icon:'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z'},{id:'lista',icon:'M4 6h16M4 12h16M4 18h16'}].map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)} style={{padding:'6px 10px',border:'none',background:view===v.id?'var(--accent)':'var(--surface)',cursor:'pointer',transition:'all 0.15s'}}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={view===v.id?'#fff':'var(--muted)'} strokeWidth="2"><path d={v.icon}/></svg>
              </button>
            ))}
          </div>
          <Btn onClick={onNovoAluno} variant='primary' style={{fontSize:12,padding:'6px 14px'}}>+ Novo aluno</Btn>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
        {filtered.length===0 ? (
          <div style={{textAlign:'center',padding:40,color:'var(--muted)',fontSize:13}}>Nenhum aluno encontrado</div>
        ) : view==='cards' ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(235px,1fr))',gap:10}}>
            {filtered.map(a=>(
              <div key={a.id} onClick={()=>onSelectAluno(a.id)}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=cs(a.churn_cor).border;e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none'}}
                style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:14,cursor:'pointer',transition:'all 0.18s',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:cs(a.churn_cor).dot,borderRadius:'12px 12px 0 0'}}/>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,background:cs(a.churn_cor).bg,color:cs(a.churn_cor).text,border:`1.5px solid ${cs(a.churn_cor).border}`}}>{ini(a.nome)}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1.3}}>{a.nome}</div>
                    <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{a.turma_nome} · {a.consultor_nome}</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <Badge cor={a.churn_cor}/>
                  {!a.ativo&&<span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,background:'#f1f5f9',color:'#64748b',border:'1px solid #cbd5e1'}}>Inativo</span>}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:10,paddingTop:10,borderTop:'1px solid var(--border)'}}>
                  {[{label:'Especialidade',val:a.especialidade||'—'},{label:'Cidade',val:a.cidade||'—'},{label:'Reuniões',val:a.total_reunioes??0},{label:'Aulas',val:`${a.aulas_presentes??0}/${a.total_aulas_realizadas??0}`}].map(st=>(
                    <div key={st.label} style={{fontSize:11,color:'var(--muted)'}}>
                      <strong style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',fontFamily:'var(--mono)'}}>{st.val}</strong>
                      {st.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Visão lista/tabela */
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr style={{background:'var(--surface2)',borderBottom:'1px solid var(--border)'}}>
                  {['Aluno','Especialidade','Turma','Consultor','Status','Reuniões','Aulas'].map(h=>(
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a,i)=>(
                  <tr key={a.id} onClick={()=>onSelectAluno(a.id)}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    style={{borderBottom:'1px solid var(--border)',cursor:'pointer',transition:'background 0.1s'}}>
                    <td style={{padding:'11px 14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:9}}>
                        <div style={{width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,background:cs(a.churn_cor).bg,color:cs(a.churn_cor).text,border:`1px solid ${cs(a.churn_cor).border}`}}>{ini(a.nome)}</div>
                        <div>
                          <div style={{fontWeight:600,color:'var(--text)'}}>{a.nome}</div>
                          <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>{a.cidade||'—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'11px 14px',color:'var(--text2)'}}>{a.especialidade||'—'}</td>
                    <td style={{padding:'11px 14px',color:'var(--text2)'}}>{a.turma_nome}</td>
                    <td style={{padding:'11px 14px',color:'var(--text2)'}}>{a.consultor_nome}</td>
                    <td style={{padding:'11px 14px'}}><Badge cor={a.churn_cor}/></td>
                    <td style={{padding:'11px 14px',color:'var(--text2)',fontFamily:'var(--mono)',fontWeight:500}}>{a.total_reunioes??0}</td>
                    <td style={{padding:'11px 14px',color:'var(--text2)',fontFamily:'var(--mono)',fontWeight:500}}>{a.aulas_presentes??0}/{a.total_aulas_realizadas??0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

// ─── App principal ─────────────────────────────────────────────────

export default function App() {
  const [alunos,setAlunos] = useState([])
  const [turmas,setTurmas] = useState([])
  const [consultores,setConsultores] = useState([])
  const [aulas,setAulas] = useState([])
  const [reunioes,setReunioes] = useState([])
  const [tarefas,setTarefas] = useState([])
  const [presencas,setPresencas] = useState([])
  const [notas,setNotas] = useState([])
  const [historico,setHistorico] = useState([])
  const [loading,setLoading] = useState(true)
  const [activeNav,setActiveNav] = useState('dashboard')
  const [selected,setSelected] = useState(null)
  const [showNovoAluno,setShowNovoAluno] = useState(false)

  // filtros dashboard
  const [filterTurma,setFilterTurma] = useState('')
  const [filterChurn,setFilterChurn] = useState('')
  const [search,setSearch] = useState('')

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [a,t,c,au,r,ta,p,n,h] = await Promise.all([
      supabase.from('view_alunos_dashboard').select('*'),
      supabase.from('turmas').select('*'),
      supabase.from('consultores').select('*').order('nome'),
      supabase.from('aulas').select('*').order('numero'),
      supabase.from('reunioes').select('*,consultores(nome)').order('data_reuniao',{ascending:false}),
      supabase.from('tarefas').select('*,consultores(nome)').order('created_at',{ascending:false}),
      supabase.from('presencas').select('*,aulas(numero,tema,data_aula,status)'),
      supabase.from('notas_internas').select('*,consultores(nome)').order('created_at',{ascending:false}),
      supabase.from('churn_historico').select('*').order('criado_em',{ascending:false}),
    ])
    setAlunos(a.data||[]); setTurmas(t.data||[]); setConsultores(c.data||[])
    setAulas(au.data||[]); setReunioes(r.data||[]); setTarefas(ta.data||[])
    setPresencas(p.data||[]); setNotas(n.data||[]); setHistorico(h.data||[])
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const selectedAluno = selected ? alunos.find(a=>a.id===selected) : null

  const navItems = [
    {id:'dashboard', label:'Dashboard', icon:'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z'},
    {id:'alunos',    label:'Alunos',    icon:'M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z'},
    {id:'calendario',label:'Calendário',icon:'M3 4h18v17H3zM16 2v4M8 2v4M3 10h18'},
    {id:'tarefas',   label:'Tarefas',   icon:'M9 11l3 3 8-8M5 12l2 2 4-4'},
  ]

  return (
    <>
      <style>{G}</style>
      <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>

        {/* Sidebar */}
        <div style={{width:210,minWidth:210,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'18px 16px 14px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)',letterSpacing:'-0.01em'}}>MBA Exponencial</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>Gestão de turmas</div>
          </div>
          <nav style={{padding:'10px 8px',flex:1}}>
            {navItems.map(n=><NavItem key={n.id} {...n} active={activeNav===n.id} onClick={()=>setActiveNav(n.id)}/>)}
          </nav>
        </div>

        {/* Conteúdo principal */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {loading ? (
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)',fontSize:13}}>Carregando dados...</div>
          ) : activeNav==='dashboard' ? (
            <Dashboard
              alunos={alunos} turmas={turmas}
              filterTurma={filterTurma} setFilterTurma={setFilterTurma}
              filterChurn={filterChurn} setFilterChurn={setFilterChurn}
              search={search} setSearch={setSearch}
              onSelectAluno={id=>{setSelected(id);setActiveNav('dashboard')}}
            />
          ) : activeNav==='alunos' ? (
            <AlunosModule
              alunos={alunos} turmas={turmas} consultores={consultores}
              onSelectAluno={id=>setSelected(id)}
              onNovoAluno={()=>setShowNovoAluno(true)}
            />
          ) : (
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)',fontSize:13}}>Em construção</div>
          )}
        </div>

        {/* Painel lateral de aluno */}
        {selectedAluno && (
          <StudentPanel
            aluno={selectedAluno}
            aulas={aulas}
            reunioes={reunioes.filter(r=>r.aluno_id===selectedAluno.id)}
            tarefas={tarefas.filter(t=>t.aluno_id===selectedAluno.id)}
            presencas={presencas}
            notas={notas.filter(n=>n.aluno_id===selectedAluno.id)}
            historico={historico.filter(h=>h.aluno_id===selectedAluno.id)}
            consultores={consultores}
            turmas={turmas}
            onClose={()=>setSelected(null)}
            onUpdate={loadAll}
          />
        )}

        {/* Modal novo aluno */}
        {showNovoAluno && (
          <NovoAlunoModal
            consultores={consultores}
            turmas={turmas}
            onClose={()=>setShowNovoAluno(false)}
            onSaved={()=>{ setShowNovoAluno(false); loadAll() }}
          />
        )}

      </div>
    </>
  )
}
