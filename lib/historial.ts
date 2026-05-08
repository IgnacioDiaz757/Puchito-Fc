export type Partido = {
  id: string
  fecha: string
  equipo1_nombre: string
  equipo2_nombre: string
  goles_equipo1: number
  goles_equipo2: number
  creado_en: string
}

export type PartidoJugador = {
  id: string
  partido_id: string
  jugador_id: string
  equipo: 1 | 2
}

export type VotoMVP = {
  votante_id: string
  mvp_id: string
}
