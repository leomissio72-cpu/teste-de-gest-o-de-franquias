import { useState } from 'react'
import RegistroPontoView from './components/RegistroPontoView'
import DashboardGestor from './components/DashboardGestor'
import EscalaView from './components/EscalaView'

type View = 'registro' | 'dashboard' | 'escala'

export default function App() {
  const [view, setView] = useState<View>('registro')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14, color: '#fff',
          }}>GP</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Gestão de Ponto</span>
          <span style={{
            fontSize: 11, background: 'var(--accent)', color: '#fff',
            padding: '2px 8px', borderRadius: 20, fontWeight: 600,
          }}>BETA</span>
        </div>

        <nav style={{ display: 'flex', gap: 4 }}>
          {([
            ['registro', 'Registrar Ponto'],
            ['dashboard', 'Dashboard'],
            ['escala', 'Escala'],
          ] as [View, string][]).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                background: view === v ? 'var(--accent)' : 'transparent',
                color: view === v ? '#fff' : 'var(--muted)',
                transition: 'all .15s',
              }}
            >{label}</button>
          ))}
        </nav>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        {view === 'registro' && <RegistroPontoView />}
        {view === 'dashboard' && <DashboardGestor />}
        {view === 'escala' && <EscalaView />}
      </main>
    </div>
  )
}
