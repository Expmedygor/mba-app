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

const STATUS_ALUNO = {
  ativo:    { bg:'#dcfce7', text:'#14532d', border:'#86efac', label:'Ativo' },
  pausado:  { bg:'#fef9c3', text:'#713f12', border:'#fde68a', label:'Pausado' },
  churn:    { bg:'#fee2e2', text:'#7f1d1d', border:'#fca5a5', label:'Churn' },
  inativo:  { bg:'#f1f5f9', text:'#475569', border:'#cbd5e1', label:'Inativo' },
}

const PRESENCA_STATUS = {
  presente: { bg:'#dcfce7', text:'#14532d', border:'#86efac', label:'Presente' },
  faltou:   { bg:'#fee2e2', text:'#7f1d1d', border:'#fca5a5', label:'Faltou' },
  reset:    { bg:'#ede9fe', text:'#2e1065', border:'#c4b5fd', label:'Reset' },
  link:     { bg:'#fff7ed', text:'#7c2d12', border:'#fdba74', label:'Link' },
  churn:    { bg:'#f1f5f9', text:'#475569', border:'#cbd5e1', label:'Churn' },
}

const TIPOS_REUNIAO = [
  { value:'onboarding',        label:'Onboarding' },
  { value:'1:1-0',             label:'1:1 - 0' },
  { value:'1:1-1',             label:'1:1 - 1' },
  { value:'1:1-2',             label:'1:1 - 2' },
  { value:'1:1-3',             label:'1:1 - 3' },
  { value:'1:1-4',             label:'1:1 - 4' },
  { value:'1:1-5',             label:'1:1 - 5' },
  { value:'reuniao-planilhas', label:'Reunião de planilhas' },
  { value:'fora-de-escopo',    label:'Fora de escopo' },
  { value:'outros',            label:'Outros' },
]

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

function StatusBadge({ status }) {
  const s = STATUS_ALUNO[status] || STATUS_ALUNO.inativo
  return (
    <span style={{display:'inline-flex',alignItems:'center',fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,fontFamily:'var(--mono)',background:s.bg,color:s.text,border:`1px solid ${s.border}`}}>
      {s.label}
    </span>
  )
}

function Btn({ children, onClick, variant='default', disabled, style={} }) {
  const base={fontSize:13,fontWeight:500,padding:'7px 14px',borderRadius:8,cursor:disabled?'not-allowed':'pointer',transition:'all 0.15s',border:'none',opacity:disabled?0.6:1,...style}
  const variants={
    default:{background:'var(--surface)',border:'1.5px solid var(--border2)',color:'var(--text2)'},
    primary:{background:'var(--accent)',color:'#fff'},
    danger:{background:'#fee2e2',color:'#7f1d1d',border:'1px solid #fca5a5'},
    ghost:{background:'transparent',color:'var(--muted)',border:'1px solid var(--border)'},
    warning:{background:'#fef9c3',color:'#713f12',border:'1px solid #fde68a'},
  }
  return <button onClick={onClick} disabled={disabled} style={{...base,...variants[variant]}}>{children}</button>
}

function Input({ label, value, onChange, type='text', placeholder, required }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label&&<label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}{required&&<span style={{color:'#dc2626'}}> *</span>}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{fontSize:13,padding:'8px 11px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:8,color:'var(--text)',outline:'none',width:'100%'}}/>
    </div>
  )
}

function SelectField({ label, value, onChange, options, required }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label&&<label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}{required&&<span style={{color:'#dc2626'}}> *</span>}</label>}
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
      {label&&<label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}</label>}
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

function NavItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:7,fontSize:13,fontWeight:active?500:400,color:active?'var(--accent-text)':'var(--muted)',background:active?'var(--accent-dim)':'transparent',cursor:'pointer',marginBottom:1,transition:'all 0.15s'}}>
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{flexShrink:0}}><path d={icon}/></svg>
      {label}
    </div>
  )
}

// ─── Painel lateral do aluno ─────────────────────────────────────────

