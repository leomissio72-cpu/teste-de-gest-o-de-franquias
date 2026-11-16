import { useState } from 'react'
import { funcionarios, escalas, registrosPonto } from '../data/mockData'

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const turnoColor: Record<string, string> = {
  manha: '#0ea5e9',
  tarde: '#f59e0b',
  noite: '#8b5cf6',
}

export default function EscalaView() {
  const [semanaOffset, setSemanaOffset] = useState(0)
  const [selectedFunc, setSelectedFunc] = useState<string | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const inicioSemana = new Date(today)
  const diaSemana = inicioSemana.getDay()
  inicioSemana.setDate(inicioSemana.getDate() - diaSemana + semanaOffset * 7)

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioSemana)
    d.setDate(d.getDate() + i)
    return d
  })

  function fmt(d: Date) {
    return d.toISOString().split('T')[0]
  }

  const statusColor: Record<string, string> = {
    presente: '#22c55e',
    falta: '#ef4444',
    atraso: '#f59e0b',
    saida_antecipada: '#f97316',
    folga: '#6366f1',
    pendente: '#94a3b8',
  }

  const funcsVisiveis = selectedFunc ? funcionarios.filter(f => f.id === selectedFunc) : funcionarios

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Escala de Trabalho</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Visualize os turnos e status de cada dia</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setSemanaOffset(o => o - 1)}
            style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 16 }}
          >‹</button>
          <span style={{ fontSize: 13, color: 'var(--muted)', minWidth: 160, textAlign: 'center' }}>
            {dias[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – {dias[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <button
            onClick={() => setSemanaOffset(o => o + 1)}
            style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 16 }}
          >›</button>
          <button
            onClick={() => setSemanaOffset(0)}
            style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600 }}
          >Hoje</button>
        </div>
      </div>

      {/* Filtro funcionário */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedFunc(null)}
          style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            background: !selectedFunc ? 'var(--accent)' : 'var(--surface)',
            color: !selectedFunc ? '#fff' : 'var(--muted)',
            border: '1px solid var(--border)',
          }}
        >Todos</button>
        {funcionarios.map(f => (
          <button
            key={f.id}
            onClick={() => setSelectedFunc(f.id === selectedFunc ? null : f.id)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              background: selectedFunc === f.id ? 'var(--accent)' : 'var(--surface)',
              color: selectedFunc === f.id ? '#fff' : 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >{f.nome.split(' ')[0]}</button>
        ))}
      </div>

      {/* Grid da escala */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}>
        {/* Cabeçalho com dias */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px repeat(7, 1fr)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface2)',
        }}>
          <div style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Funcionário</div>
          {dias.map((d, i) => {
            const isToday = fmt(d) === fmt(today)
            return (
              <div key={i} style={{
                padding: '10px 8px',
                textAlign: 'center',
                borderLeft: '1px solid var(--border)',
                background: isToday ? 'rgba(99,102,241,.12)' : 'transparent',
              }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{diasSemana[d.getDay()]}</div>
                <div style={{
                  fontSize: 15, fontWeight: 700,
                  color: isToday ? 'var(--accent)' : 'var(--text)',
                }}>{d.getDate()}</div>
              </div>
            )
          })}
        </div>

        {/* Linhas por funcionário */}
        {funcsVisiveis.map((f, fi) => (
          <div
            key={f.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '180px repeat(7, 1fr)',
              borderBottom: fi < funcsVisiveis.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>{f.foto}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{f.nome.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{f.cargo}</div>
              </div>
            </div>

            {dias.map((d, di) => {
              const dataStr = fmt(d)
              const escala = escalas.find(e => e.funcionarioId === f.id && e.data === dataStr)
              const ponto = registrosPonto.find(p => p.funcionarioId === f.id && p.data === dataStr)
              const isToday = dataStr === fmt(today)
              const passado = d < today

              return (
                <div
                  key={di}
                  style={{
                    padding: '8px 6px',
                    borderLeft: '1px solid var(--border)',
                    background: isToday ? 'rgba(99,102,241,.05)' : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    minHeight: 60,
                    justifyContent: 'center',
                  }}
                >
                  {escala?.folga ? (
                    <span style={{ fontSize: 10, color: '#6366f1', fontWeight: 600 }}>Folga</span>
                  ) : escala ? (
                    <>
                      <span style={{
                        fontSize: 9, fontWeight: 700,
                        color: turnoColor[escala.turno] || 'var(--muted)',
                        textTransform: 'uppercase',
                        background: (turnoColor[escala.turno] || '#94a3b8') + '22',
                        padding: '1px 5px', borderRadius: 10,
                      }}>{escala.turno}</span>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{escala.entrada}–{escala.saida}</span>
                      {ponto && (passado || isToday) && (
                        <span style={{
                          fontSize: 9, fontWeight: 600,
                          color: statusColor[ponto.status],
                          background: statusColor[ponto.status] + '22',
                          padding: '1px 6px', borderRadius: 10,
                          marginTop: 2,
                        }}>
                          {ponto.status === 'presente' ? (ponto.entradaReal || '') : ponto.status}
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ color: 'var(--border)', fontSize: 18 }}>—</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Manhã', color: turnoColor.manha },
          { label: 'Tarde', color: turnoColor.tarde },
          { label: 'Noite', color: turnoColor.noite },
          { label: 'Presente', color: '#22c55e' },
          { label: 'Falta', color: '#ef4444' },
          { label: 'Atraso', color: '#f59e0b' },
          { label: 'Folga', color: '#6366f1' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
