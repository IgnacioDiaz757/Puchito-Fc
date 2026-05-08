export type Posicion =
  | 'Portero'
  | 'Defensa'
  | 'Centrocampista'
  | 'Delantero'

export const POSICIONES: Posicion[] = [
  'Portero',
  'Defensa',
  'Centrocampista',
  'Delantero',
]

export type Jugador = {
  id: string
  nombre: string
  posicion: Posicion
  goles: number
  asistencias: number
  partidos: number
  mvps: number
  foto_url?: string
  created_at?: string
}