function StudentPanel({ aluno, aulas, reunioes, tarefas, presencas, notas, historico, contatos, consultores, turmas, onClose, onUpdate }) {
  const [tab, setTab] = useState('perfil')
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    nome:aluno.nome||'', whatsapp:aluno.whatsapp||'', cidade:aluno.cidade||'',
    especialidade:aluno.especialidade||'', clinica:aluno.clinica||'',
    consultor_id:aluno.consultor_id||'', turma_id:aluno.turma_id||'',
    status:aluno.status_aluno||'ativo',
    url_planilha_financeiro:aluno.url_planilha_financeiro||'',
    url_planilha_leads:aluno.url_planilha_leads||'',
  })
  const [saving, setSaving] = useState(false)

  const [novaReuniao, setNovaReuniao] = useState({data_reuniao:'',resumo:'',consultor_id:aluno.consultor_id||'',tipo:'onboarding'})
  const [savingReuniao, setSavingReuniao] = useState(false)

  const [novoContato, setNovoContato] = useState({data_contato:new Date().toISOString().split('T')[0],descricao:'',consultor_id:aluno.consultor_id||'',churn_status_na_epoca:aluno.churn_cor||'',data_fup:''})
  const [savingContato, setSavingContato] = useState(false)

  const [novaNota, setNovaNota] = useState('')
  const [savingNota, setSavingNota] = useState(false)

  const c = cs(aluno.churn_cor)
  const turmaAulas = aulas.filter(a=>a.turma_id===aluno.turma_id).sort((a,b)=>a.numero-b.numero)
  const presMap = {}
  presencas.filter(p=>p.aluno_id===aluno.id).forEach(p=>{ presMap[p.aula_id]=p.status })
  const psec = {borderTop:'1px solid var(--border)',paddingTop:16,marginTop:4}
  const tipoLabel = v => TIPOS_REUNIAO.find(t=>t.value===v)?.label || v

  async function salvarEdicao() {
    setSaving(true)
    await supabase.from('alunos').update({
      nome:form.nome, whatsapp:form.whatsapp, cidade:form.cidade,
      especialidade:form.especialidade, clinica:form.clinica,
      consultor_id:form.consultor_id, turma_id:form.turma_id,
      status:form.status,
      url_planilha_financeiro:form.url_planilha_financeiro||null,
      url_planilha_leads:form.url_planilha_leads||null,
    }).eq('id',aluno.id)
    setSaving(false); setEditMode(false); onUpdate()
  }

  async function salvarReuniao() {
    if (!novaReuniao.data_reuniao||!novaReuniao.resumo.trim()||!novaReuniao.tipo) return
    setSavingReuniao(true)
    await supabase.from('reunioes').insert({
      aluno_id:aluno.id, consultor_id:novaReuniao.consultor_id||aluno.consultor_id,
      data_reuniao:novaReuniao.data_reuniao, resumo:novaReuniao.resumo.trim(), tipo:novaReuniao.tipo,
    })
    setNovaReuniao({data_reuniao:'',resumo:'',consultor_id:aluno.consultor_id||'',tipo:'onboarding'})
    setSavingReuniao(false); onUpdate()
  }

  async function salvarContato() {
    if (!novoContato.data_contato||!novoContato.descricao.trim()) return
    setSavingContato(true)
    await supabase.from('contatos_cs').insert({
      aluno_id:aluno.id,
      consultor_id:novoContato.consultor_id||aluno.consultor_id||null,
      data_contato:novoContato.data_contato,
      churn_status_na_epoca:novoContato.churn_status_na_epoca||null,
      descricao:novoContato.descricao.trim(),
      data_fup:novoContato.data_fup||null,
    })
    setNovoContato({data_contato:new Date().toISOString().split('T')[0],descricao:'',consultor_id:aluno.consultor_id||'',churn_status_na_epoca:aluno.churn_cor||'',data_fup:''})
    setSavingContato(false); onUpdate()
  }

  async function salvarNota() {
    if (!novaNota.trim()) return
    setSavingNota(true)
    await supabase.from('notas_internas').insert({aluno_id:aluno.id,conteudo:novaNota.trim()})
    setNovaNota(''); setSavingNota(false); onUpdate()
  }

  const tabs = [
    {id:'perfil',label:'Perfil'},
    {id:'encontros',label:'Encontros'},
    {id:'reunioes',label:`Reuniões (${reunioes.length})`},
    {id:'cs',label:`Log CS (${contatos.length})`},
    {id:'notas',label:'Notas'},
  ]

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',zIndex:50,display:'flex',alignItems:'flex-start',justifyContent:'flex-end'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:500,height:'100vh',background:'var(--surface)',borderLeft:'1px solid var(--border)',overflowY:'auto',display:'flex',flexDirection:'column',animation:'slideIn 0.2s ease'}}>

        {/* Header */}
        <div style={{padding:'18px 20px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
            <div>
              <div style={{fontSize:17,fontWeight:700,color:'var(--text)'}}>{aluno.nome}</div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>{aluno.turma_nome} · {aluno.consultor_nome} · {aluno.especialidade||'—'}</div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8,flexWrap:'wrap'}}>
                <Badge cor={aluno.churn_cor}/>
                <StatusBadge status={aluno.status_aluno}/>
                {aluno.proximo_fup&&(
                  <span style={{fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,background:'#fff7ed',color:'#7c2d12',border:'1px solid #fdba74'}}>
                    FUP {fd(aluno.proximo_fup)}
                  </span>
                )}
              </div>
            </div>
            <div style={{display:'flex',gap:6,flexShrink:0}}>
              <Btn onClick={()=>setEditMode(!editMode)} variant={editMode?'primary':'default'} style={{fontSize:12,padding:'5px 12px'}}>
                {editMode?'Cancelar':'Editar'}
              </Btn>
              <button onClick={onClose} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--muted)',fontSize:14}}>✕</button>
            </div>
          </div>
          <div style={{display:'flex',gap:2,flexWrap:'wrap'}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{fontSize:12,fontWeight:tab===t.id?600:400,padding:'6px 12px',borderRadius:7,border:'none',background:tab===t.id?'var(--accent-dim)':'transparent',color:tab===t.id?'var(--accent-text)':'var(--muted)',cursor:'pointer',transition:'all 0.15s'}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'18px 20px',display:'flex',flexDirection:'column',gap:16}}>

          {/* ── TAB PERFIL ── */}
          {tab==='perfil'&&(<>
            {(aluno.churn_cor==='vermelho'||aluno.churn_cor==='roxo')&&(
              <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:9,padding:'12px 14px'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#991b1b',marginBottom:4}}>Ação recomendada</div>
                <div style={{fontSize:12,color:'#7f1d1d',lineHeight:1.6}}>
                  {aluno.churn_cor==='roxo'?'Matheus deve elaborar plano estratégico. Follow-up em 14 dias.':`${aluno.consultor_nome} deve agendar reunião de resgate. Follow-up em 14 dias.`}
                </div>
              </div>
            )}

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

            <div style={psec}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12,fontFamily:'var(--mono)'}}>Informações</div>
              {editMode?(
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <Input label="Nome" value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))} required/>
                    <Input label="WhatsApp" value={form.whatsapp} onChange={v=>setForm(f=>({...f,whatsapp:v}))}/>
                    <Input label="Especialidade" value={form.especialidade} onChange={v=>setForm(f=>({...f,especialidade:v}))}/>
                    <Input label="Cidade" value={form.cidade} onChange={v=>setForm(f=>({...f,cidade:v}))}/>
                  </div>
                  <SelectField label="Consultor responsável" value={form.consultor_id} onChange={v=>setForm(f=>({...f,consultor_id:v}))} required options={consultores.map(c=>({value:c.id,label:c.nome}))}/>
                  <SelectField label="Turma" value={form.turma_id} onChange={v=>setForm(f=>({...f,turma_id:v}))} required options={turmas.map(t=>({value:t.id,label:t.nome}))}/>
                  <SelectField label="Status" value={form.status} onChange={v=>setForm(f=>({...f,status:v}))} required
                    options={[{value:'ativo',label:'Ativo'},{value:'pausado',label:'Pausado'},{value:'churn',label:'Churn'},{value:'inativo',label:'Inativo'}]}/>
                  <Input label="Planilha Financeiro (URL)" value={form.url_planilha_financeiro} onChange={v=>setForm(f=>({...f,url_planilha_financeiro:v}))} placeholder="https://docs.google.com/..."/>
                  <Input label="Planilha Leads (URL)" value={form.url_planilha_leads} onChange={v=>setForm(f=>({...f,url_planilha_leads:v}))} placeholder="https://docs.google.com/..."/>
                  <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4}}>
                    <Btn onClick={()=>setEditMode(false)} variant='ghost'>Cancelar</Btn>
                    <Btn onClick={salvarEdicao} variant='primary' disabled={saving}>{saving?'Salvando...':'Salvar alterações'}</Btn>
                  </div>
                </div>
              ):(
                <div>
                  <table style={{width:'100%',fontSize:13,borderCollapse:'collapse',marginBottom:10}}>
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
                        ['Status',STATUS_ALUNO[aluno.status_aluno]?.label||'—'],
                      ].map(([k,v,color])=>(
                        <tr key={k}>
                          <td style={{padding:'7px 0',color:'var(--muted)',borderBottom:'1px solid var(--border)',width:'45%'}}>{k}</td>
                          <td style={{padding:'7px 0',fontWeight:600,textAlign:'right',borderBottom:'1px solid var(--border)',color:color||'var(--text)'}}>{v||'—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Links planilhas */}
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {aluno.url_planilha_financeiro&&(
                      <a href={aluno.url_planilha_financeiro} target="_blank" rel="noreferrer"
                        style={{fontSize:12,fontWeight:600,padding:'5px 12px',borderRadius:7,background:'#dcfce7',color:'#14532d',border:'1px solid #86efac',textDecoration:'none',display:'flex',alignItems:'center',gap:5}}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                        Planilha Financeiro
                      </a>
                    )}
                    {aluno.url_planilha_leads&&(
                      <a href={aluno.url_planilha_leads} target="_blank" rel="noreferrer"
                        style={{fontSize:12,fontWeight:600,padding:'5px 12px',borderRadius:7,background:'#ede9fe',color:'#2e1065',border:'1px solid #c4b5fd',textDecoration:'none',display:'flex',alignItems:'center',gap:5}}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                        Planilha Leads
                      </a>
                    )}
                    {!aluno.url_planilha_financeiro&&!aluno.url_planilha_leads&&(
                      <span style={{fontSize:12,color:'var(--muted)',fontStyle:'italic'}}>Nenhuma planilha vinculada · clique em Editar para adicionar</span>
                    )}
                  </div>
                </div>
              )}
            </div>

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

          {/* ── TAB ENCONTROS ── */}
          {tab==='encontros'&&(
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',fontFamily:'var(--mono)'}}>Calendário do curso</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {Object.entries(PRESENCA_STATUS).map(([k,v])=>(
                    <span key={k} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:v.text}}>
                      <span style={{width:8,height:8,borderRadius:2,background:v.bg,border:`1px solid ${v.border}`,display:'inline-block'}}/>
                      {v.label}
                    </span>
                  ))}
                </div>
              </div>
              {turmaAulas.length===0?(
                <div style={{textAlign:'center',padding:'30px 0',color:'var(--muted)',fontSize:13}}>Sem encontros cadastrados</div>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:7}}>
                  {turmaAulas.map(au=>{
                    const st = presMap[au.id]
                    const ps = PRESENCA_STATUS[st] || {bg:'var(--surface2)',text:'var(--muted)',border:'var(--border)',label:'—'}
                    const is1x1 = au.tema?.toLowerCase().includes('1:1')||au.tema?.toLowerCase().includes('presencial')
                    const reuniaoVinculada = reunioes.find(r=>r.data_reuniao===au.data_aula)
                    return (
                      <div key={au.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'11px 13px',background:ps.bg+'33',borderRadius:9,border:`1px solid ${ps.border}`}}>
                        <div style={{width:32,height:32,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,fontFamily:'var(--mono)',flexShrink:0,background:ps.bg,color:ps.text,border:`1.5px solid ${ps.border}`}}>
                          {is1x1?'1:1':au.numero}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                            <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{au.tema}</div>
                            {is1x1&&<span style={{fontSize:10,fontWeight:600,padding:'1px 7px',borderRadius:20,background:'#ede9fe',color:'#2e1065',border:'1px solid #c4b5fd',flexShrink:0}}>1:1</span>}
                          </div>
                          <div style={{fontSize:11,color:'var(--muted)'}}>{fd(au.data_aula)}</div>
                          {reuniaoVinculada&&(
                            <div style={{marginTop:6,padding:'6px 9px',background:'var(--accent-dim)',borderRadius:6,border:'1px solid #bfdbfe'}}>
                              <div style={{fontSize:10,fontWeight:600,color:'var(--accent-text)',marginBottom:2}}>{tipoLabel(reuniaoVinculada.tipo)}</div>
                              <div style={{fontSize:11,color:'var(--text2)',lineHeight:1.4}}>{reuniaoVinculada.resumo?.slice(0,120)}{reuniaoVinculada.resumo?.length>120?'…':''}</div>
                            </div>
                          )}
                        </div>
                        <span style={{fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,flexShrink:0,background:ps.bg,color:ps.text,border:`1px solid ${ps.border}`}}>{ps.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB REUNIÕES ── */}
          {tab==='reunioes'&&(<>
            <div style={{background:'var(--accent-dim)',border:'1px solid #bfdbfe',borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--accent-text)',marginBottom:12}}>Registrar reunião individual</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <Input label="Data" type="date" value={novaReuniao.data_reuniao} onChange={v=>setNovaReuniao(r=>({...r,data_reuniao:v}))} required/>
                  <SelectField label="Consultor" value={novaReuniao.consultor_id} onChange={v=>setNovaReuniao(r=>({...r,consultor_id:v}))} options={consultores.map(c=>({value:c.id,label:c.nome}))}/>
                </div>
                <SelectField label="Tipo de reunião" value={novaReuniao.tipo} onChange={v=>setNovaReuniao(r=>({...r,tipo:v}))} required options={TIPOS_REUNIAO}/>
                <Textarea label="Resumo" value={novaReuniao.resumo} onChange={v=>setNovaReuniao(r=>({...r,resumo:v}))} rows={4} placeholder="O que foi discutido, decisões tomadas, próximos passos..."/>
                <div style={{display:'flex',justifyContent:'flex-end'}}>
                  <Btn onClick={salvarReuniao} variant='primary' disabled={savingReuniao||!novaReuniao.data_reuniao||!novaReuniao.resumo.trim()}>
                    {savingReuniao?'Salvando...':'Salvar reunião'}
                  </Btn>
                </div>
              </div>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Histórico ({reunioes.length})</div>
              {reunioes.length===0?(<div style={{textAlign:'center',padding:'24px 0',color:'var(--muted)',fontSize:13}}>Nenhuma reunião registrada</div>):reunioes.map(r=>(
                <div key={r.id} style={{padding:'12px 14px',background:'var(--surface2)',borderRadius:9,marginBottom:8,border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6,gap:8,flexWrap:'wrap'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:12,fontFamily:'var(--mono)',fontWeight:500,color:'var(--text2)'}}>{fd(r.data_reuniao)}</span>
                      <span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:20,background:'var(--accent-dim)',color:'var(--accent-text)',border:'1px solid #bfdbfe'}}>{tipoLabel(r.tipo)}</span>
                    </div>
                    {r.consultores?.nome&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'var(--surface2)',color:'var(--text2)',fontWeight:500,border:'1px solid var(--border)'}}>{r.consultores.nome}</span>}
                  </div>
                  <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>{r.resumo||<em style={{color:'var(--muted)'}}>Sem resumo</em>}</div>
                </div>
              ))}
            </div>
          </>)}

          {/* ── TAB LOG CS ── */}
          {tab==='cs'&&(<>
            <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:12,fontWeight:700,color:'#14532d',marginBottom:12}}>Registrar contato CS</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <Input label="Data do contato" type="date" value={novoContato.data_contato} onChange={v=>setNovoContato(c=>({...c,data_contato:v}))} required/>
                  <SelectField label="Responsável" value={novoContato.consultor_id} onChange={v=>setNovoContato(c=>({...c,consultor_id:v}))} options={consultores.map(c=>({value:c.id,label:c.nome}))}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <SelectField label="Status na época" value={novoContato.churn_status_na_epoca} onChange={v=>setNovoContato(c=>({...c,churn_status_na_epoca:v}))}
                    options={[{value:'verde',label:'Verde'},{value:'laranja',label:'Laranja'},{value:'vermelho',label:'Vermelho'},{value:'roxo',label:'Roxo'}]}/>
                  <Input label="Data de follow-up" type="date" value={novoContato.data_fup} onChange={v=>setNovoContato(c=>({...c,data_fup:v}))}/>
                </div>
                <Textarea label="Descrição do contato" value={novoContato.descricao} onChange={v=>setNovoContato(c=>({...c,descricao:v}))} rows={3} required
                  placeholder="O que foi discutido, resultado do contato, próximos passos..."/>
                <div style={{display:'flex',justifyContent:'flex-end'}}>
                  <Btn onClick={salvarContato} variant='primary' disabled={savingContato||!novoContato.data_contato||!novoContato.descricao.trim()}>
                    {savingContato?'Salvando...':'Registrar contato'}
                  </Btn>
                </div>
              </div>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Histórico de contatos ({contatos.length})</div>
              {contatos.length===0?(<div style={{textAlign:'center',padding:'24px 0',color:'var(--muted)',fontSize:13}}>Nenhum contato registrado</div>):contatos.map(ct=>{
                const hc = cs(ct.churn_status_na_epoca)
                return (
                  <div key={ct.id} style={{padding:'12px 14px',background:'var(--surface2)',borderRadius:9,marginBottom:8,border:'1px solid var(--border)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6,gap:8,flexWrap:'wrap'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:12,fontFamily:'var(--mono)',fontWeight:500,color:'var(--text2)'}}>{fd(ct.data_contato)}</span>
                        {ct.churn_status_na_epoca&&(
                          <span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,background:hc.bg,color:hc.text,border:`1px solid ${hc.border}`}}>{hc.label}</span>
                        )}
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        {ct.consultores?.nome&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'var(--surface2)',color:'var(--text2)',fontWeight:500,border:'1px solid var(--border)'}}>{ct.consultores.nome}</span>}
                        {ct.data_fup&&(
                          <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:20,background:'#fff7ed',color:'#7c2d12',border:'1px solid #fdba74'}}>FUP {fd(ct.data_fup)}</span>
                        )}
                      </div>
                    </div>
                    <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>{ct.descricao}</div>
                  </div>
                )
              })}
            </div>
          </>)}

          {/* ── TAB NOTAS ── */}
          {tab==='notas'&&(<>
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
              {notas.length===0?(<div style={{textAlign:'center',padding:'24px 0',color:'var(--muted)',fontSize:13}}>Nenhuma nota</div>):notas.map(n=>(
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

// ─── Modal novo aluno ───────────────────────────────────────────────

function NovoAlunoModal({ consultores, turmas, onClose, onSaved }) {
  const [form, setForm] = useState({
    nome:'',email:'',whatsapp:'',especialidade:'',clinica:'',cidade:'',
    consultor_id:'',turma_id:'',data_entrada:new Date().toISOString().split('T')[0],
    url_planilha_financeiro:'',url_planilha_leads:'',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar() {
    if (!form.nome.trim()||!form.consultor_id||!form.turma_id||!form.data_entrada) {
      setErro('Preencha nome, consultor, turma e data de entrada.'); return
    }
    setSaving(true); setErro('')
    const dataFim = new Date(form.data_entrada)
    dataFim.setFullYear(dataFim.getFullYear()+1)
    const {error} = await supabase.from('alunos').insert({
      nome:form.nome.trim(), email:form.email.trim()||null,
      whatsapp:form.whatsapp.trim()||null, especialidade:form.especialidade.trim()||null,
      clinica:form.clinica.trim()||null, cidade:form.cidade.trim()||null,
      consultor_id:form.consultor_id, turma_id:form.turma_id,
      data_entrada:form.data_entrada, data_fim_prevista:dataFim.toISOString().split('T')[0],
      status:'ativo',
      url_planilha_financeiro:form.url_planilha_financeiro||null,
      url_planilha_leads:form.url_planilha_leads||null,
    })
    setSaving(false)
    if (error) {setErro('Erro ao cadastrar: '+error.message);return}
    onSaved()
  }

  return (
    <Modal title="Novo aluno" onClose={onClose} width={580}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{gridColumn:'1/-1'}}><Input label="Nome completo" value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))} placeholder="Dr(a). Nome Sobrenome" required/></div>
        <Input label="Especialidade" value={form.especialidade} onChange={v=>setForm(f=>({...f,especialidade:v}))} placeholder="Cardiologia"/>
        <Input label="Cidade" value={form.cidade} onChange={v=>setForm(f=>({...f,cidade:v}))} placeholder="São Paulo"/>
        <Input label="WhatsApp" value={form.whatsapp} onChange={v=>setForm(f=>({...f,whatsapp:v}))} placeholder="+55 11 99999-9999"/>
        <Input label="E-mail" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/>
        <Input label="Clínica" value={form.clinica} onChange={v=>setForm(f=>({...f,clinica:v}))} placeholder="Nome da clínica"/>
        <Input label="Data de entrada" value={form.data_entrada} onChange={v=>setForm(f=>({...f,data_entrada:v}))} type="date" required/>
        <div style={{gridColumn:'1/-1'}}><SelectField label="Consultor responsável" value={form.consultor_id} onChange={v=>setForm(f=>({...f,consultor_id:v}))} required options={consultores.map(c=>({value:c.id,label:c.nome}))}/></div>
        <div style={{gridColumn:'1/-1'}}><SelectField label="Turma" value={form.turma_id} onChange={v=>setForm(f=>({...f,turma_id:v}))} required options={turmas.map(t=>({value:t.id,label:t.nome}))}/></div>
        <div style={{gridColumn:'1/-1'}}><Input label="Planilha Financeiro (URL)" value={form.url_planilha_financeiro} onChange={v=>setForm(f=>({...f,url_planilha_financeiro:v}))} placeholder="https://docs.google.com/..."/></div>
        <div style={{gridColumn:'1/-1'}}><Input label="Planilha Leads (URL)" value={form.url_planilha_leads} onChange={v=>setForm(f=>({...f,url_planilha_leads:v}))} placeholder="https://docs.google.com/..."/></div>
      </div>
      {erro&&<div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,padding:'10px 12px',fontSize:12,color:'#7f1d1d'}}>{erro}</div>}
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4,borderTop:'1px solid var(--border)'}}>
        <Btn onClick={onClose} variant='ghost'>Cancelar</Btn>
        <Btn onClick={salvar} variant='primary' disabled={saving}>{saving?'Cadastrando...':'Cadastrar aluno'}</Btn>
      </div>
    </Modal>
  )
}

