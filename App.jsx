import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const ALLOWED_DOMAIN = '@exponencialmed.com.br'

// ─── Cores e constantes ─────────────────────────────────────────────

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
  {value:'onboarding',label:'Onboarding'},
  {value:'1:1-0',label:'1:1 - 0'},
  {value:'1:1-1',label:'1:1 - 1'},
  {value:'1:1-2',label:'1:1 - 2'},
  {value:'1:1-3',label:'1:1 - 3'},
  {value:'1:1-4',label:'1:1 - 4'},
  {value:'1:1-5',label:'1:1 - 5'},
  {value:'reuniao-planilhas',label:'Reunião de planilhas'},
  {value:'fora-de-escopo',label:'Fora de escopo'},
  {value:'outros',label:'Outros'},
]

const cs = c => CC[c] || CC._
const ini = n => n.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()
const fd = d => { if(!d)return'—'; return new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'2-digit'}) }
const fdFull = d => { if(!d)return'—'; return new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'long',year:'numeric'}) }

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

// ─── Tela de login ───────────────────────────────────────────────────

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')

    if (!email.endsWith(ALLOWED_DOMAIN)) {
      setErro(`Acesso restrito a emails ${ALLOWED_DOMAIN}`)
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })
    setLoading(false)

    if (error) {
      setErro('Erro ao enviar email. Tente novamente.')
    } else {
      setSent(true)
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:20}}>
      <div style={{width:'100%',maxWidth:400,animation:'fadeIn 0.3s ease'}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:52,height:52,borderRadius:14,background:'var(--accent)',marginBottom:16}}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div style={{fontSize:20,fontWeight:700,color:'var(--text)',letterSpacing:'-0.02em'}}>MBA Exponencial</div>
          <div style={{fontSize:13,color:'var(--muted)',marginTop:4}}>Gestão de turmas</div>
        </div>

        {/* Card */}
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'28px 32px',boxShadow:'0 4px 24px rgba(0,0,0,0.06)'}}>
          {!sent ? (<>
            <div style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:6}}>Entrar</div>
            <div style={{fontSize:13,color:'var(--muted)',marginBottom:22,lineHeight:1.5}}>
              Digite seu email <strong style={{color:'var(--text2)'}}>@exponencialmed.com.br</strong> para receber um link de acesso.
            </div>

            <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:14}}>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                <label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  placeholder="seu@exponencialmed.com.br"
                  required
                  autoFocus
                  style={{fontSize:13,padding:'10px 12px',background:'var(--bg)',border:'1.5px solid var(--border2)',borderRadius:9,color:'var(--text)',outline:'none',width:'100%',transition:'border-color 0.15s'}}
                  onFocus={e=>e.target.style.borderColor='var(--accent)'}
                  onBlur={e=>e.target.style.borderColor='var(--border2)'}
                />
              </div>

              {erro && (
                <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,padding:'9px 12px',fontSize:12,color:'#7f1d1d'}}>
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                style={{fontSize:13,fontWeight:600,padding:'11px',borderRadius:9,border:'none',background:'var(--accent)',color:'#fff',cursor:loading||!email?'not-allowed':'pointer',opacity:loading||!email?0.7:1,transition:'all 0.15s',marginTop:4}}
              >
                {loading ? 'Enviando...' : 'Enviar link de acesso'}
              </button>
            </form>
          </>) : (
            <div style={{textAlign:'center'}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:'#dcfce7',border:'1px solid #86efac',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#14532d" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:8}}>Email enviado!</div>
              <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.6,marginBottom:20}}>
                Enviamos um link de acesso para<br/>
                <strong style={{color:'var(--text)'}}>{email}</strong>.<br/>
                Verifique sua caixa de entrada.
              </div>
              <button
                onClick={()=>{setSent(false);setEmail('')}}
                style={{fontSize:12,color:'var(--accent)',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}
              >
                Usar outro email
              </button>
            </div>
          )}
        </div>

        <div style={{textAlign:'center',marginTop:20,fontSize:11,color:'var(--muted)'}}>
          Acesso restrito à equipe Exponencial Med
        </div>
      </div>
    </div>
  )
}

// ─── Base components ─────────────────────────────────────────────────

