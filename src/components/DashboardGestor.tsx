import { useState } from 'react'
import { funcionarios, registrosPonto, RegistroPonto } from '../data/mockData'

const statusLabel: Record<RegistroPonto['status'], string> = {
  presente: 'Presente',
  falta: 'Falta',
  atraso: 'Atraso',
  saida_antecipada: 'Saída Antecipada',
  folga: 'Folga',
  pendente: 'Pendente',
}

const statusColor: Record<RegistroPonto['status'], string> = {
  presente: '#22c55e',
  falta: '#ef4444',
  atraso: '#f59e0b',
  saida_antecipada: '#f97316',
  folga: '#6366f1',
  pendente: '#94a3b8',
}

export default function DashboardGestor() {
  const today = new Date().toISOString().split('T')[0]
  const [filtroFunc, setFiltroFunc] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const pontosHoje = registrosPonto.filter(p => p.data === today)

  const stats = {
    presentes: pontosHoje.filter(p => p.status === 'presente').length,
    faltas: pontosHoje.filter(p => p.status === 'falta').length,
    atrasos: pontosHoje.filter(p => p.status === 'atraso').length,
    pendentes: pontosHoje.filter(p => p.status === 'pendente').length,
  }

  const registrosFiltrados = registrosPonto
    .filter(p => filtroFunc === 'todos' || p.funcionarioId === filtroFunc)
    .filter(p => filtroStatus === 'todos' || p.status === filtroStatus)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 60)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Dashboard do Gestor</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Visão geral de presenças e ocorrências</p>
      </div>

      {/* KPIs de hoje */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Presentes hoje', value: stats.presentes, color: '#22c55e' },
          { label: 'Faltas hoje', value: stats.faltas, color: '#ef4444' },
          { label: 'Atrasos hoje', value: stats.atrasos, color: '#f59e0b' },
          { label: 'Pendentes', value: stats.pendentes, color: '#94a3b8' },
        ].map(k => (
          <div key={k.label} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={filtroFunc}
          onChange={e => setFiltroFunc(e.target.value)}
          style={{
            background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 12px', fontSize: 13,
          }}
        >
          <option value="todos">Todos os funcionários</option>
          {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          style={{
            background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 12px', fontSize: 13,
          }}
        >
          <option value="todos">Todos os status</option>
          <option value="presente">Presente</option>
          <option value="falta">Falta</option>
          <option value="atraso">Atraso</option>
          <option value="saida_antecipada">Saída Antecipada</option>
          <option value="folga">Folga</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>

      {/* Tabela */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Funcionário', 'Data', 'Entrada Prev.', 'Entrada Real', 'Saída Prev.', 'Saída Real', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.map((p, i) => {
              const func = funcionarios.find(f => f.id === p.funcionarioId)
              const isToday = p.data === today
              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: isToday ? 'rgba(99,102,241,.05)' : i % 2 ? 'var(--surface2)' : 'var(--surface)',
                  }}
                >
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>{func?.foto}</div>
                      <span>{func?.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: isToday ? 'var(--accent)' : 'var(--text)' }}>
                    {new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                    {isToday && <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--accent)', color: '#fff', padding: '1px 6px', borderRadius: 10 }}>Hoje</span>}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{p.entradaPrevista}</td>
                  <td style={{ padding: '10px 14px' }}>{p.entradaReal || '—'}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{p.saidaPrevista}</td>
                  <td style={{ padding: '10px 14px' }}>{p.saidaReal || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: statusColor[p.status],
                      background: statusColor[p.status] + '22',
                      padding: '3px 10px', borderRadius: 20,
                    }}>{statusLabel[p.status]}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