// ─── Dashboard ──────────────────────────────────────────────────────

function Dashboard({ alunos, turmas, filterTurma, setFilterTurma, filterChurn, setFilterChurn, search, setSearch, onSelectAluno }) {
  const filtered = alunos.filter(a=>{
    if (filterTurma&&a.turma_id!==filterTurma) return false
    if (filterChurn&&a.churn_cor!==filterChurn) return false
    if (search&&!a.nome.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const counts={verde:0,laranja:0,vermelho:0,roxo:0}
  alunos.forEach(a=>{if(a.churn_cor&&counts[a.churn_cor]!==undefined)counts[a.churn_cor]++})
  const contatosHoje = alunos.filter(a=>a.proximo_fup&&new Date(a.proximo_fup+'T12:00:00')<=new Date()).length
  const selStyle={fontSize:12,padding:'6px 10px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none',cursor:'pointer',fontWeight:500}

  return (<>
    <div style={{padding:'13px 22px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
      <div>
        <div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>Dashboard</div>
        <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{alunos.filter(a=>a.status_aluno==='ativo').length} ativos · {alunos.filter(a=>a.status_aluno==='pausado').length} pausados · {turmas.length} turma{turmas.length!==1?'s':''}</div>
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
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginBottom:20}}>
        {[
          {label:'Total ativo',val:alunos.filter(a=>a.status_aluno==='ativo').length,color:'var(--text)'},
          {label:'Verde',val:counts.verde,color:'#15803d'},
          {label:'Laranja',val:counts.laranja,color:'#c2410c'},
          {label:'Vermelho',val:counts.vermelho,color:'#dc2626'},
          {label:'Roxo',val:counts.roxo,color:'#7c3aed'},
          {label:'FUPs vencidos',val:contatosHoje,color:'#c2410c',urgent:contatosHoje>0},
        ].map(m=>(
          <div key={m.label} style={{background:m.urgent?'#fff7ed':'var(--surface)',border:`1px solid ${m.urgent?'#fdba74':'var(--border)'}`,borderRadius:10,padding:'13px 16px'}}>
            <div style={{fontSize:10,color:'var(--muted)',marginBottom:5,fontWeight:500,textTransform:'uppercase',letterSpacing:'0.04em'}}>{m.label}</div>
            <div style={{fontSize:22,fontWeight:700,color:m.color}}>{m.val}</div>
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
        {filtered.map(a=>{
          const cst=cs(a.churn_cor)
          return (
            <div key={a.id} onClick={()=>onSelectAluno(a.id)}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=cst.border;e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none'}}
              style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:14,cursor:'pointer',transition:'all 0.18s',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:cst.dot,borderRadius:'12px 12px 0 0'}}/>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,background:cst.bg,color:cst.text,border:`1.5px solid ${cst.border}`}}>{ini(a.nome)}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1.3}}>{a.nome}</div>
                  <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{a.turma_nome} · {a.consultor_nome}</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                <Badge cor={a.churn_cor}/>
                {a.status_aluno!=='ativo'&&<StatusBadge status={a.status_aluno}/>}
                {a.proximo_fup&&<span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,background:'#fff7ed',color:'#7c2d12',border:'1px solid #fdba74'}}>FUP {fd(a.proximo_fup)}</span>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:10,paddingTop:10,borderTop:'1px solid var(--border)'}}>
                {[
                  {label:'Aulas',val:`${a.aulas_presentes??0}/${a.total_aulas_realizadas??0}`},
                  {label:'Reuniões',val:a.total_reunioes??0},
                  {label:'Leads',val:a.leads_preenchido?'Sim':'Não',ok:a.leads_preenchido},
                  {label:'Financeiro',val:a.financeiro_preenchido?'Sim':'Não',ok:a.financeiro_preenchido},
                ].map(st=>(
                  <div key={st.label} style={{fontSize:11,color:'var(--muted)'}}>
                    <strong style={{display:'block',fontSize:12,fontWeight:600,color:st.ok===false?'#dc2626':st.ok===true?'#15803d':'var(--text2)',fontFamily:'var(--mono)'}}>{st.val}</strong>
                    {st.label}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </>)
}

// ─── Módulo Alunos ──────────────────────────────────────────────────

function AlunosModule({ alunos, turmas, consultores, onSelectAluno, onNovoAluno }) {
  const [view, setView] = useState('cards')
  const [search, setSearch] = useState('')
  const [filterTurma, setFilterTurma] = useState('')
  const [filterStatus, setFilterStatus] = useState('ativo')
  const selStyle={fontSize:12,padding:'6px 10px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none',cursor:'pointer',fontWeight:500}

  const filtered = alunos.filter(a=>{
    if (filterStatus&&a.status_aluno!==filterStatus) return false
    if (filterTurma&&a.turma_id!==filterTurma) return false
    if (search&&!a.nome.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (<>
    <div style={{padding:'13px 22px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
      <div>
        <div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>Alunos</div>
        <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{filtered.length} exibidos</div>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..."
          style={{fontSize:12,padding:'6px 10px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none',width:160}}/>
        <select value={filterTurma} onChange={e=>setFilterTurma(e.target.value)} style={selStyle}>
          <option value="">Todas as turmas</option>
          {turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={selStyle}>
          <option value="ativo">Ativos</option>
          <option value="pausado">Pausados</option>
          <option value="churn">Churn</option>
          <option value="">Todos</option>
        </select>
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
      {filtered.length===0?(
        <div style={{textAlign:'center',padding:40,color:'var(--muted)',fontSize:13}}>Nenhum aluno encontrado</div>
      ):view==='cards'?(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(235px,1fr))',gap:10}}>
          {filtered.map(a=>{
            const cst=cs(a.churn_cor)
            return (
              <div key={a.id} onClick={()=>onSelectAluno(a.id)}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=cst.border;e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none'}}
                style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:14,cursor:'pointer',transition:'all 0.18s',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:cst.dot,borderRadius:'12px 12px 0 0'}}/>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,background:cst.bg,color:cst.text,border:`1.5px solid ${cst.border}`}}>{ini(a.nome)}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1.3}}>{a.nome}</div>
                    <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{a.turma_nome} · {a.consultor_nome}</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                  <Badge cor={a.churn_cor}/>
                  {a.status_aluno!=='ativo'&&<StatusBadge status={a.status_aluno}/>}
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
            )
          })}
        </div>
      ):(
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{background:'var(--surface2)',borderBottom:'1px solid var(--border)'}}>
                {['Aluno','Especialidade','Turma','Consultor','Churn','Status','FUP'].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a=>(
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
                  <td style={{padding:'11px 14px'}}><StatusBadge status={a.status_aluno}/></td>
                  <td style={{padding:'11px 14px',fontSize:11,color:a.proximo_fup?'#7c2d12':'var(--muted)',fontWeight:a.proximo_fup?600:400}}>{a.proximo_fup?fd(a.proximo_fup):'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </>)
}

// ─── App principal ──────────────────────────────────────────────────

export default function App() {
  const [alunos,setAlunos]=useState([])
  const [turmas,setTurmas]=useState([])
  const [consultores,setConsultores]=useState([])
  const [aulas,setAulas]=useState([])
  const [reunioes,setReunioes]=useState([])
  const [tarefas,setTarefas]=useState([])
  const [presencas,setPresencas]=useState([])
  const [notas,setNotas]=useState([])
  const [historico,setHistorico]=useState([])
  const [contatos,setContatos]=useState([])
  const [loading,setLoading]=useState(true)
  const [activeNav,setActiveNav]=useState('dashboard')
  const [selected,setSelected]=useState(null)
  const [showNovoAluno,setShowNovoAluno]=useState(false)
  const [filterTurma,setFilterTurma]=useState('')
  const [filterChurn,setFilterChurn]=useState('')
  const [search,setSearch]=useState('')

  const loadAll=useCallback(async()=>{
    setLoading(true)
    const [a,t,c,au,r,ta,p,n,h,ct]=await Promise.all([
      supabase.from('view_alunos_dashboard').select('*'),
      supabase.from('turmas').select('*'),
      supabase.from('consultores').select('*').order('nome'),
      supabase.from('aulas').select('*').order('numero'),
      supabase.from('reunioes').select('*,consultores(nome)').order('data_reuniao',{ascending:false}),
      supabase.from('tarefas').select('*,consultores(nome)').order('created_at',{ascending:false}),
      supabase.from('presencas').select('*,aulas(numero,tema,data_aula,status)'),
      supabase.from('notas_internas').select('*,consultores(nome)').order('created_at',{ascending:false}),
      supabase.from('churn_historico').select('*').order('criado_em',{ascending:false}),
      supabase.from('contatos_cs').select('*,consultores(nome)').order('data_contato',{ascending:false}),
    ])
    setAlunos(a.data||[]); setTurmas(t.data||[]); setConsultores(c.data||[])
    setAulas(au.data||[]); setReunioes(r.data||[]); setTarefas(ta.data||[])
    setPresencas(p.data||[]); setNotas(n.data||[]); setHistorico(h.data||[])
    setContatos(ct.data||[])
    setLoading(false)
  },[])

  useEffect(()=>{loadAll()},[loadAll])

  const selectedAluno=selected?alunos.find(a=>a.id===selected):null

  return (
    <>
      <style>{G}</style>
      <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>

        <div style={{width:210,minWidth:210,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'18px 16px 14px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)',letterSpacing:'-0.01em'}}>MBA Exponencial</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>Gestão de turmas</div>
          </div>
          <nav style={{padding:'10px 8px',flex:1}}>
            {[
              {id:'dashboard',label:'Dashboard',icon:'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z'},
              {id:'alunos',label:'Alunos',icon:'M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z'},
              {id:'calendario',label:'Calendário',icon:'M3 4h18v17H3zM16 2v4M8 2v4M3 10h18'},
              {id:'tarefas',label:'Tarefas',icon:'M9 11l3 3 8-8M5 12l2 2 4-4'},
            ].map(n=><NavItem key={n.id} {...n} active={activeNav===n.id} onClick={()=>setActiveNav(n.id)}/>)}
          </nav>
        </div>

        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {loading?(
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)',fontSize:13}}>Carregando dados...</div>
          ):activeNav==='dashboard'?(
            <Dashboard alunos={alunos} turmas={turmas} filterTurma={filterTurma} setFilterTurma={setFilterTurma} filterChurn={filterChurn} setFilterChurn={setFilterChurn} search={search} setSearch={setSearch} onSelectAluno={id=>setSelected(id)}/>
          ):activeNav==='alunos'?(
            <AlunosModule alunos={alunos} turmas={turmas} consultores={consultores} onSelectAluno={id=>setSelected(id)} onNovoAluno={()=>setShowNovoAluno(true)}/>
          ):(
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)',fontSize:13}}>Em construção</div>
          )}
        </div>

        {selectedAluno&&(
          <StudentPanel
            aluno={selectedAluno} aulas={aulas}
            reunioes={reunioes.filter(r=>r.aluno_id===selectedAluno.id)}
            tarefas={tarefas.filter(t=>t.aluno_id===selectedAluno.id)}
            presencas={presencas}
            notas={notas.filter(n=>n.aluno_id===selectedAluno.id)}
            historico={historico.filter(h=>h.aluno_id===selectedAluno.id)}
            contatos={contatos.filter(c=>c.aluno_id===selectedAluno.id)}
            consultores={consultores} turmas={turmas}
            onClose={()=>setSelected(null)} onUpdate={loadAll}
          />
        )}

        {showNovoAluno&&(
          <NovoAlunoModal consultores={consultores} turmas={turmas}
            onClose={()=>setShowNovoAluno(false)}
            onSaved={()=>{setShowNovoAluno(false);loadAll()}}/>
        )}
      </div>
    </>
  )
}