function Badge({cor}){const c=cs(cor);return(<span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,fontFamily:'var(--mono)',background:c.bg,color:c.text,border:`1px solid ${c.border}`}}><span style={{width:6,height:6,borderRadius:'50%',background:c.dot,flexShrink:0}}/>{c.label}</span>)}
function StatusBadge({status}){const s=STATUS_ALUNO[status]||STATUS_ALUNO.inativo;return(<span style={{display:'inline-flex',alignItems:'center',fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,fontFamily:'var(--mono)',background:s.bg,color:s.text,border:`1px solid ${s.border}`}}>{s.label}</span>)}
function Btn({children,onClick,variant='default',disabled,style={}}){const base={fontSize:13,fontWeight:500,padding:'7px 14px',borderRadius:8,cursor:disabled?'not-allowed':'pointer',transition:'all 0.15s',border:'none',opacity:disabled?0.6:1,...style};const v={default:{background:'var(--surface)',border:'1.5px solid var(--border2)',color:'var(--text2)'},primary:{background:'var(--accent)',color:'#fff'},danger:{background:'#fee2e2',color:'#7f1d1d',border:'1px solid #fca5a5'},ghost:{background:'transparent',color:'var(--muted)',border:'1px solid var(--border)'},warning:{background:'#fef9c3',color:'#713f12',border:'1px solid #fde68a'}};return<button onClick={onClick} disabled={disabled} style={{...base,...v[variant]}}>{children}</button>}
function Input({label,value,onChange,type='text',placeholder,required}){return(<div style={{display:'flex',flexDirection:'column',gap:5}}>{label&&<label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}{required&&<span style={{color:'#dc2626'}}> *</span>}</label>}<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{fontSize:13,padding:'8px 11px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:8,color:'var(--text)',outline:'none',width:'100%'}}/></div>)}
function SelectField({label,value,onChange,options,required}){return(<div style={{display:'flex',flexDirection:'column',gap:5}}>{label&&<label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}{required&&<span style={{color:'#dc2626'}}> *</span>}</label>}<select value={value} onChange={e=>onChange(e.target.value)} style={{fontSize:13,padding:'8px 11px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:8,color:'var(--text)',outline:'none',width:'100%'}}><option value="">Selecionar...</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>)}
function Textarea({label,value,onChange,rows=3,placeholder,required}){return(<div style={{display:'flex',flexDirection:'column',gap:5}}>{label&&<label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}{required&&<span style={{color:'#dc2626'}}> *</span>}</label>}<textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{fontSize:13,padding:'8px 11px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:8,color:'var(--text)',outline:'none',resize:'vertical',lineHeight:1.6}}/></div>)}
function Modal({title,onClose,children,width=520}){return(<div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}><div style={{background:'var(--surface)',borderRadius:14,width:'100%',maxWidth:width,maxHeight:'90vh',overflowY:'auto',animation:'fadeIn 0.2s ease',boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',borderBottom:'1px solid var(--border)'}}><div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>{title}</div><button onClick={onClose} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--muted)',fontSize:14}}>✕</button></div><div style={{padding:'20px 22px',display:'flex',flexDirection:'column',gap:16}}>{children}</div></div></div>)}
function NavItem({icon,label,active,onClick}){return(<div onClick={onClick} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:7,fontSize:13,fontWeight:active?500:400,color:active?'var(--accent-text)':'var(--muted)',background:active?'var(--accent-dim)':'transparent',cursor:'pointer',marginBottom:1,transition:'all 0.15s'}}><svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{flexShrink:0}}><path d={icon}/></svg>{label}</div>)}

// ─── Modal de mudança de status ──────────────────────────────────────

function StatusChangeModal({ aluno, novoStatus, consultores, onClose, onConfirm }) {
  const s = STATUS_ALUNO[novoStatus]
  const [form, setForm] = useState({ descricao:'', consultor_id:aluno.consultor_id||'', data_fup:'' })
  const [saving, setSaving] = useState(false)
  const isChurn = novoStatus === 'churn'

  async function confirmar() {
    if (!form.descricao.trim()) return
    setSaving(true)
    await supabase.from('alunos').update({ status:novoStatus, motivo_status:form.descricao.trim(), data_status_change:new Date().toISOString().split('T')[0] }).eq('id',aluno.id)
    await supabase.from('contatos_cs').insert({ aluno_id:aluno.id, consultor_id:form.consultor_id||aluno.consultor_id||null, data_contato:new Date().toISOString().split('T')[0], churn_status_na_epoca:aluno.churn_cor||null, descricao:`[Status alterado para ${s.label}] ${form.descricao.trim()}`, data_fup:form.data_fup||null })
    setSaving(false); onConfirm()
  }

  return (
    <Modal title={`Alterar status para ${s.label}`} onClose={onClose} width={500}>
      <div style={{background:isChurn?'#fef2f2':'#fef9c3',border:`1px solid ${isChurn?'#fca5a5':'#fde68a'}`,borderRadius:10,padding:'12px 14px'}}>
        <div style={{fontSize:12,fontWeight:700,color:isChurn?'#991b1b':'#713f12',marginBottom:4}}>{isChurn?'⚠️ Aluno será marcado como Churn':'ℹ️ Aluno será marcado como Pausado'}</div>
        <div style={{fontSize:12,color:isChurn?'#7f1d1d':'#713f12',lineHeight:1.5}}>{isChurn?'Descreva o motivo do churn. O registro será salvo automaticamente no log de CS.':'Registre o motivo da pausa e defina um follow-up se necessário.'}</div>
      </div>
      <SelectField label="Responsável pelo registro" value={form.consultor_id} onChange={v=>setForm(f=>({...f,consultor_id:v}))} options={consultores.map(c=>({value:c.id,label:c.nome}))}/>
      <Textarea label={isChurn?'Motivo do churn *':'Motivo da pausa *'} value={form.descricao} onChange={v=>setForm(f=>({...f,descricao:v}))} rows={4} required placeholder={isChurn?'Ex: Aluno não respondeu após múltiplas tentativas de contato...':'Ex: Aluno em viagem até março...'}/>
      {!isChurn&&<Input label="Data de follow-up" type="date" value={form.data_fup} onChange={v=>setForm(f=>({...f,data_fup:v}))}/>}
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4,borderTop:'1px solid var(--border)'}}>
        <Btn onClick={onClose} variant='ghost'>Cancelar</Btn>
        <Btn onClick={confirmar} variant={isChurn?'danger':'warning'} disabled={saving||!form.descricao.trim()}>{saving?'Salvando...':`Confirmar ${s.label}`}</Btn>
      </div>
    </Modal>
  )
}

// ─── Painel lateral do aluno ──────────────────────────────────────────

function StudentPanel({ aluno, aulas, reunioes, tarefas, presencas, notas, historico, contatos, consultores, turmas, onClose, onUpdate }) {
  const [tab, setTab] = useState('perfil')
  const [editMode, setEditMode] = useState(false)
  const [statusModal, setStatusModal] = useState(null)
  const [form, setForm] = useState({ nome:aluno.nome||'', whatsapp:aluno.whatsapp||'', cidade:aluno.cidade||'', especialidade:aluno.especialidade||'', clinica:aluno.clinica||'', consultor_id:aluno.consultor_id||'', turma_id:aluno.turma_id||'', status:aluno.status_aluno||'ativo', url_planilha_financeiro:aluno.url_planilha_financeiro||'', url_planilha_leads:aluno.url_planilha_leads||'' })
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
  presencas.filter(p=>p.aluno_id===aluno.id).forEach(p=>{presMap[p.aula_id]=p.status})
  const psec = {borderTop:'1px solid var(--border)',paddingTop:16,marginTop:4}

  function handleStatusChange(novoStatus) {
    if (novoStatus==='pausado'||novoStatus==='churn') { setStatusModal(novoStatus) }
    else { setForm(f=>({...f,status:novoStatus})) }
  }

  async function salvarEdicao() {
    setSaving(true)
    await supabase.from('alunos').update({ nome:form.nome, whatsapp:form.whatsapp, cidade:form.cidade, especialidade:form.especialidade, clinica:form.clinica, consultor_id:form.consultor_id, turma_id:form.turma_id, status:form.status, url_planilha_financeiro:form.url_planilha_financeiro||null, url_planilha_leads:form.url_planilha_leads||null }).eq('id',aluno.id)
    setSaving(false); setEditMode(false); onUpdate()
  }

  async function salvarReuniao() {
    if (!novaReuniao.data_reuniao||!novaReuniao.resumo.trim()||!novaReuniao.tipo) return
    setSavingReuniao(true)
    await supabase.from('reunioes').insert({ aluno_id:aluno.id, consultor_id:novaReuniao.consultor_id||aluno.consultor_id, data_reuniao:novaReuniao.data_reuniao, resumo:novaReuniao.resumo.trim(), tipo:novaReuniao.tipo })
    setNovaReuniao({data_reuniao:'',resumo:'',consultor_id:aluno.consultor_id||'',tipo:'onboarding'})
    setSavingReuniao(false); onUpdate()
  }

  async function salvarContato() {
    if (!novoContato.data_contato||!novoContato.descricao.trim()) return
    setSavingContato(true)
    await supabase.from('contatos_cs').insert({ aluno_id:aluno.id, consultor_id:novoContato.consultor_id||aluno.consultor_id||null, data_contato:novoContato.data_contato, churn_status_na_epoca:novoContato.churn_status_na_epoca||null, descricao:novoContato.descricao.trim(), data_fup:novoContato.data_fup||null })
    setNovoContato({data_contato:new Date().toISOString().split('T')[0],descricao:'',consultor_id:aluno.consultor_id||'',churn_status_na_epoca:aluno.churn_cor||'',data_fup:''})
    setSavingContato(false); onUpdate()
  }

  async function salvarNota() {
    if (!novaNota.trim()) return
    setSavingNota(true)
    await supabase.from('notas_internas').insert({aluno_id:aluno.id,conteudo:novaNota.trim()})
    setNovaNota(''); setSavingNota(false); onUpdate()
  }

  const tabs=[{id:'perfil',label:'Perfil'},{id:'encontros',label:'Encontros'},{id:'reunioes',label:`Reuniões (${reunioes.length})`},{id:'cs',label:`Log CS (${contatos.length})`},{id:'notas',label:'Notas'}]

  return (
    <>
      <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',zIndex:50,display:'flex',alignItems:'flex-start',justifyContent:'flex-end'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div style={{width:500,height:'100vh',background:'var(--surface)',borderLeft:'1px solid var(--border)',overflowY:'auto',display:'flex',flexDirection:'column',animation:'slideIn 0.2s ease'}}>
          <div style={{padding:'18px 20px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
              <div>
                <div style={{fontSize:17,fontWeight:700,color:'var(--text)'}}>{aluno.nome}</div>
                <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>{aluno.turma_nome} · {aluno.consultor_nome} · {aluno.especialidade||'—'}</div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8,flexWrap:'wrap'}}>
                  <Badge cor={aluno.churn_cor}/><StatusBadge status={aluno.status_aluno}/>
                  {aluno.proximo_fup&&<span style={{fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,background:'#fff7ed',color:'#7c2d12',border:'1px solid #fdba74'}}>FUP {fd(aluno.proximo_fup)}</span>}
                </div>
              </div>
              <div style={{display:'flex',gap:6,flexShrink:0}}>
                <Btn onClick={()=>{setEditMode(!editMode);if(!editMode)setForm({nome:aluno.nome||'',whatsapp:aluno.whatsapp||'',cidade:aluno.cidade||'',especialidade:aluno.especialidade||'',clinica:aluno.clinica||'',consultor_id:aluno.consultor_id||'',turma_id:aluno.turma_id||'',status:aluno.status_aluno||'ativo',url_planilha_financeiro:aluno.url_planilha_financeiro||'',url_planilha_leads:aluno.url_planilha_leads||''})}} variant={editMode?'primary':'default'} style={{fontSize:12,padding:'5px 12px'}}>{editMode?'Cancelar':'Editar'}</Btn>
                <button onClick={onClose} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--muted)',fontSize:14}}>✕</button>
              </div>
            </div>
            <div style={{display:'flex',gap:2,flexWrap:'wrap'}}>{tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{fontSize:12,fontWeight:tab===t.id?600:400,padding:'6px 12px',borderRadius:7,border:'none',background:tab===t.id?'var(--accent-dim)':'transparent',color:tab===t.id?'var(--accent-text)':'var(--muted)',cursor:'pointer',transition:'all 0.15s'}}>{t.label}</button>))}</div>
          </div>

          <div style={{flex:1,overflowY:'auto',padding:'18px 20px',display:'flex',flexDirection:'column',gap:16}}>

            {tab==='perfil'&&(<>
              {(aluno.churn_cor==='vermelho'||aluno.churn_cor==='roxo')&&(<div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:9,padding:'12px 14px'}}><div style={{fontSize:12,fontWeight:700,color:'#991b1b',marginBottom:4}}>Ação recomendada</div><div style={{fontSize:12,color:'#7f1d1d',lineHeight:1.6}}>{aluno.churn_cor==='roxo'?'Matheus deve elaborar plano estratégico. Follow-up em 14 dias.':`${aluno.consultor_nome} deve agendar reunião de resgate. Follow-up em 14 dias.`}</div></div>)}
              <div style={psec}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Score antichurn</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:8}}><span style={{fontSize:28,fontWeight:700,color:c.text,fontFamily:'var(--mono)'}}>{aluno.churn_score!=null?Math.round(aluno.churn_score):0}%</span><span style={{fontSize:12,color:'var(--muted)',fontWeight:500}}>{c.label}</span></div>
                <div style={{height:6,borderRadius:3,background:'var(--surface2)',overflow:'hidden',border:'1px solid var(--border)'}}><div style={{height:'100%',borderRadius:3,width:`${aluno.churn_score||0}%`,background:c.dot}}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:12}}>
                  {[{l:'U2A · perdeu 2 últimas aulas',v:aluno.u2a,p:'25%'},{l:'P3A · perdeu 3+ aulas',v:aluno.p3a,p:'25%'},{l:'Leads não preenchido',v:!aluno.leads_preenchido,p:'15%'},{l:'Financeiro não preenchido',v:!aluno.financeiro_preenchido,p:'15%'},{l:'Sem resposta aos fups',v:aluno.sem_resposta,p:'20%',full:true}].map((cr,i)=>(<div key={i} style={{padding:'9px 11px',borderRadius:8,background:cr.v?'#fef2f2':'#f0fdf4',border:`1px solid ${cr.v?'#fca5a5':'#86efac'}`,gridColumn:cr.full?'1/-1':undefined}}><div style={{fontSize:10,color:'var(--muted)',marginBottom:3,lineHeight:1.3}}>{cr.l}</div><div style={{fontSize:12,fontWeight:700,fontFamily:'var(--mono)',color:cr.v?'#dc2626':'#16a34a'}}>{cr.v?'Sim':'Não'}</div><div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>Peso {cr.p}</div></div>))}
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
                    <div>
                      <label style={{fontSize:12,fontWeight:500,color:'var(--text2)',display:'block',marginBottom:5}}>Status</label>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {['ativo','pausado','churn','inativo'].map(s=>{const st=STATUS_ALUNO[s];const isSelected=form.status===s;return(<button key={s} onClick={()=>handleStatusChange(s)} style={{fontSize:12,fontWeight:600,padding:'6px 14px',borderRadius:8,cursor:'pointer',border:`2px solid ${isSelected?st.border:'var(--border)'}`,background:isSelected?st.bg:'var(--surface)',color:isSelected?st.text:'var(--muted)',transition:'all 0.15s'}}>{st.label}</button>)})}
                      </div>
                    </div>
                    <Input label="Planilha Financeiro (URL)" value={form.url_planilha_financeiro} onChange={v=>setForm(f=>({...f,url_planilha_financeiro:v}))} placeholder="https://docs.google.com/..."/>
                    <Input label="Planilha Leads (URL)" value={form.url_planilha_leads} onChange={v=>setForm(f=>({...f,url_planilha_leads:v}))} placeholder="https://docs.google.com/..."/>
                    <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4}}><Btn onClick={()=>setEditMode(false)} variant='ghost'>Cancelar</Btn><Btn onClick={salvarEdicao} variant='primary' disabled={saving}>{saving?'Salvando...':'Salvar alterações'}</Btn></div>
                  </div>
                ):(
                  <div>
                    <table style={{width:'100%',fontSize:13,borderCollapse:'collapse',marginBottom:10}}><tbody>{[['Especialidade',aluno.especialidade],['Clínica',aluno.clinica],['Cidade',aluno.cidade],['WhatsApp',aluno.whatsapp,'var(--accent-text)'],['Início',fd(aluno.data_entrada)],['Término previsto',fd(aluno.data_fim_prevista)],['Consultor',aluno.consultor_nome],['Turma',aluno.turma_nome],['Status',STATUS_ALUNO[aluno.status_aluno]?.label||'—']].map(([k,v,color])=>(<tr key={k}><td style={{padding:'7px 0',color:'var(--muted)',borderBottom:'1px solid var(--border)',width:'45%'}}>{k}</td><td style={{padding:'7px 0',fontWeight:600,textAlign:'right',borderBottom:'1px solid var(--border)',color:color||'var(--text)'}}>{v||'—'}</td></tr>))}</tbody></table>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      {aluno.url_planilha_financeiro&&<a href={aluno.url_planilha_financeiro} target="_blank" rel="noreferrer" style={{fontSize:12,fontWeight:600,padding:'5px 12px',borderRadius:7,background:'#dcfce7',color:'#14532d',border:'1px solid #86efac',textDecoration:'none',display:'flex',alignItems:'center',gap:5}}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>Planilha Financeiro</a>}
                      {aluno.url_planilha_leads&&<a href={aluno.url_planilha_leads} target="_blank" rel="noreferrer" style={{fontSize:12,fontWeight:600,padding:'5px 12px',borderRadius:7,background:'#ede9fe',color:'#2e1065',border:'1px solid #c4b5fd',textDecoration:'none',display:'flex',alignItems:'center',gap:5}}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>Planilha Leads</a>}
                      {!aluno.url_planilha_financeiro&&!aluno.url_planilha_leads&&<span style={{fontSize:12,color:'var(--muted)',fontStyle:'italic'}}>Nenhuma planilha vinculada</span>}
                    </div>
                  </div>
                )}
              </div>
              {historico.length>0&&(<div style={psec}><div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Histórico de status churn</div><div style={{paddingLeft:16,position:'relative'}}><div style={{position:'absolute',left:4,top:4,bottom:4,width:1.5,background:'var(--border)'}}/>{historico.map(h=>{const hc=cs(h.cor_nova);return(<div key={h.id} style={{position:'relative',marginBottom:12}}><div style={{position:'absolute',left:-14,top:4,width:8,height:8,borderRadius:'50%',background:hc.dot,border:`2px solid ${hc.border}`}}/><div style={{fontSize:10,color:'var(--muted)',fontFamily:'var(--mono)',marginBottom:2}}>{fd(h.criado_em?.split('T')[0])}</div><div style={{fontSize:12,color:'var(--text2)',lineHeight:1.4}}><strong style={{color:hc.text}}>{hc.label}</strong> · score {Math.round(h.score_novo)}%{h.cor_anterior&&<span style={{color:'var(--muted)'}}> (era {cs(h.cor_anterior).label})</span>}</div></div>)})}</div></div>)}
            </>)}

            {tab==='encontros'&&(
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',fontFamily:'var(--mono)'}}>Calendário do curso</div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{Object.entries(PRESENCA_STATUS).map(([k,v])=>(<span key={k} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:v.text}}><span style={{width:8,height:8,borderRadius:2,background:v.bg,border:`1px solid ${v.border}`,display:'inline-block'}}/>{v.label}</span>))}</div>
                </div>
                {turmaAulas.length===0?(<div style={{textAlign:'center',padding:'30px 0',color:'var(--muted)',fontSize:13}}>Sem encontros cadastrados</div>):(
                  <div style={{display:'flex',flexDirection:'column',gap:7}}>{turmaAulas.map(au=>{
                    const st=presMap[au.id];const ps=PRESENCA_STATUS[st]||{bg:'var(--surface2)',text:'var(--muted)',border:'var(--border)',label:'—'}
                    const is1x1=au.tema?.toLowerCase().includes('1:1')||au.tema?.toLowerCase().includes('presencial')
                    const reuniaoVinculada=reunioes.find(r=>r.data_reuniao===au.data_aula)
                    return(<div key={au.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'11px 13px',background:ps.bg+'33',borderRadius:9,border:`1px solid ${ps.border}`}}>
                      <div style={{width:32,height:32,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,fontFamily:'var(--mono)',flexShrink:0,background:ps.bg,color:ps.text,border:`1.5px solid ${ps.border}`}}>{is1x1?'1:1':au.numero}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}><div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{au.tema}</div>{is1x1&&<span style={{fontSize:10,fontWeight:600,padding:'1px 7px',borderRadius:20,background:'#ede9fe',color:'#2e1065',border:'1px solid #c4b5fd',flexShrink:0}}>1:1</span>}</div>
                        <div style={{fontSize:11,color:'var(--muted)'}}>{fd(au.data_aula)}</div>
                        {reuniaoVinculada&&(<div style={{marginTop:6,padding:'6px 9px',background:'var(--accent-dim)',borderRadius:6,border:'1px solid #bfdbfe'}}><div style={{fontSize:10,fontWeight:600,color:'var(--accent-text)',marginBottom:2}}>{TIPOS_REUNIAO.find(t=>t.value===reuniaoVinculada.tipo)?.label||reuniaoVinculada.tipo}</div><div style={{fontSize:11,color:'var(--text2)',lineHeight:1.4}}>{reuniaoVinculada.resumo?.slice(0,120)}{reuniaoVinculada.resumo?.length>120?'…':''}</div></div>)}
                      </div>
                      <span style={{fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,flexShrink:0,background:ps.bg,color:ps.text,border:`1px solid ${ps.border}`}}>{ps.label}</span>
                    </div>)
                  })}</div>
                )}
              </div>
            )}

            {tab==='reunioes'&&(<>
              <div style={{background:'var(--accent-dim)',border:'1px solid #bfdbfe',borderRadius:10,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--accent-text)',marginBottom:12}}>Registrar reunião individual</div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><Input label="Data" type="date" value={novaReuniao.data_reuniao} onChange={v=>setNovaReuniao(r=>({...r,data_reuniao:v}))} required/><SelectField label="Consultor" value={novaReuniao.consultor_id} onChange={v=>setNovaReuniao(r=>({...r,consultor_id:v}))} options={consultores.map(c=>({value:c.id,label:c.nome}))}/></div>
                  <SelectField label="Tipo de reunião" value={novaReuniao.tipo} onChange={v=>setNovaReuniao(r=>({...r,tipo:v}))} required options={TIPOS_REUNIAO}/>
                  <Textarea label="Resumo" value={novaReuniao.resumo} onChange={v=>setNovaReuniao(r=>({...r,resumo:v}))} rows={4} placeholder="O que foi discutido, decisões tomadas, próximos passos..."/>
                  <div style={{display:'flex',justifyContent:'flex-end'}}><Btn onClick={salvarReuniao} variant='primary' disabled={savingReuniao||!novaReuniao.data_reuniao||!novaReuniao.resumo.trim()}>{savingReuniao?'Salvando...':'Salvar reunião'}</Btn></div>
                </div>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Histórico ({reunioes.length})</div>
                {reunioes.length===0?(<div style={{textAlign:'center',padding:'24px 0',color:'var(--muted)',fontSize:13}}>Nenhuma reunião registrada</div>):reunioes.map(r=>(<div key={r.id} style={{padding:'12px 14px',background:'var(--surface2)',borderRadius:9,marginBottom:8,border:'1px solid var(--border)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6,gap:8,flexWrap:'wrap'}}><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:12,fontFamily:'var(--mono)',fontWeight:500,color:'var(--text2)'}}>{fd(r.data_reuniao)}</span><span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:20,background:'var(--accent-dim)',color:'var(--accent-text)',border:'1px solid #bfdbfe'}}>{TIPOS_REUNIAO.find(t=>t.value===r.tipo)?.label||r.tipo}</span></div>{r.consultores?.nome&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'var(--surface2)',color:'var(--text2)',fontWeight:500,border:'1px solid var(--border)'}}>{r.consultores.nome}</span>}</div><div style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>{r.resumo||<em style={{color:'var(--muted)'}}>Sem resumo</em>}</div></div>))}
              </div>
            </>)}

            {tab==='cs'&&(<>
              <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#14532d',marginBottom:12}}>Registrar contato CS</div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><Input label="Data do contato" type="date" value={novoContato.data_contato} onChange={v=>setNovoContato(c=>({...c,data_contato:v}))} required/><SelectField label="Responsável" value={novoContato.consultor_id} onChange={v=>setNovoContato(c=>({...c,consultor_id:v}))} options={consultores.map(c=>({value:c.id,label:c.nome}))}/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><SelectField label="Status na época" value={novoContato.churn_status_na_epoca} onChange={v=>setNovoContato(c=>({...c,churn_status_na_epoca:v}))} options={[{value:'verde',label:'Verde'},{value:'laranja',label:'Laranja'},{value:'vermelho',label:'Vermelho'},{value:'roxo',label:'Roxo'}]}/><Input label="Data de follow-up" type="date" value={novoContato.data_fup} onChange={v=>setNovoContato(c=>({...c,data_fup:v}))}/></div>
                  <Textarea label="Descrição do contato" value={novoContato.descricao} onChange={v=>setNovoContato(c=>({...c,descricao:v}))} rows={3} required placeholder="O que foi discutido, resultado do contato..."/>
                  <div style={{display:'flex',justifyContent:'flex-end'}}><Btn onClick={salvarContato} variant='primary' disabled={savingContato||!novoContato.data_contato||!novoContato.descricao.trim()}>{savingContato?'Salvando...':'Registrar contato'}</Btn></div>
                </div>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Histórico ({contatos.length})</div>
                {contatos.length===0?(<div style={{textAlign:'center',padding:'24px 0',color:'var(--muted)',fontSize:13}}>Nenhum contato registrado</div>):contatos.map(ct=>{const hc=cs(ct.churn_status_na_epoca);return(<div key={ct.id} style={{padding:'12px 14px',background:'var(--surface2)',borderRadius:9,marginBottom:8,border:'1px solid var(--border)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6,gap:8,flexWrap:'wrap'}}><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:12,fontFamily:'var(--mono)',fontWeight:500,color:'var(--text2)'}}>{fd(ct.data_contato)}</span>{ct.churn_status_na_epoca&&<span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,background:hc.bg,color:hc.text,border:`1px solid ${hc.border}`}}>{hc.label}</span>}</div><div style={{display:'flex',alignItems:'center',gap:6}}>{ct.consultores?.nome&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'var(--surface2)',color:'var(--text2)',fontWeight:500,border:'1px solid var(--border)'}}>{ct.consultores.nome}</span>}{ct.data_fup&&<span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:20,background:'#fff7ed',color:'#7c2d12',border:'1px solid #fdba74'}}>FUP {fd(ct.data_fup)}</span>}</div></div><div style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>{ct.descricao}</div></div>)})}
              </div>
            </>)}

            {tab==='notas'&&(<>
              <div style={{display:'flex',flexDirection:'column',gap:10}}><Textarea label="Nova nota interna" value={novaNota} onChange={setNovaNota} rows={3} placeholder="Observações, contexto, próximos passos..."/><div style={{display:'flex',justifyContent:'flex-end'}}><Btn onClick={salvarNota} variant='primary' disabled={savingNota||!novaNota.trim()}>{savingNota?'Salvando...':'Adicionar nota'}</Btn></div></div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10,fontFamily:'var(--mono)'}}>Notas ({notas.length})</div>
                {notas.length===0?(<div style={{textAlign:'center',padding:'24px 0',color:'var(--muted)',fontSize:13}}>Nenhuma nota</div>):notas.map(n=>(<div key={n.id} style={{padding:'11px 13px',background:'var(--surface2)',borderRadius:9,marginBottom:8,border:'1px solid var(--border)'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:11,fontFamily:'var(--mono)',fontWeight:500,color:'var(--muted)'}}>{fd(n.created_at?.split('T')[0])}</span>{n.consultores?.nome&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'var(--accent-dim)',color:'var(--accent-text)',fontWeight:600}}>{n.consultores.nome}</span>}</div><div style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>{n.conteudo}</div></div>))}
              </div>
            </>)}
          </div>
        </div>
      </div>
      {statusModal&&(<StatusChangeModal aluno={aluno} novoStatus={statusModal} consultores={consultores} onClose={()=>setStatusModal(null)} onConfirm={()=>{setStatusModal(null);setEditMode(false);onUpdate()}}/>)}
    </>
  )
}

// ─── Modal novo aluno ────────────────────────────────────────────────

function NovoAlunoModal({ consultores, turmas, onClose, onSaved }) {
  const [form, setForm] = useState({nome:'',email:'',whatsapp:'',especialidade:'',clinica:'',cidade:'',consultor_id:'',turma_id:'',data_entrada:new Date().toISOString().split('T')[0],url_planilha_financeiro:'',url_planilha_leads:''})
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar() {
    if (!form.nome.trim()||!form.consultor_id||!form.turma_id||!form.data_entrada){setErro('Preencha nome, consultor, turma e data de entrada.');return}
    setSaving(true);setErro('')
    const dataFim=new Date(form.data_entrada);dataFim.setFullYear(dataFim.getFullYear()+1)
    const{error}=await supabase.from('alunos').insert({nome:form.nome.trim(),email:form.email.trim()||null,whatsapp:form.whatsapp.trim()||null,especialidade:form.especialidade.trim()||null,clinica:form.clinica.trim()||null,cidade:form.cidade.trim()||null,consultor_id:form.consultor_id,turma_id:form.turma_id,data_entrada:form.data_entrada,data_fim_prevista:dataFim.toISOString().split('T')[0],status:'ativo',url_planilha_financeiro:form.url_planilha_financeiro||null,url_planilha_leads:form.url_planilha_leads||null})
    setSaving(false)
    if(error){setErro('Erro: '+error.message);return}
    onSaved()
  }

  return(
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
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4,borderTop:'1px solid var(--border)'}}><Btn onClick={onClose} variant='ghost'>Cancelar</Btn><Btn onClick={salvar} variant='primary' disabled={saving}>{saving?'Cadastrando...':'Cadastrar aluno'}</Btn></div>
    </Modal>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────

function Dashboard({ alunos, turmas, filterTurma, setFilterTurma, filterChurn, setFilterChurn, search, setSearch, onSelectAluno }) {
  const filtered=alunos.filter(a=>{if(filterTurma&&a.turma_id!==filterTurma)return false;if(filterChurn&&a.churn_cor!==filterChurn)return false;if(search&&!a.nome.toLowerCase().includes(search.toLowerCase()))return false;return true})
  const counts={verde:0,laranja:0,vermelho:0,roxo:0}
  alunos.forEach(a=>{if(a.churn_cor&&counts[a.churn_cor]!==undefined)counts[a.churn_cor]++})
  const contatosHoje=alunos.filter(a=>a.proximo_fup&&new Date(a.proximo_fup+'T12:00:00')<=new Date()).length
  const selStyle={fontSize:12,padding:'6px 10px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none',cursor:'pointer',fontWeight:500}

  return(<>
    <div style={{padding:'13px 22px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
      <div><div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>Dashboard</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{alunos.filter(a=>a.status_aluno==='ativo').length} ativos · {alunos.filter(a=>a.status_aluno==='pausado').length} pausados · {turmas.length} turma{turmas.length!==1?'s':''}</div></div>
      <div style={{display:'flex',gap:8}}><select value={filterTurma} onChange={e=>setFilterTurma(e.target.value)} style={selStyle}><option value="">Todas as turmas</option>{turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}</select><select value={filterChurn} onChange={e=>setFilterChurn(e.target.value)} style={selStyle}><option value="">Todos os status</option>{['verde','laranja','vermelho','roxo'].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginBottom:20}}>
        {[{label:'Total ativo',val:alunos.filter(a=>a.status_aluno==='ativo').length,color:'var(--text)'},{label:'Verde',val:counts.verde,color:'#15803d'},{label:'Laranja',val:counts.laranja,color:'#c2410c'},{label:'Vermelho',val:counts.vermelho,color:'#dc2626'},{label:'Roxo',val:counts.roxo,color:'#7c3aed'},{label:'FUPs vencidos',val:contatosHoje,color:'#c2410c',urgent:contatosHoje>0}].map(m=>(<div key={m.label} style={{background:m.urgent?'#fff7ed':'var(--surface)',border:`1px solid ${m.urgent?'#fdba74':'var(--border)'}`,borderRadius:10,padding:'13px 16px'}}><div style={{fontSize:10,color:'var(--muted)',marginBottom:5,fontWeight:500,textTransform:'uppercase',letterSpacing:'0.04em'}}>{m.label}</div><div style={{fontSize:22,fontWeight:700,color:m.color}}>{m.val}</div></div>))}
      </div>
      <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
        {[{id:'',label:'Todas'},...turmas.map(t=>({id:t.id,label:`${t.nome} (${alunos.filter(a=>a.turma_id===t.id).length})`}))].map(t=>(<button key={t.id} onClick={()=>setFilterTurma(t.id)} style={{fontSize:12,fontWeight:500,padding:'5px 14px',borderRadius:20,border:`1.5px solid ${filterTurma===t.id?'var(--accent)':'var(--border2)'}`,background:filterTurma===t.id?'var(--accent)':'var(--surface)',color:filterTurma===t.id?'#fff':'var(--text2)',cursor:'pointer'}}>{t.label}</button>))}
      </div>
      <div style={{marginBottom:16}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar aluno..." style={{fontSize:13,padding:'7px 12px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:8,color:'var(--text)',outline:'none',width:220}}/></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(235px,1fr))',gap:10}}>
        {filtered.map(a=>{const cst=cs(a.churn_cor);return(
          <div key={a.id} onClick={()=>onSelectAluno(a.id)} onMouseEnter={e=>{e.currentTarget.style.borderColor=cst.border;e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none'}} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:14,cursor:'pointer',transition:'all 0.18s',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:cst.dot,borderRadius:'12px 12px 0 0'}}/>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}><div style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,background:cst.bg,color:cst.text,border:`1.5px solid ${cst.border}`}}>{ini(a.nome)}</div><div><div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1.3}}>{a.nome}</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{a.turma_nome} · {a.consultor_nome}</div></div></div>
            <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}><Badge cor={a.churn_cor}/>{a.status_aluno!=='ativo'&&<StatusBadge status={a.status_aluno}/>}{a.proximo_fup&&<span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,background:'#fff7ed',color:'#7c2d12',border:'1px solid #fdba74'}}>FUP {fd(a.proximo_fup)}</span>}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:10,paddingTop:10,borderTop:'1px solid var(--border)'}}>
              {[{label:'Aulas',val:`${a.aulas_presentes??0}/${a.total_aulas_realizadas??0}`},{label:'Reuniões',val:a.total_reunioes??0},{label:'Leads',val:a.leads_preenchido?'Sim':'Não',ok:a.leads_preenchido},{label:'Financeiro',val:a.financeiro_preenchido?'Sim':'Não',ok:a.financeiro_preenchido}].map(st=>(<div key={st.label} style={{fontSize:11,color:'var(--muted)'}}><strong style={{display:'block',fontSize:12,fontWeight:600,color:st.ok===false?'#dc2626':st.ok===true?'#15803d':'var(--text2)',fontFamily:'var(--mono)'}}>{st.val}</strong>{st.label}</div>))}
            </div>
          </div>
        )})}
      </div>
    </div>
  </>)
}

// ─── Módulo Alunos ────────────────────────────────────────────────────

function AlunosModule({ alunos, turmas, consultores, onSelectAluno, onNovoAluno }) {
  const [view, setView] = useState('cards')
  const [search, setSearch] = useState('')
  const [filterTurma, setFilterTurma] = useState('')
  const [filterStatus, setFilterStatus] = useState('ativo')
  const selStyle={fontSize:12,padding:'6px 10px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none',cursor:'pointer',fontWeight:500}
  const filtered=alunos.filter(a=>{if(filterStatus&&a.status_aluno!==filterStatus)return false;if(filterTurma&&a.turma_id!==filterTurma)return false;if(search&&!a.nome.toLowerCase().includes(search.toLowerCase()))return false;return true})

  return(<>
    <div style={{padding:'13px 22px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
      <div><div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>Alunos</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{filtered.length} exibidos</div></div>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{fontSize:12,padding:'6px 10px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none',width:160}}/>
        <select value={filterTurma} onChange={e=>setFilterTurma(e.target.value)} style={selStyle}><option value="">Todas as turmas</option>{turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}</select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={selStyle}><option value="ativo">Ativos</option><option value="pausado">Pausados</option><option value="churn">Churn</option><option value="">Todos</option></select>
        <div style={{display:'flex',border:'1.5px solid var(--border2)',borderRadius:8,overflow:'hidden'}}>{[{id:'cards',icon:'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z'},{id:'lista',icon:'M4 6h16M4 12h16M4 18h16'}].map(v=>(<button key={v.id} onClick={()=>setView(v.id)} style={{padding:'6px 10px',border:'none',background:view===v.id?'var(--accent)':'var(--surface)',cursor:'pointer',transition:'all 0.15s'}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={view===v.id?'#fff':'var(--muted)'} strokeWidth="2"><path d={v.icon}/></svg></button>))}</div>
        <Btn onClick={onNovoAluno} variant='primary' style={{fontSize:12,padding:'6px 14px'}}>+ Novo aluno</Btn>
      </div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
      {filtered.length===0?(<div style={{textAlign:'center',padding:40,color:'var(--muted)',fontSize:13}}>Nenhum aluno encontrado</div>)
      :view==='cards'?(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(235px,1fr))',gap:10}}>
          {filtered.map(a=>{const cst=cs(a.churn_cor);return(<div key={a.id} onClick={()=>onSelectAluno(a.id)} onMouseEnter={e=>{e.currentTarget.style.borderColor=cst.border;e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none'}} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:14,cursor:'pointer',transition:'all 0.18s',position:'relative',overflow:'hidden'}}><div style={{position:'absolute',top:0,left:0,right:0,height:3,background:cst.dot,borderRadius:'12px 12px 0 0'}}/><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}><div style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,background:cst.bg,color:cst.text,border:`1.5px solid ${cst.border}`}}>{ini(a.nome)}</div><div><div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1.3}}>{a.nome}</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{a.turma_nome} · {a.consultor_nome}</div></div></div><div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}><Badge cor={a.churn_cor}/>{a.status_aluno!=='ativo'&&<StatusBadge status={a.status_aluno}/>}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:10,paddingTop:10,borderTop:'1px solid var(--border)'}}>{[{label:'Especialidade',val:a.especialidade||'—'},{label:'Cidade',val:a.cidade||'—'},{label:'Reuniões',val:a.total_reunioes??0},{label:'Aulas',val:`${a.aulas_presentes??0}/${a.total_aulas_realizadas??0}`}].map(st=>(<div key={st.label} style={{fontSize:11,color:'var(--muted)'}}><strong style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',fontFamily:'var(--mono)'}}>{st.val}</strong>{st.label}</div>))}</div></div>)})}
        </div>
      ):(
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:'var(--surface2)',borderBottom:'1px solid var(--border)'}}>{['Aluno','Especialidade','Turma','Consultor','Churn','Status','FUP'].map(h=>(<th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{h}</th>))}</tr></thead>
            <tbody>{filtered.map(a=>(<tr key={a.id} onClick={()=>onSelectAluno(a.id)} onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'} style={{borderBottom:'1px solid var(--border)',cursor:'pointer',transition:'background 0.1s'}}><td style={{padding:'11px 14px'}}><div style={{display:'flex',alignItems:'center',gap:9}}><div style={{width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,background:cs(a.churn_cor).bg,color:cs(a.churn_cor).text,border:`1px solid ${cs(a.churn_cor).border}`}}>{ini(a.nome)}</div><div><div style={{fontWeight:600,color:'var(--text)'}}>{a.nome}</div><div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>{a.cidade||'—'}</div></div></div></td><td style={{padding:'11px 14px',color:'var(--text2)'}}>{a.especialidade||'—'}</td><td style={{padding:'11px 14px',color:'var(--text2)'}}>{a.turma_nome}</td><td style={{padding:'11px 14px',color:'var(--text2)'}}>{a.consultor_nome}</td><td style={{padding:'11px 14px'}}><Badge cor={a.churn_cor}/></td><td style={{padding:'11px 14px'}}><StatusBadge status={a.status_aluno}/></td><td style={{padding:'11px 14px',fontSize:11,color:a.proximo_fup?'#7c2d12':'var(--muted)',fontWeight:a.proximo_fup?600:400}}>{a.proximo_fup?fd(a.proximo_fup):'—'}</td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  </>)
}

// ─── Módulo Calendário ────────────────────────────────────────────────

function CalendarioModule({ turmas, aulas, alunos, presencas, onUpdate, onOpenBuilder }) {
  const [selectedTurma, setSelectedTurma] = useState(turmas[0]?.id||'')
  const [selectedAula, setSelectedAula] = useState(null)
  const [savingPresenca, setSavingPresenca] = useState(false)
  const [editPresenca, setEditPresenca] = useState({})
  const [showNovaAula, setShowNovaAula] = useState(false)
  const [novaAula, setNovaAula] = useState({numero:'',tema:'',data_aula:'',status:'futura'})
  const [savingAula, setSavingAula] = useState(false)

  const turmaAulas=aulas.filter(a=>a.turma_id===selectedTurma).sort((a,b)=>a.numero-b.numero)
  const turmaAlunos=alunos.filter(a=>a.turma_id===selectedTurma&&a.status_aluno!=='inativo')
  const presMap={}
  presencas.filter(p=>turmaAlunos.some(a=>a.id===p.aluno_id)).forEach(p=>{if(!presMap[p.aula_id])presMap[p.aula_id]={};presMap[p.aula_id][p.aluno_id]=p.status})

  function getAulaStats(aulaId){const ap=presMap[aulaId]||{};const presentes=Object.values(ap).filter(v=>v==='presente').length;const total=turmaAlunos.length;return{presentes,total,pct:total>0?Math.round(presentes/total*100):0}}
  function initEditPresenca(aulaId){const ap=presMap[aulaId]||{};const init={};turmaAlunos.forEach(a=>{init[a.id]=ap[a.id]||null});setEditPresenca(init);setSelectedAula(aulaId)}

  async function salvarPresenca(){
    if(!selectedAula)return;setSavingPresenca(true)
    for(const[alunoId,status]of Object.entries(editPresenca)){
      if(!status)continue
      const existing=presencas.find(p=>p.aluno_id===alunoId&&p.aula_id===selectedAula)
      if(existing){await supabase.from('presencas').update({status}).eq('id',existing.id)}
      else{await supabase.from('presencas').insert({aluno_id:alunoId,aula_id:selectedAula,status})}
    }
    setSavingPresenca(false);setSelectedAula(null);onUpdate()
  }

  async function salvarAula(){
    if(!novaAula.tema.trim()||!novaAula.data_aula||!novaAula.numero)return;setSavingAula(true)
    await supabase.from('aulas').insert({turma_id:selectedTurma,numero:parseInt(novaAula.numero),tema:novaAula.tema.trim(),data_aula:novaAula.data_aula,status:novaAula.status})
    setNovaAula({numero:'',tema:'',data_aula:'',status:'futura'});setSavingAula(false);setShowNovaAula(false);onUpdate()
  }

  async function toggleAulaStatus(aulaId,currentStatus){
    const next=currentStatus==='futura'?'proxima':currentStatus==='proxima'?'realizada':'futura'
    await supabase.from('aulas').update({status:next}).eq('id',aulaId);onUpdate()
  }

  const STATUS_AULA={realizada:{bg:'#dcfce7',text:'#14532d',border:'#86efac',label:'Realizada'},proxima:{bg:'#eff6ff',text:'#1d4ed8',border:'#bfdbfe',label:'Próxima'},futura:{bg:'var(--surface2)',text:'var(--muted)',border:'var(--border)',label:'Futura'},cancelada:{bg:'#fef2f2',text:'#7f1d1d',border:'#fca5a5',label:'Cancelada'}}

  return(<>
    <div style={{padding:'13px 22px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
      <div><div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>Calendário</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{turmaAulas.length} encontros · {turmaAlunos.length} alunos</div></div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <select value={selectedTurma} onChange={e=>{setSelectedTurma(e.target.value);setSelectedAula(null)}} style={{fontSize:12,padding:'6px 10px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:7,color:'var(--text)',outline:'none',cursor:'pointer',fontWeight:500}}>{turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}</select>
        <Btn onClick={()=>setShowNovaAula(true)} variant='primary' style={{fontSize:12,padding:'6px 14px'}}>+ Novo encontro</Btn>
        <Btn onClick={onOpenBuilder} variant='default' style={{fontSize:12,padding:'6px 14px'}}>🗓 Montar calendário</Btn>
      </div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'18px 22px',display:'grid',gridTemplateColumns:'minmax(0,1fr) 320px',gap:16,alignItems:'start'}}>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:12,fontFamily:'var(--mono)'}}>Encontros da turma</div>
        {turmaAulas.length===0?(<div style={{textAlign:'center',padding:'40px 0',color:'var(--muted)',fontSize:13}}>Nenhum encontro cadastrado</div>):(
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {turmaAulas.map(au=>{
              const sa=STATUS_AULA[au.status]||STATUS_AULA.futura
              const stats=getAulaStats(au.id)
              const isSelected=selectedAula===au.id
              const is1x1=au.tema?.toLowerCase().includes('1:1')||au.tema?.toLowerCase().includes('presencial')
              const pctColor=stats.pct>=75?'#15803d':stats.pct>=50?'#c2410c':'#dc2626'
              return(<div key={au.id} style={{background:isSelected?'#eff6ff':'var(--surface)',border:`1px solid ${isSelected?'#bfdbfe':'var(--border)'}`,borderRadius:12,padding:'13px 16px',transition:'all 0.15s'}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:36,height:36,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,fontFamily:'var(--mono)',flexShrink:0,background:sa.bg,color:sa.text,border:`1.5px solid ${sa.border}`}}>{is1x1?'1:1':au.numero}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}><div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{au.tema}</div>{is1x1&&<span style={{fontSize:10,fontWeight:600,padding:'1px 7px',borderRadius:20,background:'#ede9fe',color:'#2e1065',border:'1px solid #c4b5fd',flexShrink:0}}>1:1</span>}</div>
                    <div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:11,color:'var(--muted)'}}>{fdFull(au.data_aula)}</span>{au.status==='realizada'&&(<div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:60,height:4,background:'var(--surface2)',borderRadius:2,overflow:'hidden',border:'1px solid var(--border)'}}><div style={{height:'100%',background:pctColor,width:`${stats.pct}%`,borderRadius:2}}/></div><span style={{fontSize:10,fontWeight:600,color:pctColor,fontFamily:'var(--mono)'}}>{stats.pct}%</span><span style={{fontSize:10,color:'var(--muted)'}}>{stats.presentes}/{stats.total}</span></div>)}</div>
                  </div>
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button onClick={()=>toggleAulaStatus(au.id,au.status)} style={{fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:7,cursor:'pointer',background:sa.bg,color:sa.text,border:`1px solid ${sa.border}`,transition:'all 0.15s'}}>{sa.label}</button>
                    {au.status!=='futura'&&(<Btn onClick={()=>isSelected?setSelectedAula(null):initEditPresenca(au.id)} variant={isSelected?'primary':'default'} style={{fontSize:11,padding:'4px 10px'}}>{isSelected?'Fechar':'Presença'}</Btn>)}
                  </div>
                </div>
              </div>)
            })}
          </div>
        )}
      </div>

      <div style={{position:'sticky',top:0}}>
        {selectedAula?(()=>{
          const aula=turmaAulas.find(a=>a.id===selectedAula)
          return(<div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
            <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',background:'#eff6ff'}}><div style={{fontSize:13,fontWeight:700,color:'var(--accent-text)'}}>{aula?.tema}</div><div style={{fontSize:11,color:'#3b82f6',marginTop:2}}>{fd(aula?.data_aula)} · Registro de presença</div></div>
            <div style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',display:'flex',gap:6,flexWrap:'wrap'}}>
              {['presente','faltou','reset','link'].map(s=>{const ps=PRESENCA_STATUS[s];return(<button key={s} onClick={()=>{const n={};turmaAlunos.forEach(a=>{n[a.id]=s});setEditPresenca(n)}} style={{fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:7,cursor:'pointer',background:ps.bg,color:ps.text,border:`1px solid ${ps.border}`}}>Todos: {ps.label}</button>)})}
            </div>
            <div style={{maxHeight:360,overflowY:'auto'}}>
              {turmaAlunos.map(a=>{const cur=editPresenca[a.id];const cst=cs(a.churn_cor);return(<div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:'1px solid var(--border)'}}><div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,background:cst.bg,color:cst.text,border:`1px solid ${cst.border}`}}>{ini(a.nome)}</div><div style={{flex:1,fontSize:12,fontWeight:500,color:'var(--text)',minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.nome}</div><div style={{display:'flex',gap:4,flexShrink:0}}>{Object.entries(PRESENCA_STATUS).filter(([k])=>k!=='churn').map(([k,v])=>(<button key={k} onClick={()=>setEditPresenca(ep=>({...ep,[a.id]:k}))} style={{width:24,height:24,borderRadius:5,border:`1.5px solid ${cur===k?v.border:'var(--border)'}`,background:cur===k?v.bg:'transparent',cursor:'pointer',fontSize:9,fontWeight:700,color:cur===k?v.text:'var(--muted)',transition:'all 0.1s'}}>{k==='presente'?'P':k==='faltou'?'F':k==='reset'?'R':'L'}</button>))}</div></div>)})}
            </div>
            <div style={{padding:'12px 14px',display:'flex',gap:8,justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,color:'var(--muted)'}}>{Object.values(editPresenca).filter(v=>v==='presente').length} presentes · {Object.values(editPresenca).filter(v=>v==='faltou').length} faltaram</span>
              <Btn onClick={salvarPresenca} variant='primary' disabled={savingPresenca} style={{fontSize:12}}>{savingPresenca?'Salvando...':'Salvar presença'}</Btn>
            </div>
          </div>)
        })():(
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'30px 20px',textAlign:'center'}}><div style={{fontSize:13,color:'var(--muted)',marginBottom:6}}>Nenhum encontro selecionado</div><div style={{fontSize:11,color:'var(--muted)'}}>Clique em "Presença" para registrar</div></div>
        )}
        {turmaAulas.some(a=>a.status==='realizada')&&(
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'16px',marginTop:12}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:12,fontFamily:'var(--mono)'}}>Presença por aluno</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {turmaAlunos.slice(0,8).map(a=>{
                const ap=Object.entries(presMap).filter(([aulaId])=>turmaAulas.some(au=>au.id===aulaId&&au.status==='realizada'))
                const presentes=ap.filter(([,v])=>v[a.id]==='presente').length
                const total=ap.length;const pct=total>0?Math.round(presentes/total*100):0
                const pctColor=pct>=75?'#15803d':pct>=50?'#c2410c':'#dc2626'
                return(<div key={a.id} style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,flexShrink:0,background:cs(a.churn_cor).bg,color:cs(a.churn_cor).text,border:`1px solid ${cs(a.churn_cor).border}`}}>{ini(a.nome)}</div><div style={{flex:1,fontSize:11,color:'var(--text2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.nome.split(' ')[0]} {a.nome.split(' ').slice(-1)[0]}</div><div style={{width:50,height:4,background:'var(--surface2)',borderRadius:2,overflow:'hidden',border:'1px solid var(--border)',flexShrink:0}}><div style={{height:'100%',background:pctColor,width:`${pct}%`,borderRadius:2}}/></div><span style={{fontSize:10,fontWeight:600,color:pctColor,fontFamily:'var(--mono)',minWidth:28,textAlign:'right'}}>{pct}%</span></div>)
              })}
              {turmaAlunos.length>8&&<div style={{fontSize:11,color:'var(--muted)',textAlign:'center'}}>+{turmaAlunos.length-8} alunos</div>}
            </div>
          </div>
        )}
      </div>
    </div>
    {showNovaAula&&(<Modal title="Novo encontro" onClose={()=>setShowNovaAula(false)} width={460}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Input label="Número" type="number" value={novaAula.numero} onChange={v=>setNovaAula(a=>({...a,numero:v}))} placeholder="Ex: 11" required/><Input label="Data" type="date" value={novaAula.data_aula} onChange={v=>setNovaAula(a=>({...a,data_aula:v}))} required/><div style={{gridColumn:'1/-1'}}><Input label="Tema / nome do encontro" value={novaAula.tema} onChange={v=>setNovaAula(a=>({...a,tema:v}))} placeholder="Ex: Aula 11, 1:1 - 5, Presencial..." required/></div><div style={{gridColumn:'1/-1'}}><SelectField label="Status inicial" value={novaAula.status} onChange={v=>setNovaAula(a=>({...a,status:v}))} options={[{value:'futura',label:'Futura'},{value:'proxima',label:'Próxima'},{value:'realizada',label:'Realizada'}]}/></div></div><div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4,borderTop:'1px solid var(--border)'}}><Btn onClick={()=>setShowNovaAula(false)} variant='ghost'>Cancelar</Btn><Btn onClick={salvarAula} variant='primary' disabled={savingAula||!novaAula.tema.trim()||!novaAula.data_aula||!novaAula.numero}>{savingAula?'Salvando...':'Adicionar encontro'}</Btn></div></Modal>)}
  </>)
}

