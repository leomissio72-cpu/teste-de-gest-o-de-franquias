export type Turno = 'manha' | 'tarde' | 'noite'

export interface Funcionario {
  id: string
  nome: string
  cargo: string
  unidade: string
  foto: string
  turno: Turno
}

export interface EscalaDia {
  funcionarioId: string
  data: string // YYYY-MM-DD
  entrada: string // HH:MM
  saida: string
  turno: Turno
  folga: boolean
}

export interface RegistroPonto {
  id: string
  funcionarioId: string
  data: string
  entradaReal: string | null
  saidaReal: string | null
  entradaPrevista: string
  saidaPrevista: string
  status: 'presente' | 'falta' | 'atraso' | 'saida_antecipada' | 'folga' | 'pendente'
  observacao?: string
}

export const funcionarios: Funcionario[] = [
  { id: 'f1', nome: 'Ana Souza', cargo: 'Atendente', unidade: 'Unidade Centro', foto: 'AS', turno: 'manha' },
  { id: 'f2', nome: 'Bruno Lima', cargo: 'Caixa', unidade: 'Unidade Norte', foto: 'BL', turno: 'tarde' },
  { id: 'f3', nome: 'Carla Mendes', cargo: 'Supervisora', unidade: 'Unidade Centro', foto: 'CM', turno: 'manha' },
  { id: 'f4', nome: 'Diego Farias', cargo: 'Estoquista', unidade: 'Unidade Sul', foto: 'DF', turno: 'noite' },
  { id: 'f5', nome: 'Elena Costa', cargo: 'Atendente', unidade: 'Unidade Norte', foto: 'EC', turno: 'tarde' },
]

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

const today = new Date()
today.setHours(0, 0, 0, 0)

export const escalas: EscalaDia[] = funcionarios.flatMap(f => {
  return Array.from({ length: 14 }, (_, i) => {
    const dia = addDays(today, i - 7)
    const folga = dia.getDay() === 0 // domingo é folga
    const horarios: Record<Turno, { entrada: string; saida: string }> = {
      manha: { entrada: '08:00', saida: '14:00' },
      tarde: { entrada: '14:00', saida: '20:00' },
      noite: { entrada: '20:00', saida: '02:00' },
    }
    return {
      funcionarioId: f.id,
      data: formatDate(dia),
      ...horarios[f.turno],
      turno: f.turno,
      folga,
    }
  })
})

function gerarStatus(
  folga: boolean,
  passado: boolean,
  hoje: boolean,
  entrada?: string,
  saida?: string,
  prevEntrada?: string,
  prevSaida?: string,
): RegistroPonto['status'] {
  if (folga) return 'folga'
  if (!passado && !hoje) return 'pendente'
  if (!entrada) return 'falta'
  const [eh, em] = entrada.split(':').map(Number)
  const [ph, pm] = prevEntrada!.split(':').map(Number)
  const diffEntrada = (eh * 60 + em) - (ph * 60 + pm)
  if (!saida) return hoje ? 'pendente' : 'saida_antecipada'
  if (diffEntrada > 15) return 'atraso'
  return 'presente'
}

let pontoId = 1
export const registrosPonto: RegistroPonto[] = escalas.map(e => {
  const diaDate = new Date(e.data + 'T12:00:00')
  const passado = diaDate < today
  const ehHoje = formatDate(diaDate) === formatDate(today)

  if (e.folga) {
    return {
      id: `p${pontoId++}`,
      funcionarioId: e.funcionarioId,
      data: e.data,
      entradaReal: null,
      saidaReal: null,
      entradaPrevista: e.entrada,
      saidaPrevista: e.saida,
      status: 'folga',
    }
  }

  let entradaReal: string | null = null
  let saidaReal: string | null = null

  if (passado || ehHoje) {
    const [eh, em] = e.entrada.split(':').map(Number)
    const rand = Math.random()
    if (rand > 0.1) {
      const minutos = Math.floor(Math.random() * 30) - 5
      const totalMin = eh * 60 + em + minutos
      const h = Math.floor(totalMin / 60) % 24
      const m = totalMin % 60
      entradaReal = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    if (passado && entradaReal) {
      const [sh, sm] = e.saida.split(':').map(Number)
      const minutos = Math.floor(Math.random() * 20) - 5
      const totalMin = sh * 60 + sm + minutos
      const h = Math.floor(totalMin / 60) % 24
      const m = totalMin % 60
      saidaReal = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
  }

  return {
    id: `p${pontoId++}`,
    funcionarioId: e.funcionarioId,
    data: e.data,
    entradaReal,
    saidaReal,
    entradaPrevista: e.entrada,
    saidaPrevista: e.saida,
    status: gerarStatus(false, passado, ehHoje, entradaReal ?? undefined, saidaReal ?? undefined, e.entrada, e.saida),
  }
})
