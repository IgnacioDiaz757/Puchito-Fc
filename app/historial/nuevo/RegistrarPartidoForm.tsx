'use client'

import { useActionState, useState } from 'react'
import { registrarPartido } from '@/app/historial/actions'
import type { Jugador } from '@/lib/jugadores'

type Asignacion = 0 | 1 | 2

const POSICION_BADGE: Record<string, string> = {
  Delantero:      'bg-red-900/60 text-red-300',
  Centrocampista: 'bg-blue-900/60 text-blue-300',
  Defensa:        'bg-yellow-900/60 text-yellow-300',
  Portero:        'bg-purple-900/60 text-purple-300',
}

const inputBase = 'w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none transition-colors'

export function RegistrarPartidoForm({ jugadores }: { jugadores: Jugador[] }) {
  const [error, action, pending] = useActionState(registrarPartido, null)
  const [asignaciones, setAsignaciones] = useState<Record<string, Asignacion>>(
    Object.fromEntries(jugadores.map(j => [j.id, 0 as Asignacion]))
  )

  const toggle = (id: string, equipo: 1 | 2) => {
    setAsignaciones(prev => ({ ...prev, [id]: prev[id] === equipo ? 0 : equipo }))
  }

  const equipo1Ids = Object.entries(asignaciones).filter(([, e]) => e === 1).map(([id]) => id)
  const equipo2Ids = Object.entries(asignaciones).filter(([, e]) => e === 2).map(([id]) => id)
  const today = new Date().toISOString().split('T')[0]

  return (
    <form action={action} className="space-y-6">
      {/* Date */}
      <div>
        <label className="block text-green-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
          Fecha
        </label>
        <input
          name="fecha"
          type="date"
          defaultValue={today}
          required
          className={`${inputBase} bg-green-900/30 border border-green-800/60 focus:border-green-500`}
        />
      </div>

      {/* Teams side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-blue-400 text-xs font-semibold uppercase tracking-wider">
            Equipo 1
          </label>
          <input
            name="equipo1_nombre"
            type="text"
            required
            placeholder="Nombre del equipo"
            className={`${inputBase} bg-blue-900/20 border border-blue-800/40 focus:border-blue-500`}
          />
          <div>
            <label className="block text-blue-400 text-xs mb-1">Goles</label>
            <input
              name="goles_equipo1"
              type="number"
              min={0}
              defaultValue={0}
              className={`${inputBase} bg-blue-900/20 border border-blue-800/40 focus:border-blue-500`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-orange-400 text-xs font-semibold uppercase tracking-wider">
            Equipo 2
          </label>
          <input
            name="equipo2_nombre"
            type="text"
            required
            placeholder="Nombre del equipo"
            className={`${inputBase} bg-orange-900/20 border border-orange-800/40 focus:border-orange-500`}
          />
          <div>
            <label className="block text-orange-400 text-xs mb-1">Goles</label>
            <input
              name="goles_equipo2"
              type="number"
              min={0}
              defaultValue={0}
              className={`${inputBase} bg-orange-900/20 border border-orange-800/40 focus:border-orange-500`}
            />
          </div>
        </div>
      </div>

      {/* Player assignment */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-green-400 text-xs font-semibold uppercase tracking-wider">
            Asignar jugadores
          </label>
          <div className="flex gap-3 text-xs">
            <span className="text-blue-400 font-medium">{equipo1Ids.length} en E1</span>
            <span className="text-green-700">·</span>
            <span className="text-orange-400 font-medium">{equipo2Ids.length} en E2</span>
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 -mr-1">
          {jugadores.map(jugador => {
            const asig = asignaciones[jugador.id]
            return (
              <div
                key={jugador.id}
                className={`flex items-center justify-between rounded-lg px-3 py-2 border transition-colors ${
                  asig === 1 ? 'bg-blue-900/20 border-blue-800/40'
                  : asig === 2 ? 'bg-orange-900/20 border-orange-800/40'
                  : 'bg-green-900/20 border-green-900/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-green-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {jugador.nombre.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{jugador.nombre}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${POSICION_BADGE[jugador.posicion]}`}>
                      {jugador.posicion.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => toggle(jugador.id, 1)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      asig === 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-900/30 text-blue-600 hover:text-blue-400'
                    }`}
                  >
                    E1
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(jugador.id, 2)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      asig === 2
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-900/30 text-orange-600 hover:text-orange-400'
                    }`}
                  >
                    E2
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hidden inputs for form submission */}
      {equipo1Ids.map(id => <input key={id} type="hidden" name="jugadores_equipo1" value={id} />)}
      {equipo2Ids.map(id => <input key={id} type="hidden" name="jugadores_equipo2" value={id} />)}

      {error && (
        <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || equipo1Ids.length === 0 || equipo2Ids.length === 0}
        className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:text-green-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
      >
        {pending ? 'Guardando...' : 'Registrar Partido'}
      </button>
    </form>
  )
}