// ─── Módulo Tarefas ───────────────────────────────────────────────────

function TarefasModule({ tarefas, consultores, alunos, turmas, templates, onUpdate }) {
  const [filterConsultor, setFilterConsultor] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterStatus, setFilterStatus] = useState('abertas')
  const [showNova, setShowNova] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [aplicarTurma, setAplicarTurma] = useState(null)
  const [nova, setNova] = useState({ descricao:'', consultor_id:'', aluno_id:'', tipo:'tarefa', prazo:'' })
  const [saving, setSaving] = useState(false)

  const TIPO_CORES = {
    tarefa:  { bg:'#eff6ff', text:'#1d4ed8', border:'#bfdbfe', label:'Tarefa' },
    churn:   { bg:'#fef2f2', text:'#7f1d1d', border:'#fca5a5', label:'Antichurn' },
    reuniao: { bg:'#f0fdf4', text:'#14532d', border:'#86efac', label:'Reunião' },
  }

  const filtered = tarefas.filter(t => {
    if (filterConsultor && t.consultor_id !== filterConsultor) return false
    if (filterTipo && t.tipo !== filterTipo) return false
    if (filterStatus === 'abertas' && t.concluida) return false
    if (filterStatus === 'concluidas' && !t.concluida) return false
    return true
  })

  // Agrupar por consultor
  const porConsultor = {}
  const consultoresComTarefas = filterConsultor
    ? consultores.filter(c => c.id === filterConsultor)
    : consultores
  consultoresComTarefas.forEach(c => { porConsultor[c.id] = { consultor: c, tarefas: [] } })
  filtered.forEach(t => {
    if (porConsultor[t.consultor_id]) porConsultor[t.consultor_id].tarefas.push(t)
  })

  const hoje = new Date().toISOString().split('T')[0]

  async function salvarNova() {
    if (!nova.descricao.trim() || !nova.consultor_id) return
    setSaving(true)
    await supabase.from('tarefas').insert({
      descricao: nova.descricao.trim(),
      consultor_id: nova.consultor_id,
      aluno_id: nova.aluno_id || null,
      tipo: nova.tipo,
      prazo: nova.prazo || null,
    })
    setNova({ descricao:'', consultor_id:'', aluno_id:'', tipo:'tarefa', prazo:'' })
    setSaving(false); setShowNova(false); onUpdate()
  }

  async function toggleConcluida(tarefa) {
    const concluida = !tarefa.concluida
    await supabase.from('tarefas').update({
      concluida,
      concluida_em: concluida ? new Date().toISOString() : null,
    }).eq('id', tarefa.id)
    onUpdate()
  }

  async function deletarTarefa(id) {
    await supabase.from('tarefas').delete().eq('id', id)
    onUpdate()
  }

  const selStyle = { fontSize:12, padding:'6px 10px', background:'var(--surface)', border:'1.5px solid var(--border2)', borderRadius:7, color:'var(--text)', outline:'none', cursor:'pointer', fontWeight:500 }

  const totalAbertas = tarefas.filter(t => !t.concluida).length
  const vencidas = tarefas.filter(t => !t.concluida && t.prazo && t.prazo < hoje).length

  return (<>
    {/* Header */}
    <div style={{padding:'13px 22px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap'}}>
      <div>
        <div style={{fontSize:16, fontWeight:700, color:'var(--text)'}}>Tarefas</div>
        <div style={{fontSize:11, color:'var(--muted)', marginTop:2}}>
          {totalAbertas} abertas
          {vencidas > 0 && <span style={{marginLeft:8, fontWeight:600, color:'#dc2626'}}>· {vencidas} vencidas</span>}
        </div>
      </div>
      <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
        <select value={filterConsultor} onChange={e=>setFilterConsultor(e.target.value)} style={selStyle}>
          <option value="">Todos os consultores</option>
          {consultores.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select value={filterTipo} onChange={e=>setFilterTipo(e.target.value)} style={selStyle}>
          <option value="">Todos os tipos</option>
          <option value="tarefa">Tarefa</option>
          <option value="churn">Antichurn</option>
          <option value="reuniao">Reunião</option>
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={selStyle}>
          <option value="abertas">Abertas</option>
          <option value="concluidas">Concluídas</option>
          <option value="todas">Todas</option>
        </select>
        <Btn onClick={()=>setShowNova(true)} variant='primary' style={{fontSize:12, padding:'6px 14px'}}>+ Nova tarefa</Btn>
        <Btn onClick={()=>setShowTemplates(true)} variant='default' style={{fontSize:12, padding:'6px 14px'}}>📋 Templates</Btn>
        <select value={aplicarTurma||''} onChange={e=>setAplicarTurma(e.target.value||null)}
          style={{fontSize:12,padding:'6px 10px',background:aplicarTurma?'var(--accent)':'var(--surface)',border:`1.5px solid ${aplicarTurma?'var(--accent)':'var(--border2)'}`,borderRadius:7,color:aplicarTurma?'#fff':'var(--text)',outline:'none',cursor:'pointer',fontWeight:500}}>
          <option value="">Aplicar templates...</option>
          {turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      </div>
    </div>

    {/* Colunas por consultor */}
    <div style={{flex:1, overflowX:'auto', overflowY:'auto', padding:'18px 22px'}}>
      <div style={{display:'flex', gap:14, alignItems:'flex-start', minWidth: 0}}>
        {Object.values(porConsultor).map(({ consultor, tarefas: tList }) => {
          const abertas = tList.filter(t => !t.concluida).length
          const venc = tList.filter(t => !t.concluida && t.prazo && t.prazo < hoje).length
          return (
            <div key={consultor.id} style={{flex:'1 1 0', minWidth:220, maxWidth:340}}>
              {/* Cabeçalho da coluna */}
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10, padding:'10px 12px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10}}>
                <div style={{width:32, height:32, borderRadius:'50%', background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--accent-text)', flexShrink:0}}>
                  {consultor.nome.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{consultor.nome}</div>
                  <div style={{fontSize:11, color:'var(--muted)'}}>{abertas} aberta{abertas!==1?'s':''}{venc>0&&<span style={{color:'#dc2626', fontWeight:600}}> · {venc} vencida{venc!==1?'s':''}</span>}</div>
                </div>
              </div>

              {/* Tarefas */}
              <div style={{display:'flex', flexDirection:'column', gap:7}}>
                {tList.length === 0 ? (
                  <div style={{textAlign:'center', padding:'20px 10px', color:'var(--muted)', fontSize:12, background:'var(--surface2)', borderRadius:9, border:'1px dashed var(--border2)'}}>
                    Sem tarefas
                  </div>
                ) : tList.map(t => {
                  const tc = TIPO_CORES[t.tipo] || TIPO_CORES.tarefa
                  const aluno = alunos.find(a => a.id === t.aluno_id)
                  const vencida = !t.concluida && t.prazo && t.prazo < hoje
                  const hoje_flag = !t.concluida && t.prazo && t.prazo === hoje
                  return (
                    <div key={t.id} style={{
                      background: t.concluida ? 'var(--surface2)' : 'var(--surface)',
                      border: `1px solid ${vencida ? '#fca5a5' : hoje_flag ? '#fdba74' : 'var(--border)'}`,
                      borderRadius:10, padding:'11px 13px',
                      opacity: t.concluida ? 0.65 : 1,
                      transition:'all 0.15s',
                    }}>
                      <div style={{display:'flex', alignItems:'flex-start', gap:8}}>
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleConcluida(t)}
                          style={{
                            width:18, height:18, borderRadius:5, flexShrink:0, marginTop:1,
                            border:`2px solid ${t.concluida ? '#16a34a' : 'var(--border2)'}`,
                            background: t.concluida ? '#16a34a' : 'transparent',
                            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                          }}
                        >
                          {t.concluida && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                        </button>
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{fontSize:12, fontWeight:500, color: t.concluida ? 'var(--muted)' : 'var(--text)', lineHeight:1.4, textDecoration: t.concluida ? 'line-through' : 'none', wordBreak:'break-word'}}>
                            {t.descricao}
                          </div>
                          <div style={{display:'flex', alignItems:'center', gap:6, marginTop:6, flexWrap:'wrap'}}>
                            <span style={{fontSize:10, fontWeight:600, padding:'1px 7px', borderRadius:20, background:tc.bg, color:tc.text, border:`1px solid ${tc.border}`}}>
                              {tc.label}
                            </span>
                            {aluno && (
                              <span style={{fontSize:10, color:'var(--muted)', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:100}}>
                                {aluno.nome.split(' ')[0]}
                              </span>
                            )}
                            {t.prazo && (
                              <span style={{fontSize:10, fontWeight:600, color: vencida ? '#dc2626' : hoje_flag ? '#c2410c' : 'var(--muted)', fontFamily:'var(--mono)'}}>
                                {vencida ? '⚠ ' : hoje_flag ? '⏰ ' : ''}{fd(t.prazo)}
                              </span>
                            )}
                          </div>
                          {t.concluida && t.concluida_em && (
                            <div style={{fontSize:10, color:'#16a34a', marginTop:4}}>✓ {fd(t.concluida_em.split('T')[0])}</div>
                          )}
                        </div>
                        {/* Deletar */}
                        <button onClick={()=>deletarTarefa(t.id)} style={{background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:14, padding:'0 2px', opacity:0.5, flexShrink:0}}
                          onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.5}>✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>

    {/* Modal nova tarefa */}
    {showNova && (
      <Modal title="Nova tarefa" onClose={()=>setShowNova(false)} width={480}>
        <SelectField label="Responsável *" value={nova.consultor_id} onChange={v=>setNova(n=>({...n,consultor_id:v}))} required
          options={consultores.map(c=>({value:c.id,label:c.nome}))}/>
        <Textarea label="Descrição *" value={nova.descricao} onChange={v=>setNova(n=>({...n,descricao:v}))} rows={3}
          placeholder="O que precisa ser feito..." required/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <SelectField label="Tipo" value={nova.tipo} onChange={v=>setNova(n=>({...n,tipo:v}))}
            options={[{value:'tarefa',label:'Tarefa'},{value:'churn',label:'Antichurn'},{value:'reuniao',label:'Reunião'}]}/>
          <Input label="Prazo" type="date" value={nova.prazo} onChange={v=>setNova(n=>({...n,prazo:v}))}/>
        </div>
        <SelectField label="Aluno relacionado (opcional)" value={nova.aluno_id} onChange={v=>setNova(n=>({...n,aluno_id:v}))}
          options={alunos.filter(a=>a.status_aluno==='ativo').map(a=>({value:a.id,label:a.nome}))}/>
        <div style={{display:'flex', gap:8, justifyContent:'flex-end', paddingTop:4, borderTop:'1px solid var(--border)'}}>
          <Btn onClick={()=>setShowNova(false)} variant='ghost'>Cancelar</Btn>
          <Btn onClick={salvarNova} variant='primary' disabled={saving||!nova.descricao.trim()||!nova.consultor_id}>
            {saving ? 'Salvando...' : 'Criar tarefa'}
          </Btn>
        </div>
      </Modal>
    )}
    {showTemplates && (
      <GerenciarTemplatesModal templates={templates} consultores={consultores}
        onClose={()=>setShowTemplates(false)} onUpdate={onUpdate}/>
    )}
    {aplicarTurma && (
      <AplicarTemplatesModal
        turma={turmas.find(t=>t.id===aplicarTurma)}
        aulas={[]} alunos={alunos} consultores={consultores} templates={templates}
        onClose={()=>setAplicarTurma(null)}
        onApplied={()=>{setAplicarTurma(null);onUpdate()}}
      />
    )}
  </>)
}

// ─── Modal: Aplicar templates a uma turma ────────────────────────────

function AplicarTemplatesModal({ turma, aulas, alunos, consultores, templates, onClose, onApplied }) {
  const turmaAlunos = alunos.filter(a => a.turma_id === turma.id && a.status_aluno === 'ativo')

  const [config, setConfig] = useState(() => {
    const c = {}
    templates.filter(t => t.ativo).forEach(t => {
      let prazoDefault = ''
      if (t.prazo_dias) {
        const d = new Date()
        d.setDate(d.getDate() + t.prazo_dias)
        prazoDefault = d.toISOString().split('T')[0]
      }
      c[t.id] = { selecionado: true, consultor_id: '', prazo: prazoDefault }
    })
    return c
  })
  const [applying, setApplying] = useState(false)
  const [resultado, setResultado] = useState(null)

  const TIPO_CORES = {
    tarefa:  { bg:'#eff6ff', text:'#1d4ed8', border:'#bfdbfe', label:'Tarefa' },
    churn:   { bg:'#fef2f2', text:'#7f1d1d', border:'#fca5a5', label:'Antichurn' },
    reuniao: { bg:'#f0fdf4', text:'#14532d', border:'#86efac', label:'Reunião' },
  }

  function toggleTemplate(id) {
    setConfig(c => ({ ...c, [id]: { ...c[id], selecionado: !c[id].selecionado } }))
  }
  function setConsultor(id, val) {
    setConfig(c => ({ ...c, [id]: { ...c[id], consultor_id: val } }))
  }
  function setPrazoVal(id, val) {
    setConfig(c => ({ ...c, [id]: { ...c[id], prazo: val } }))
  }
  function selectAll(val) {
    setConfig(c => {
      const n = { ...c }
      Object.keys(n).forEach(id => { n[id] = { ...n[id], selecionado: val } })
      return n
    })
  }

  const templatesSelecionados = templates.filter(t => config[t.id]?.selecionado)
  const totalSelecionados = templatesSelecionados.length
  const faltaConsultor = templatesSelecionados.filter(t => !config[t.id]?.consultor_id)
  const podeProsseguir = totalSelecionados > 0 && faltaConsultor.length === 0

  async function aplicar() {
    if (!podeProsseguir) return
    setApplying(true)
    let criadas = 0
    for (const template of templatesSelecionados) {
      const { consultor_id, prazo } = config[template.id]
      for (const aluno of turmaAlunos) {
        await supabase.from('tarefas').insert({
          aluno_id: aluno.id,
          turma_id: turma.id,
          consultor_id,
          descricao: template.titulo,
          tipo: template.tipo,
          prazo: prazo || null,
        })
        criadas++
      }
    }
    setApplying(false)
    setResultado({ criadas, alunos: turmaAlunos.length, templates: totalSelecionados })
  }

  return (
    <Modal title={`Aplicar templates — ${turma.nome}`} onClose={onClose} width={580}>
      {resultado ? (
        <div style={{textAlign:'center', padding:'10px 0'}}>
          <div style={{width:52,height:52,borderRadius:'50%',background:'#dcfce7',border:'1px solid #86efac',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#14532d" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <div style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:8}}>Tarefas criadas!</div>
          <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.9}}>
            <strong style={{color:'var(--text)'}}>{resultado.criadas}</strong> tarefas criadas<br/>
            <strong style={{color:'var(--text)'}}>{resultado.templates}</strong> template{resultado.templates!==1?'s':''} aplicado{resultado.templates!==1?'s':''}<br/>
            <strong style={{color:'var(--text)'}}>{resultado.alunos}</strong> aluno{resultado.alunos!==1?'s':''} da turma
          </div>
          <div style={{marginTop:20}}>
            <Btn onClick={()=>{onApplied();onClose()}} variant='primary'>Ver tarefas</Btn>
          </div>
        </div>
      ) : (<>
        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 14px',display:'flex',alignItems:'center',gap:12}}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{turma.nome}</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{turmaAlunos.length} aluno{turmaAlunos.length!==1?'s':''} ativo{turmaAlunos.length!==1?'s':''} · {totalSelecionados * turmaAlunos.length} tarefas serão criadas</div>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:10}}>
            <button onClick={()=>selectAll(true)} style={{fontSize:11,color:'var(--accent)',background:'none',border:'none',cursor:'pointer',fontWeight:500}}>Selecionar todos</button>
            <button onClick={()=>selectAll(false)} style={{fontSize:11,color:'var(--muted)',background:'none',border:'none',cursor:'pointer'}}>Limpar</button>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {templates.map(t => {
            const tc = TIPO_CORES[t.tipo] || TIPO_CORES.tarefa
            const cfg = config[t.id] || { selecionado:false, consultor_id:'', prazo:'' }
            const sel = cfg.selecionado
            const semConsultor = sel && !cfg.consultor_id

            return (
              <div key={t.id} style={{border:`1.5px solid ${sel?(semConsultor?'#fdba74':'var(--accent)'):'var(--border)'}`,background:sel?'var(--surface)':'var(--surface2)',borderRadius:11,overflow:'hidden',transition:'all 0.15s'}}>
                <div onClick={()=>toggleTemplate(t.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',cursor:'pointer'}}>
                  <div style={{width:18,height:18,borderRadius:5,flexShrink:0,border:`2px solid ${sel?'var(--accent)':'var(--border2)'}`,background:sel?'var(--accent)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
                    {sel&&<svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                      <span style={{fontSize:13,fontWeight:600,color:sel?'var(--text)':'var(--muted)'}}>{t.titulo}</span>
                      <span style={{fontSize:10,fontWeight:600,padding:'1px 7px',borderRadius:20,background:tc.bg,color:tc.text,border:`1px solid ${tc.border}`}}>{tc.label}</span>
                    </div>
                    <div style={{fontSize:11,color:'var(--muted)',marginTop:3,lineHeight:1.4}}>{t.descricao}</div>
                  </div>
                  {sel && semConsultor && (
                    <span style={{fontSize:10,fontWeight:600,color:'#c2410c',background:'#fff7ed',padding:'2px 8px',borderRadius:20,border:'1px solid #fdba74',flexShrink:0,whiteSpace:'nowrap'}}>falta responsável</span>
                  )}
                </div>
                {sel && (
                  <div style={{padding:'0 14px 14px',paddingTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,borderTop:'1px solid var(--border)'}} onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex',flexDirection:'column',gap:5}}>
                      <label style={{fontSize:11,fontWeight:600,color:'var(--text2)'}}>Responsável <span style={{color:'#dc2626'}}>*</span></label>
                      <select value={cfg.consultor_id} onChange={e=>setConsultor(t.id,e.target.value)}
                        style={{fontSize:12,padding:'7px 10px',background:'var(--surface)',border:`1.5px solid ${semConsultor?'#fdba74':'var(--border2)'}`,borderRadius:8,color:cfg.consultor_id?'var(--text)':'var(--muted)',outline:'none',width:'100%'}}>
                        <option value="">Selecionar...</option>
                        {consultores.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:5}}>
                      <label style={{fontSize:11,fontWeight:600,color:'var(--text2)'}}>
                        Prazo{t.prazo_dias&&<span style={{fontSize:10,color:'var(--muted)',fontWeight:400}}> (sugerido: +{t.prazo_dias}d)</span>}
                      </label>
                      <input type="date" value={cfg.prazo} onChange={e=>setPrazoVal(t.id,e.target.value)}
                        style={{fontSize:12,padding:'7px 10px',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:8,color:'var(--text)',outline:'none',width:'100%'}}/>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {faltaConsultor.length > 0 && (
          <div style={{background:'#fff7ed',border:'1px solid #fdba74',borderRadius:8,padding:'9px 12px',fontSize:12,color:'#7c2d12'}}>
            Preencha o responsável em {faltaConsultor.length > 1 ? `${faltaConsultor.length} templates` : `"${faltaConsultor[0].titulo}"`} para continuar.
          </div>
        )}

        <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4,borderTop:'1px solid var(--border)'}}>
          <Btn onClick={onClose} variant='ghost'>Cancelar</Btn>
          <Btn onClick={aplicar} variant='primary' disabled={applying||!podeProsseguir}>
            {applying?'Criando tarefas...':`Criar ${totalSelecionados * turmaAlunos.length} tarefas`}
          </Btn>
        </div>
      </>)}
    </Modal>
  )
}


// ─── Modal: Gerenciar biblioteca de templates ─────────────────────────

function GerenciarTemplatesModal({ templates, consultores, onClose, onUpdate }) {
  const [editando, setEditando] = useState(null) // null | 'novo' | template
  const [form, setForm] = useState({ titulo:'', descricao:'', tipo:'tarefa', atribuir_para:'consultor_aluno', consultor_fixo_id:'', prazo_dias:'', gatilho:'qualquer_aula' })
  const [saving, setSaving] = useState(false)

  const TIPO_CORES = {
    tarefa:  { bg:'#eff6ff', text:'#1d4ed8', border:'#bfdbfe', label:'Tarefa' },
    churn:   { bg:'#fef2f2', text:'#7f1d1d', border:'#fca5a5', label:'Antichurn' },
    reuniao: { bg:'#f0fdf4', text:'#14532d', border:'#86efac', label:'Reunião' },
  }

  function abrirNovo() {
    setForm({ titulo:'', descricao:'', tipo:'tarefa', atribuir_para:'consultor_aluno', consultor_fixo_id:'', prazo_dias:'', gatilho:'qualquer_aula' })
    setEditando('novo')
  }

  function abrirEdicao(t) {
    setForm({ titulo:t.titulo, descricao:t.descricao, tipo:t.tipo, atribuir_para:t.atribuir_para, consultor_fixo_id:t.consultor_fixo_id||'', prazo_dias:t.prazo_dias||'', gatilho:t.gatilho })
    setEditando(t)
  }

  async function salvar() {
    if (!form.titulo.trim()||!form.descricao.trim()) return
    setSaving(true)
    const payload = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      tipo: form.tipo,
      atribuir_para: form.atribuir_para,
      consultor_fixo_id: form.atribuir_para==='consultor_fixo'?form.consultor_fixo_id||null:null,
      prazo_dias: form.prazo_dias?parseInt(form.prazo_dias):null,
      gatilho: form.gatilho,
    }
    if (editando==='novo') {
      await supabase.from('tarefa_templates').insert(payload)
    } else {
      await supabase.from('tarefa_templates').update(payload).eq('id', editando.id)
    }
    setSaving(false); setEditando(null); onUpdate()
  }

  async function toggleAtivo(t) {
    await supabase.from('tarefa_templates').update({ ativo: !t.ativo }).eq('id', t.id)
    onUpdate()
  }

  async function deletar(id) {
    await supabase.from('tarefa_templates').delete().eq('id', id)
    onUpdate()
  }

  return (
    <Modal title="Biblioteca de templates" onClose={onClose} width={620}>
      {editando ? (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{editando==='novo'?'Novo template':'Editar template'}</div>
          <Input label="Título *" value={form.titulo} onChange={v=>setForm(f=>({...f,titulo:v}))} placeholder="Ex: Enviar link da gravação" required/>
          <Textarea label="Descrição *" value={form.descricao} onChange={v=>setForm(f=>({...f,descricao:v}))} rows={2} placeholder="O que deve ser feito..." required/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <SelectField label="Tipo" value={form.tipo} onChange={v=>setForm(f=>({...f,tipo:v}))}
              options={[{value:'tarefa',label:'Tarefa'},{value:'churn',label:'Antichurn'},{value:'reuniao',label:'Reunião'}]}/>
            <SelectField label="Gatilho" value={form.gatilho} onChange={v=>setForm(f=>({...f,gatilho:v}))}
              options={[{value:'qualquer_aula',label:'Qualquer aula'},{value:'aula_regular',label:'Aula regular'},{value:'aula_1:1',label:'Aula 1:1'},{value:'apos_aula',label:'Após aula'},{value:'pos_calendario',label:'Pós-calendário'}]}/>
            <SelectField label="Atribuir para" value={form.atribuir_para} onChange={v=>setForm(f=>({...f,atribuir_para:v}))}
              options={[{value:'consultor_aluno',label:'Consultor do aluno'},{value:'consultor_fixo',label:'Consultor fixo'},{value:'escolher_na_hora',label:'Escolher na hora'}]}/>
            <Input label="Prazo (dias após encontro)" type="number" value={String(form.prazo_dias)} onChange={v=>setForm(f=>({...f,prazo_dias:v}))} placeholder="Ex: 3"/>
          </div>
          {form.atribuir_para==='consultor_fixo'&&(
            <SelectField label="Consultor fixo *" value={form.consultor_fixo_id} onChange={v=>setForm(f=>({...f,consultor_fixo_id:v}))}
              options={consultores.map(c=>({value:c.id,label:c.nome}))}/>
          )}
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4,borderTop:'1px solid var(--border)'}}>
            <Btn onClick={()=>setEditando(null)} variant='ghost'>Cancelar</Btn>
            <Btn onClick={salvar} variant='primary' disabled={saving||!form.titulo.trim()||!form.descricao.trim()}>{saving?'Salvando...':'Salvar template'}</Btn>
          </div>
        </div>
      ) : (<>
        <div style={{display:'flex',justifyContent:'flex-end'}}>
          <Btn onClick={abrirNovo} variant='primary' style={{fontSize:12,padding:'6px 14px'}}>+ Novo template</Btn>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {templates.length===0?(
            <div style={{textAlign:'center',padding:'30px 0',color:'var(--muted)',fontSize:13}}>Nenhum template cadastrado</div>
          ):templates.map(t=>{
            const tc=TIPO_CORES[t.tipo]||TIPO_CORES.tarefa
            return(
              <div key={t.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',background:t.ativo?'var(--surface)':'var(--surface2)',border:'1px solid var(--border)',borderRadius:10,opacity:t.ativo?1:0.6}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{t.titulo}</span>
                    <span style={{fontSize:10,fontWeight:600,padding:'1px 7px',borderRadius:20,background:tc.bg,color:tc.text,border:`1px solid ${tc.border}`}}>{tc.label}</span>
                    {!t.ativo&&<span style={{fontSize:10,color:'var(--muted)',background:'var(--surface2)',padding:'1px 7px',borderRadius:20,border:'1px solid var(--border)'}}>Inativo</span>}
                  </div>
                  <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.4,marginBottom:4}}>{t.descricao}</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>
                    {t.atribuir_para==='consultor_aluno'?'Consultor do aluno':t.atribuir_para==='consultor_fixo'?`Fixo: ${consultores.find(c=>c.id===t.consultor_fixo_id)?.nome||'—'}`:'Escolher na hora'}
                    {t.prazo_dias?` · +${t.prazo_dias} dia${t.prazo_dias!==1?'s':''}`:' · Sem prazo'}
                  </div>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button onClick={()=>toggleAtivo(t)} style={{fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:7,cursor:'pointer',background:t.ativo?'#dcfce7':'var(--surface2)',color:t.ativo?'#14532d':'var(--muted)',border:`1px solid ${t.ativo?'#86efac':'var(--border)'}`,transition:'all 0.15s'}}>
                    {t.ativo?'Ativo':'Inativo'}
                  </button>
                  <Btn onClick={()=>abrirEdicao(t)} variant='default' style={{fontSize:11,padding:'4px 10px'}}>Editar</Btn>
                  <button onClick={()=>deletar(t.id)} style={{fontSize:11,padding:'4px 8px',borderRadius:7,cursor:'pointer',background:'#fef2f2',color:'#7f1d1d',border:'1px solid #fca5a5'}}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      </>)}
    </Modal>
  )
}

// ─── Construtor de Calendário ──────────────────────────────────────────

function CalendarioBuilder({ turmas, consultores, templates, onClose, onSaved }) {
  // Etapas: 1 = selecionar/criar turma, 2 = montar encontros, 3 = definir tarefas
  const [etapa, setEtapa] = useState(1)
  const [turmaId, setTurmaId] = useState('')
  const [novaTurma, setNovaTurma] = useState({ nome:'', data_inicio:'' })
  const [criandoTurma, setCriandoTurma] = useState(false)
  const [salvandoTurma, setSalvandoTurma] = useState(false)

  // Etapa 2: lista de encontros configurados
  // cada item: { tipo_nome, categoria, data, incluido }
  const SEQUENCIA_PADRAO = [
    {tipo_nome:'Aula 1',     categoria:'aula',       incluido:true, data:''},
    {tipo_nome:'Aula 2',     categoria:'aula',       incluido:true, data:''},
    {tipo_nome:'Aula 3',     categoria:'aula',       incluido:true, data:''},
    {tipo_nome:'Aula 4',     categoria:'aula',       incluido:true, data:''},
    {tipo_nome:'Aula 5',     categoria:'aula',       incluido:true, data:''},
    {tipo_nome:'Aula 6',     categoria:'aula',       incluido:true, data:''},
    {tipo_nome:'Aula 7',     categoria:'aula',       incluido:true, data:''},
    {tipo_nome:'Aula 8',     categoria:'aula',       incluido:true, data:''},
    {tipo_nome:'Aula 9',     categoria:'aula',       incluido:true, data:''},
    {tipo_nome:'1:1 - 1',    categoria:'1:1',        incluido:true, data:''},
    {tipo_nome:'1:1 - 2',    categoria:'1:1',        incluido:true, data:''},
    {tipo_nome:'Aula 10',    categoria:'aula',       incluido:true, data:''},
    {tipo_nome:'1:1 - 3',    categoria:'1:1',        incluido:true, data:''},
    {tipo_nome:'Presencial', categoria:'presencial', incluido:true, data:''},
    {tipo_nome:'Aula 11',    categoria:'aula',       incluido:true, data:''},
    {tipo_nome:'1:1 - 4',    categoria:'1:1',        incluido:true, data:''},
    {tipo_nome:'Aula 12',    categoria:'aula',       incluido:true, data:''},
  ]
  const [encontros, setEncontros] = useState(SEQUENCIA_PADRAO)
  const [novoEncontro, setNovoEncontro] = useState({ tipo_nome:'', categoria:'outro', data:'' })

  // Etapa 3: tarefas por encontro
  // { encontro_idx: [ { template_id, titulo, tipo, consultor_id, data_prevista, incluido } ] }
  const [tarefasEncontro, setTarefasEncontro] = useState({})
  const [encontroAberto, setEncontroAberto] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const CAT_STYLE = {
    aula:       { bg:'#eff6ff', text:'#1d4ed8', border:'#bfdbfe' },
    '1:1':      { bg:'#ede9fe', text:'#2e1065', border:'#c4b5fd' },
    presencial: { bg:'#f0fdf4', text:'#14532d', border:'#86efac' },
    outro:      { bg:'var(--surface2)', text:'var(--muted)', border:'var(--border)' },
  }

  const encontrosIncluidos = encontros.filter(e => e.incluido)

  // Inicializar tarefas quando entrar na etapa 3
  function inicializarTarefas() {
    const t = {}
    encontrosIncluidos.forEach((enc, idx) => {
      // Pré-popular com todos os templates ativos
      t[idx] = templates.filter(tmpl => tmpl.ativo).map(tmpl => {
        // Calcular data sugerida com base no prazo_dias do template
        let data_prevista = ''
        if (enc.data && tmpl.prazo_dias) {
          const d = new Date(enc.data + 'T12:00:00')
          d.setDate(d.getDate() + tmpl.prazo_dias)
          data_prevista = d.toISOString().split('T')[0]
        }
        return {
          template_id: tmpl.id,
          titulo: tmpl.titulo,
          tipo: tmpl.tipo,
          consultor_id: '',
          data_prevista,
          incluido: true,
        }
      })
    })
    setTarefasEncontro(t)
  }

  async function salvarCalendario() {
    if (!turmaId) return
    setSalvando(true)

    for (let idx = 0; idx < encontrosIncluidos.length; idx++) {
      const enc = encontrosIncluidos[idx]

      // Criar aula no banco
      const { data: aulaData } = await supabase.from('aulas').insert({
        turma_id: turmaId,
        numero: idx + 1,
        tema: enc.tipo_nome,
        data_aula: enc.data || null,
        status: enc.data && enc.data < new Date().toISOString().split('T')[0] ? 'realizada' : 'futura',
      }).select().single()

      if (!aulaData) continue

      // Criar calendario_tarefas para as tarefas selecionadas
      const tarefas = (tarefasEncontro[idx] || []).filter(t => t.incluido)
      for (const tarefa of tarefas) {
        if (!tarefa.titulo.trim()) continue
        await supabase.from('calendario_tarefas').insert({
          aula_id: aulaData.id,
          template_id: tarefa.template_id || null,
          titulo: tarefa.titulo,
          tipo: tarefa.tipo,
          consultor_id: tarefa.consultor_id || null,
          data_prevista: tarefa.data_prevista || null,
        })
      }
    }

    setSalvando(false)
    onSaved()
    onClose()
  }

  const inputStyle = { fontSize:12, padding:'6px 9px', background:'var(--surface)', border:'1.5px solid var(--border2)', borderRadius:7, color:'var(--text)', outline:'none', width:'100%' }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.6)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'var(--surface)',borderRadius:16,width:'100%',maxWidth:720,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 80px rgba(0,0,0,0.2)',animation:'fadeIn 0.2s ease'}}>

        {/* Header com etapas */}
        <div style={{padding:'18px 24px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>Construtor de calendário</div>
            <button onClick={onClose} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--muted)',fontSize:14}}>✕</button>
          </div>
          {/* Stepper */}
          <div style={{display:'flex',alignItems:'center',gap:0}}>
            {[{n:1,label:'Turma'},{n:2,label:'Encontros'},{n:3,label:'Tarefas'}].map((s,i) => (
              <div key={s.n} style={{display:'flex',alignItems:'center',flex:i<2?1:'auto'}}>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <div style={{width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,background:etapa>=s.n?'var(--accent)':'var(--surface2)',color:etapa>=s.n?'#fff':'var(--muted)',border:`2px solid ${etapa>=s.n?'var(--accent)':'var(--border2)'}`,flexShrink:0}}>{s.n}</div>
                  <span style={{fontSize:12,fontWeight:etapa===s.n?600:400,color:etapa===s.n?'var(--accent-text)':'var(--muted)'}}>{s.label}</span>
                </div>
                {i < 2 && <div style={{flex:1,height:1.5,background:etapa>s.n?'var(--accent)':'var(--border2)',margin:'0 10px'}}/>}
              </div>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>

          {/* ETAPA 1: TURMA */}
          {etapa===1&&(<div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.5}}>Selecione uma turma existente ou crie uma nova para montar o calendário.</div>

            {/* Turmas existentes */}
            {turmas.length > 0 && (<>
              <div style={{fontSize:12,fontWeight:700,color:'var(--text2)'}}>Turmas existentes</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {turmas.map(t => (
                  <div key={t.id} onClick={()=>setTurmaId(t.id)}
                    style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',border:`1.5px solid ${turmaId===t.id?'var(--accent)':'var(--border)'}`,background:turmaId===t.id?'var(--accent-dim)':'var(--surface)',borderRadius:10,cursor:'pointer',transition:'all 0.15s'}}>
                    <div style={{width:18,height:18,borderRadius:'50%',border:`2px solid ${turmaId===t.id?'var(--accent)':'var(--border2)'}`,background:turmaId===t.id?'var(--accent)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {turmaId===t.id&&<div style={{width:6,height:6,borderRadius:'50%',background:'#fff'}}/>}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{t.nome}</div>
                      <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>
                        {t.data_inicio ? fd(t.data_inicio) : 'Sem data'} — {t.data_fim ? fd(t.data_fim) : 'Em andamento'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{flex:1,height:1,background:'var(--border)'}}/><span style={{fontSize:11,color:'var(--muted)',flexShrink:0}}>ou crie nova</span><div style={{flex:1,height:1,background:'var(--border)'}}/></div>
            </>)}

            {/* Criar nova turma */}
            {!criandoTurma ? (
              <button onClick={()=>setCriandoTurma(true)} style={{padding:'12px',border:'1.5px dashed var(--border2)',borderRadius:10,background:'transparent',cursor:'pointer',fontSize:13,color:'var(--muted)',fontWeight:500,transition:'all 0.15s'}}>
                + Nova turma
              </button>
            ) : (
              <div style={{border:'1.5px solid var(--border2)',borderRadius:10,padding:'14px',display:'flex',flexDirection:'column',gap:12}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--text2)'}}>Nova turma</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div style={{display:'flex',flexDirection:'column',gap:5,gridColumn:'1/-1'}}>
                    <label style={{fontSize:11,fontWeight:600,color:'var(--text2)'}}>Nome da turma *</label>
                    <input value={novaTurma.nome} onChange={e=>setNovaTurma(n=>({...n,nome:e.target.value}))} placeholder="Ex: Turma 2" style={inputStyle}/>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:5}}>
                    <label style={{fontSize:11,fontWeight:600,color:'var(--text2)'}}>Data de início</label>
                    <input type="date" value={novaTurma.data_inicio} onChange={e=>setNovaTurma(n=>({...n,data_inicio:e.target.value}))} style={inputStyle}/>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                  <Btn onClick={()=>setCriandoTurma(false)} variant='ghost' style={{fontSize:12,padding:'5px 12px'}}>Cancelar</Btn>
                  <Btn disabled={salvandoTurma||!novaTurma.nome.trim()} variant='primary' style={{fontSize:12,padding:'5px 12px'}}
                    onClick={async()=>{
                      setSalvandoTurma(true)
                      const fim = novaTurma.data_inicio ? (() => { const d=new Date(novaTurma.data_inicio+'T12:00:00'); d.setFullYear(d.getFullYear()+1); return d.toISOString().split('T')[0] })() : null
                      const {data} = await supabase.from('turmas').insert({nome:novaTurma.nome.trim(),data_inicio:novaTurma.data_inicio||new Date().toISOString().split('T')[0],data_fim:fim,status:'ativa'}).select().single()
                      setSalvandoTurma(false)
                      if (data) { setTurmaId(data.id); setCriandoTurma(false); setNovaTurma({nome:'',data_inicio:''}) }
                    }}>
                    {salvandoTurma?'Criando...':'Criar turma'}
                  </Btn>
                </div>
              </div>
            )}
          </div>)}

          {/* ETAPA 2: ENCONTROS */}
          {etapa===2&&(<div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.5}}>
              Marque os encontros que fazem parte deste calendário e defina as datas. Você pode reordenar ou adicionar encontros customizados.
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {encontros.map((enc, idx) => {
                const cs = CAT_STYLE[enc.categoria] || CAT_STYLE.outro
                return (
                  <div key={idx} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',border:`1.5px solid ${enc.incluido?cs.border:'var(--border)'}`,background:enc.incluido?cs.bg+'55':'var(--surface2)',borderRadius:9,opacity:enc.incluido?1:0.5,transition:'all 0.15s'}}>
                    {/* Checkbox */}
                    <button onClick={()=>setEncontros(e=>{const n=[...e];n[idx]={...n[idx],incluido:!n[idx].incluido};return n})}
                      style={{width:18,height:18,borderRadius:5,flexShrink:0,border:`2px solid ${enc.incluido?cs.border:'var(--border2)'}`,background:enc.incluido?cs.bg:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {enc.incluido&&<svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={cs.text} strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                    </button>
                    {/* Nome */}
                    <div style={{flex:1}}>
                      <input value={enc.tipo_nome} onChange={e=>setEncontros(es=>{const n=[...es];n[idx]={...n[idx],tipo_nome:e.target.value};return n})}
                        style={{...inputStyle,border:'none',background:'transparent',padding:'2px 0',fontSize:13,fontWeight:600,color:enc.incluido?cs.text:'var(--muted)',width:'auto'}}/>
                    </div>
                    <span style={{fontSize:10,fontWeight:600,padding:'1px 8px',borderRadius:20,background:cs.bg,color:cs.text,border:`1px solid ${cs.border}`,flexShrink:0,textTransform:'capitalize'}}>{enc.categoria}</span>
                    {/* Data */}
                    <input type="date" value={enc.data}
                      onChange={e=>setEncontros(es=>{const n=[...es];n[idx]={...n[idx],data:e.target.value};return n})}
                      style={{...inputStyle,width:130,flexShrink:0,fontSize:12}}/>
                    {/* Remover */}
                    <button onClick={()=>setEncontros(e=>e.filter((_,i)=>i!==idx))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',fontSize:14,padding:'0 2px',flexShrink:0,opacity:0.5}}
                      onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.5}>✕</button>
                  </div>
                )
              })}
            </div>

            {/* Adicionar encontro customizado */}
            <div style={{display:'flex',gap:8,alignItems:'flex-end',padding:'12px',border:'1.5px dashed var(--border2)',borderRadius:9}}>
              <div style={{flex:1}}>
                <label style={{fontSize:11,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:4}}>Nome do encontro</label>
                <input value={novoEncontro.tipo_nome} onChange={e=>setNovoEncontro(n=>({...n,tipo_nome:e.target.value}))} placeholder="Ex: Workshop extra" style={inputStyle}/>
              </div>
              <div style={{width:120}}>
                <label style={{fontSize:11,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:4}}>Categoria</label>
                <select value={novoEncontro.categoria} onChange={e=>setNovoEncontro(n=>({...n,categoria:e.target.value}))} style={inputStyle}>
                  <option value="aula">Aula</option>
                  <option value="1:1">1:1</option>
                  <option value="presencial">Presencial</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div style={{width:130}}>
                <label style={{fontSize:11,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:4}}>Data</label>
                <input type="date" value={novoEncontro.data} onChange={e=>setNovoEncontro(n=>({...n,data:e.target.value}))} style={inputStyle}/>
              </div>
              <Btn onClick={()=>{
                if(!novoEncontro.tipo_nome.trim()) return
                setEncontros(e=>[...e,{...novoEncontro,incluido:true}])
                setNovoEncontro({tipo_nome:'',categoria:'outro',data:''})
              }} variant='default' style={{fontSize:12,padding:'6px 12px',flexShrink:0}}>+ Adicionar</Btn>
            </div>

            <div style={{fontSize:11,color:'var(--muted)',background:'var(--surface2)',padding:'8px 12px',borderRadius:7}}>
              {encontrosIncluidos.length} encontro{encontrosIncluidos.length!==1?'s':''} incluído{encontrosIncluidos.length!==1?'s':''} · {encontros.filter(e=>e.incluido&&e.data).length} com data definida
            </div>
          </div>)}

          {/* ETAPA 3: TAREFAS */}
          {etapa===3&&(<div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.5}}>
              Para cada encontro, selecione as atividades acessórias. As datas são calculadas automaticamente com base no template, mas você pode ajustá-las.
            </div>
            {encontrosIncluidos.map((enc, idx) => {
              const cs = CAT_STYLE[enc.categoria] || CAT_STYLE.outro
              const aberto = encontroAberto === idx
              const tarefas = tarefasEncontro[idx] || []
              const ativas = tarefas.filter(t=>t.incluido).length

              return (
                <div key={idx} style={{border:`1px solid ${aberto?'var(--accent)':'var(--border)'}`,borderRadius:11,overflow:'hidden',transition:'border-color 0.15s'}}>
                  {/* Cabeçalho do encontro */}
                  <div onClick={()=>setEncontroAberto(aberto?null:idx)}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',cursor:'pointer',background:aberto?'var(--accent-dim)':'var(--surface)'}}>
                    <span style={{fontSize:11,fontWeight:600,padding:'1px 8px',borderRadius:20,background:cs.bg,color:cs.text,border:`1px solid ${cs.border}`,flexShrink:0}}>{enc.categoria}</span>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--text)',flex:1}}>{enc.tipo_nome}</span>
                    {enc.data&&<span style={{fontSize:11,color:'var(--muted)',fontFamily:'var(--mono)'}}>{fd(enc.data)}</span>}
                    <span style={{fontSize:11,color:ativas>0?'var(--accent-text)':'var(--muted)',fontWeight:ativas>0?600:400,background:ativas>0?'var(--accent-dim)':'var(--surface2)',padding:'1px 8px',borderRadius:20,border:`1px solid ${ativas>0?'#bfdbfe':'var(--border)'}`,flexShrink:0}}>
                      {ativas} tarefa{ativas!==1?'s':''}
                    </span>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" style={{flexShrink:0,transform:aberto?'rotate(180deg)':'none',transition:'transform 0.2s'}}><path d="M6 9l6 6 6-6"/></svg>
                  </div>

                  {/* Tarefas do encontro */}
                  {aberto&&(<div style={{borderTop:'1px solid var(--border)'}}>
                    {tarefas.map((tarefa, tidx) => (
                      <div key={tidx} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:'1px solid var(--border)',background:tarefa.incluido?'var(--surface)':'var(--surface2)',opacity:tarefa.incluido?1:0.5}}>
                        {/* Toggle incluído */}
                        <button onClick={()=>setTarefasEncontro(te=>{
                            const n={...te};n[idx]=[...n[idx]];n[idx][tidx]={...n[idx][tidx],incluido:!n[idx][tidx].incluido};return n
                          })}
                          style={{width:18,height:18,borderRadius:5,flexShrink:0,border:`2px solid ${tarefa.incluido?'var(--accent)':'var(--border2)'}`,background:tarefa.incluido?'var(--accent)':'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {tarefa.incluido&&<svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                        </button>
                        {/* Título */}
                        <div style={{flex:1,minWidth:0}}>
                          <input value={tarefa.titulo}
                            onChange={e=>setTarefasEncontro(te=>{const n={...te};n[idx]=[...n[idx]];n[idx][tidx]={...n[idx][tidx],titulo:e.target.value};return n})}
                            style={{...inputStyle,border:'none',background:'transparent',padding:'2px 0',fontSize:12,fontWeight:500,color:'var(--text)'}}/>
                        </div>
                        {/* Responsável */}
                        <select value={tarefa.consultor_id}
                          onChange={e=>setTarefasEncontro(te=>{const n={...te};n[idx]=[...n[idx]];n[idx][tidx]={...n[idx][tidx],consultor_id:e.target.value};return n})}
                          style={{...inputStyle,width:130,fontSize:11,flexShrink:0}}>
                          <option value="">Responsável...</option>
                          {consultores.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                        {/* Data prevista */}
                        <input type="date" value={tarefa.data_prevista}
                          onChange={e=>setTarefasEncontro(te=>{const n={...te};n[idx]=[...n[idx]];n[idx][tidx]={...n[idx][tidx],data_prevista:e.target.value};return n})}
                          style={{...inputStyle,width:130,fontSize:11,flexShrink:0}}/>
                      </div>
                    ))}
                    {/* Adicionar tarefa avulsa */}
                    <div style={{padding:'8px 14px'}}>
                      <button onClick={()=>setTarefasEncontro(te=>{
                          const n={...te}
                          n[idx]=[...(n[idx]||[]),{template_id:null,titulo:'Nova tarefa',tipo:'tarefa',consultor_id:'',data_prevista:enc.data||'',incluido:true}]
                          return n
                        })}
                        style={{fontSize:11,color:'var(--accent)',background:'none',border:'none',cursor:'pointer',fontWeight:500}}>
                        + Adicionar tarefa neste encontro
                      </button>
                    </div>
                  </div>)}
                </div>
              )
            })}
          </div>)}
        </div>

        {/* Footer com navegação */}
        <div style={{padding:'14px 24px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div style={{fontSize:11,color:'var(--muted)'}}>
            {etapa===1 && (turmaId ? `Turma: ${turmas.find(t=>t.id===turmaId)?.nome||'Selecionada'}` : 'Nenhuma turma selecionada')}
            {etapa===2 && `${encontrosIncluidos.length} encontros`}
            {etapa===3 && `${Object.values(tarefasEncontro).flat().filter(t=>t.incluido).length} tarefas no total`}
          </div>
          <div style={{display:'flex',gap:8}}>
            {etapa>1&&<Btn onClick={()=>setEtapa(e=>e-1)} variant='ghost'>← Voltar</Btn>}
            {etapa<3&&(
              <Btn
                onClick={()=>{
                  if (etapa===2) inicializarTarefas()
                  setEtapa(e=>e+1)
                }}
                variant='primary'
                disabled={etapa===1&&!turmaId||etapa===2&&encontrosIncluidos.length===0}
              >
                Próximo →
              </Btn>
            )}
            {etapa===3&&(
              <Btn onClick={salvarCalendario} variant='primary' disabled={salvando}>
                {salvando?'Salvando calendário...':'✓ Salvar calendário'}
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── App principal ────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = carregando, null = não logado
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
  const [templates,setTemplates]=useState([])
  const [loading,setLoading]=useState(true)
  const [activeNav,setActiveNav]=useState('dashboard')
  const [selected,setSelected]=useState(null)
  const [showNovoAluno,setShowNovoAluno]=useState(false)
  const [showCalendarioBuilder,setShowCalendarioBuilder]=useState(false)
  const [filterTurma,setFilterTurma]=useState('')
  const [filterChurn,setFilterChurn]=useState('')
  const [search,setSearch]=useState('')

  // Escutar mudanças de auth
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session))
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>setSession(session))
    return()=>subscription.unsubscribe()
  },[])

  const loadAll=useCallback(async()=>{
    setLoading(true)
    const [a,t,c,au,r,ta,p,n,h,ct,tmpl]=await Promise.all([
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
      supabase.from('tarefa_templates').select('*').order('ordem'),
    ])
    setAlunos(a.data||[]);setTurmas(t.data||[]);setConsultores(c.data||[])
    setAulas(au.data||[]);setReunioes(r.data||[]);setTarefas(ta.data||[])
    setPresencas(p.data||[]);setNotas(n.data||[]);setHistorico(h.data||[])
    setContatos(ct.data||[]);setTemplates(tmpl.data||[])
    setLoading(false)
  },[])

  useEffect(()=>{if(session)loadAll()},[session,loadAll])

  async function handleLogout(){
    await supabase.auth.signOut()
    setSession(null)
  }

  const selectedAluno=selected?alunos.find(a=>a.id===selected):null

  // Carregando auth
  if(session===undefined){
    return(<><style>{G}</style><div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}><div style={{fontSize:13,color:'var(--muted)'}}>Carregando...</div></div></>)
  }

  // Não logado
  if(!session){
    return(<><style>{G}</style><LoginScreen/></>)
  }

  // Logado mas email errado (segurança extra no frontend)
  if(!session.user?.email?.endsWith(ALLOWED_DOMAIN)){
    return(<><style>{G}</style><div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:20}}><div style={{textAlign:'center',maxWidth:360}}><div style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:8}}>Acesso não autorizado</div><div style={{fontSize:13,color:'var(--muted)',lineHeight:1.6,marginBottom:20}}>Este sistema é restrito a emails <strong>@exponencialmed.com.br</strong>.</div><Btn onClick={handleLogout} variant='danger'>Sair</Btn></div></div></>)
  }

  const navItems=[
    {id:'dashboard',label:'Dashboard',icon:'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z'},
    {id:'alunos',label:'Alunos',icon:'M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z'},
    {id:'calendario',label:'Calendário',icon:'M3 4h18v17H3zM16 2v4M8 2v4M3 10h18'},
    {id:'tarefas',label:'Tarefas',icon:'M9 11l3 3 8-8M5 12l2 2 4-4'},
  ]

  return(
    <><style>{G}</style>
    <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
      <div style={{width:210,minWidth:210,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'18px 16px 14px',borderBottom:'1px solid var(--border)'}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--text)',letterSpacing:'-0.01em'}}>MBA Exponencial</div>
          <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>Gestão de turmas</div>
        </div>
        <nav style={{padding:'10px 8px',flex:1}}>{navItems.map(n=><NavItem key={n.id} {...n} active={activeNav===n.id} onClick={()=>setActiveNav(n.id)}/>)}</nav>
        {/* Usuário logado */}
        <div style={{padding:'12px 14px',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'var(--accent-dim)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'var(--accent-text)',flexShrink:0}}>
            {(session.user.email||'').slice(0,2).toUpperCase()}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:500,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{session.user.email?.split('@')[0]}</div>
            <button onClick={handleLogout} style={{fontSize:10,color:'var(--muted)',background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'underline'}}>Sair</button>
          </div>
        </div>
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {loading?(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)',fontSize:13}}>Carregando dados...</div>
        ):activeNav==='dashboard'?(
          <Dashboard alunos={alunos} turmas={turmas} filterTurma={filterTurma} setFilterTurma={setFilterTurma} filterChurn={filterChurn} setFilterChurn={setFilterChurn} search={search} setSearch={setSearch} onSelectAluno={id=>setSelected(id)}/>
        ):activeNav==='alunos'?(
          <AlunosModule alunos={alunos} turmas={turmas} consultores={consultores} onSelectAluno={id=>setSelected(id)} onNovoAluno={()=>setShowNovoAluno(true)}/>
        ):activeNav==='calendario'?(
          <CalendarioModule turmas={turmas} aulas={aulas} alunos={alunos} presencas={presencas} onUpdate={loadAll} onOpenBuilder={()=>setShowCalendarioBuilder(true)}/>
        ):(
          <TarefasModule tarefas={tarefas} consultores={consultores} alunos={alunos} turmas={turmas} templates={templates} onUpdate={loadAll}/>
        )}
      </div>

      {selectedAluno&&(<StudentPanel aluno={selectedAluno} aulas={aulas} reunioes={reunioes.filter(r=>r.aluno_id===selectedAluno.id)} tarefas={tarefas.filter(t=>t.aluno_id===selectedAluno.id)} presencas={presencas} notas={notas.filter(n=>n.aluno_id===selectedAluno.id)} historico={historico.filter(h=>h.aluno_id===selectedAluno.id)} contatos={contatos.filter(c=>c.aluno_id===selectedAluno.id)} consultores={consultores} turmas={turmas} onClose={()=>setSelected(null)} onUpdate={loadAll}/>)}
      {showNovoAluno&&(<NovoAlunoModal consultores={consultores} turmas={turmas} onClose={()=>setShowNovoAluno(false)} onSaved={()=>{setShowNovoAluno(false);loadAll()}}/>)}
      {showCalendarioBuilder&&(<CalendarioBuilder turmas={turmas} consultores={consultores} templates={templates} onClose={()=>setShowCalendarioBuilder(false)} onSaved={()=>{setShowCalendarioBuilder(false);loadAll()}}/>)}
    </div>
    </>
  )
}
