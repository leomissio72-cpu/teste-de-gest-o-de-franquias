import { useState, useEffect } from 'react'
import { funcionarios, registrosPonto, RegistroPonto } from '../data/mockData'

export default function RegistroPontoView() {
  const [selectedId, setSelectedId] = useState<string>('')
  const [pin, setPin] = useState('')
  const [step, setStep] = useState<'select' | 'pin' | 'confirm' | 'done'>('select')
  const [action, setAction] = useState<'entrada' | 'saida' | null>(null)
  const [hora, setHora] = useState('')
  const [pontos, setPontos] = useState<RegistroPonto[]>(registrosPonto)
  const [msg, setMsg] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setHora(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const funcionario = funcionarios.find(f => f.id === selectedId)
  const pontoHoje = pontos.find(p => p.funcionarioId === selectedId && p.data === today)

  function handleSelectFuncionario(id: string) {
    setSelectedId(id)
    setPin('')
    setStep('pin')
    setMsg('')
  }

  function handlePin(d: string) {
    const next = (pin + d).slice(0, 4)
    setPin(next)
    if (next.length === 4) {
      // PIN simples: últimos 4 dígitos do ID ou '1234' como demo
      setTimeout(() => {
        setStep('confirm')
      }, 300)
    }
  }

  function handleRegistrar(type: 'entrada' | 'saida') {
    setAction(type)
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    const horaAtual = `${h}:${m}`

    setPontos(prev => prev.map(p => {
      if (p.funcionarioId === selectedId && p.data === today) {
        if (type === 'entrada') {
          return { ...p, entradaReal: horaAtual, status: 'presente' }
        } else {
          return { ...p, saidaReal: horaAtual }
        }
      }
      return p
    }))

    setMsg(type === 'entrada'
      ? `✅ Entrada registrada às ${horaAtual}`
      : `✅ Saída registrada às ${horaAtual}`)
    setStep('done')
  }

  function resetar() {
    setSelectedId('')
    setPin('')
    setStep('select')
    setAction(null)
    setMsg('')
  }

  const statusColor: Record<string, string> = {
    presente: '#22c55e',
    falta: '#ef4444',
    atraso: '#f59e0b',
    saida_antecipada: '#f97316',
    folga: '#6366f1',
    pendente: '#94a3b8',
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Registro de Ponto</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Painel esquerdo - lista de funcionários */}
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            Funcionários em turno hoje
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {funcionarios.map(f => {
              const p = pontos.find(x => x.funcionarioId === f.id && x.data === today)
              return (
                <button
                  key={f.id}
                  onClick={() => step === 'select' && handleSelectFuncionario(f.id)}
                  style={{
                    background: selectedId === f.id ? 'var(--surface2)' : 'var(--surface)',
                    border: selectedId === f.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    textAlign: 'left',
                    cursor: step === 'select' ? 'pointer' : 'default',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0,
                  }}>{f.foto}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{f.nome}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{f.cargo} · {f.unidade}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {p && (
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: statusColor[p.status] || 'var(--muted)',
                        background: (statusColor[p.status] || '#94a3b8') + '22',
                        padding: '3px 8px', borderRadius: 20,
                      }}>
                        {p.status === 'presente' && p.entradaReal && !p.saidaReal ? `Entrada ${p.entradaReal}` :
                         p.status === 'presente' && p.saidaReal ? `Saída ${p.saidaReal}` :
                         p.status === 'pendente' ? 'Aguardando' :
                         p.status === 'falta' ? 'Falta' :
                         p.status === 'folga' ? 'Folga' :
                         p.status === 'atraso' ? `Atraso ${p.entradaReal}` :
                         p.status}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Painel direito - terminal de registro */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          {/* Clock */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>
              {hora}
            </div>
            <div style={{ fontSize: 12, color: '#a5b4fc', marginTop: 4 }}>
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          </div>

          <div style={{ padding: 24 }}>
            {step === 'select' && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>👆</div>
                <p style={{ fontSize: 14 }}>Selecione seu nome na lista ao lado</p>
              </div>
            )}

            {step === 'pin' && funcionario && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, color: '#fff',
                  }}>{funcionario.foto}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{funcionario.nome}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{funcionario.cargo}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Digite seu PIN (demo: qualquer 4 dígitos)</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{
                      width: 14, height: 14, borderRadius: '50%',
                      background: i < pin.length ? 'var(--accent)' : 'var(--border)',
                      transition: 'background .15s',
                    }} />
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
                    <button
                      key={i}
                      onClick={() => d === '⌫' ? setPin(p => p.slice(0,-1)) : d ? handlePin(d) : null}
                      style={{
                        padding: '14px',
                        borderRadius: 10,
                        fontSize: 18,
                        fontWeight: 600,
                        background: d ? 'var(--surface2)' : 'transparent',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        transition: 'all .1s',
                      }}
                      disabled={!d}
                    >{d}</button>
                  ))}
                </div>
                <button
                  onClick={resetar}
                  style={{
                    marginTop: 12, width: '100%', padding: '10px',
                    borderRadius: 10, fontSize: 13, background: 'transparent',
                    color: 'var(--muted)', border: '1px solid var(--border)',
                  }}
                >Cancelar</button>
              </>
            )}

            {step === 'confirm' && funcionario && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 20, color: '#fff',
                    margin: '0 auto 12px',
                  }}>{funcionario.foto}</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{funcionario.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{funcionario.cargo} · {funcionario.unidade}</div>
                  {pontoHoje && (
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      Previsto: {pontoHoje.entradaPrevista} – {pontoHoje.saidaPrevista}
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <button
                    onClick={() => handleRegistrar('entrada')}
                    disabled={!!pontoHoje?.entradaReal}
                    style={{
                      padding: '16px',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 700,
                      background: pontoHoje?.entradaReal ? 'var(--border)' : '#16a34a',
                      color: '#fff',
                      opacity: pontoHoje?.entradaReal ? 0.5 : 1,
                    }}
                  >
                    {pontoHoje?.entradaReal ? `Entrada já registrada (${pontoHoje.entradaReal})` : '▶ Registrar Entrada'}
                  </button>
                  <button
                    onClick={() => handleRegistrar('saida')}
                    disabled={!pontoHoje?.entradaReal || !!pontoHoje?.saidaReal}
                    style={{
                      padding: '16px',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 700,
                      background: (!pontoHoje?.entradaReal || pontoHoje?.saidaReal) ? 'var(--border)' : '#dc2626',
                      color: '#fff',
                      opacity: (!pontoHoje?.entradaReal || pontoHoje?.saidaReal) ? 0.5 : 1,
                    }}
                  >
                    {pontoHoje?.saidaReal ? `Saída já registrada (${pontoHoje.saidaReal})` : '⏹ Registrar Saída'}
                  </button>
                </div>
                <button
                  onClick={resetar}
                  style={{
                    marginTop: 10, width: '100%', padding: '10px',
                    borderRadius: 10, fontSize: 13, background: 'transparent',
                    color: 'var(--muted)', border: '1px solid var(--border)',
                  }}
                >Voltar</button>
              </>
            )}

            {step === 'done' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 50, marginBottom: 12 }}>✅</div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Ponto registrado!</p>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>{msg}</p>
                <button
                  onClick={resetar}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 10, fontSize: 14, fontWeight: 600,
                    background: 'var(--accent)', color: '#fff',
                  }}
                >Próximo funcionário</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
