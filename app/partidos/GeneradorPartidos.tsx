'use client'

import { useState } from 'react'
import type { Jugador } from '@/lib/jugadores'
import { votarMVP } from '../actions'

type EquipoGenerado = {
  nombre: string
  jugadores: Jugador[]
}

type Resultado = {
  equipo1: EquipoGenerado
  equipo2: EquipoGenerado
}

const POSICION_BADGE: Record<string, string> = {
  Delantero: 'bg-red-900/60 text-red-300',
  Centrocampista: 'bg-blue-900/60 text-blue-300',
  Defensa: 'bg-yellow-900/60 text-yellow-300',
  Portero: 'bg-purple-900/60 text-purple-300',
}

const TEAM_SIZE_OPTIONS = [5, 6, 7, 8, 11]

export function GeneradorPartidos({
  jugadores,
}: {
  jugadores: Jugador[]
}) {
  const [seleccionados, setSeleccionados] = useState<string[]>(
    jugadores.map(j => j.id)
  )

  const [jugadoresPorEquipo, setJugadoresPorEquipo] = useState(5)

  const [resultado, setResultado] = useState<Resultado | null>(null)

  const [cargando, setCargando] = useState(false)

  const totalNecesario = jugadoresPorEquipo * 2

  const valido = seleccionados.length >= totalNecesario

  const toggleJugador = (id: string) => {
    setResultado(null)

    setSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  // GENERADOR RANDOM LOCAL
  const generarPartido = () => {
    if (!valido) return

    setCargando(true)
    setResultado(null)

    try {
      const jugadoresSeleccionados = jugadores.filter(j =>
        seleccionados.includes(j.id)
      )

      const mezclados = [...jugadoresSeleccionados].sort(
        () => Math.random() - 0.5
      )

      const necesarios = mezclados.slice(0, totalNecesario)

      const equipo1Jugadores = necesarios.slice(
        0,
        jugadoresPorEquipo
      )

      const equipo2Jugadores = necesarios.slice(
        jugadoresPorEquipo,
        totalNecesario
      )

      const data: Resultado = {
        equipo1: {
          nombre: '🔵 Equipo Azul',
          jugadores: equipo1Jugadores,
        },

        equipo2: {
          nombre: '🟠 Equipo Naranja',
          jugadores: equipo2Jugadores,
        },
      }

      setTimeout(() => {
        setResultado(data)
        setCargando(false)
      }, 500)

    } catch (error) {
      console.error(error)
      setCargando(false)
    }
  }

  if (jugadores.length === 0) {
    return (
      <div className="text-center py-20 text-green-600">
        No hay jugadores registrados.
      </div>
    )
  }

  return (
    <>
      {/* SELECTOR */}
      <div className="bg-green-950 border border-green-800/60 rounded-xl p-6 mb-5">
        <h2 className="text-white font-semibold mb-4">
          Jugadores por equipo
        </h2>

        <div className="flex gap-3 flex-wrap">
          {TEAM_SIZE_OPTIONS.map(n => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setJugadoresPorEquipo(n)
                setResultado(null)
              }}
              className={`w-14 h-14 rounded-xl font-bold text-lg transition-all ${
                jugadoresPorEquipo === n
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/50'
                  : 'bg-green-900/40 text-green-400 hover:bg-green-800/40 hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <p
          className={`text-sm mt-3 ${
            valido ? 'text-green-500' : 'text-amber-400'
          }`}
        >
          {valido
            ? `Tenés ${seleccionados.length} jugadores seleccionados`
            : `Necesitás al menos ${totalNecesario} jugadores`}
        </p>
      </div>

      {/* JUGADORES */}
      <div className="bg-green-950 border border-green-800/60 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">
            Jugadores disponibles
          </h2>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setSeleccionados(jugadores.map(j => j.id))
                setResultado(null)
              }}
              className="text-xs text-green-400 hover:text-white"
            >
              Todos
            </button>

            <span className="text-green-800">|</span>

            <button
              type="button"
              onClick={() => {
                setSeleccionados([])
                setResultado(null)
              }}
              className="text-xs text-green-400 hover:text-white"
            >
              Ninguno
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {jugadores.map(jugador => {
            const activo = seleccionados.includes(jugador.id)

            return (
              <button
                type="button"
                key={jugador.id}
                onClick={() => toggleJugador(jugador.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activo
                    ? 'bg-green-800/40 border-green-500/60 text-white'
                    : 'bg-green-900/10 border-green-900/40 text-green-600 opacity-50'
                }`}
              >
                <div className="font-semibold text-sm leading-tight">
                  {jugador.nombre}
                </div>

                <div
                  className={`text-xs px-1.5 py-0.5 rounded-full inline-block mb-2 mt-2 ${
                    activo
                      ? POSICION_BADGE[jugador.posicion]
                      : 'bg-green-900/40 text-green-700'
                  }`}
                >
                  {jugador.posicion}
                </div>

                <div className="flex gap-2 text-xs">
                  <span>⚽ {jugador.goles}</span>
                  <span>🅰️ {jugador.asistencias}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* BOTON */}
      <div className="flex justify-center mb-8">
        <button
          type="button"
          onClick={generarPartido}
          disabled={!valido || cargando}
          className="px-10 py-4 bg-green-600 hover:bg-green-500 disabled:bg-green-950 disabled:text-green-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-base shadow-lg shadow-green-950/60"
        >
          {cargando
            ? 'Generando equipos...'
            : '🎲 Generar Equipos Random'}
        </button>
      </div>

      {/* RESULTADOS */}
      {resultado && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 text-center">
            Equipos generados
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {([resultado.equipo1, resultado.equipo2] as const).map(
              (equipo, ei) => {
                const totalGoles = equipo.jugadores.reduce(
                  (s, j) => s + j.goles,
                  0
                )

                const totalAsist = equipo.jugadores.reduce(
                  (s, j) => s + j.asistencias,
                  0
                )

                return (
                  <div
                    key={ei}
                    className="bg-green-950 border border-green-800/60 rounded-xl overflow-hidden"
                  >
                    <div
                      className={`px-6 py-5 border-b border-green-800/60 ${
                        ei === 0
                          ? 'bg-blue-900/20'
                          : 'bg-orange-900/20'
                      }`}
                    >
                      <h3 className="text-xl font-bold text-white">
                        {equipo.nombre}
                      </h3>

                      <div className="flex gap-4 mt-1">
                        <span className="text-green-400 text-sm">
                          ⚽ {totalGoles} goles
                        </span>

                        <span className="text-blue-400 text-sm">
                          🅰️ {totalAsist} asist.
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-green-900/60">
                      {equipo.jugadores.map(j => (
                        <div
                          key={j.id}
                          className="px-6 py-3 flex items-center justify-between hover:bg-green-900/10 transition-colors"
                        >
                          <div>
                            <p className="text-white font-medium text-sm">
                              {j.nombre}
                            </p>

                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${POSICION_BADGE[j.posicion]}`}
                            >
                              {j.posicion}
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="text-right flex flex-col items-end gap-1">
                              <p className="text-white font-bold text-sm">
                                   ⚽ {j.goles}
                                           </p>

                  <p className="text-green-400 text-xs">
                                🅰️ {j.asistencias}
                          </p>

                    <p className="text-yellow-400 text-xs font-semibold">
                          ⭐ {j.mvps || 0} MVP
                                               </p>

                           <button
                  type="button"
                  onClick={() => votarMVP(j.id)}
                 className="mt-1 text-xs bg-yellow-500 hover:bg-yellow-400 text-black px-2 py-1 rounded-lg font-bold transition-all"
  >     
              ⭐ Votar MVP
                            </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </div>
      )}
    </>
  )
}