'use client'

import { useActionState, useState } from 'react'
import { votarMVP } from '@/app/historial/actions'
import type { Jugador } from '@/lib/jugadores'
import type { VotoMVP } from '@/lib/historial'

type Props = {
  partidoId: string
  jugadores: Jugador[]
  votos: VotoMVP[]
}

const selectClass =
  'w-full bg-green-900/30 border border-green-800/60 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 transition-colors'

export function VotarMVP({ partidoId, jugadores, votos }: Props) {
  const [votanteId, setVotanteId] = useState('')

  const boundAction = votarMVP.bind(null, partidoId)
  const [error, action, pending] = useActionState(boundAction, null)

  const votoExistente = votanteId
    ? votos.find(v => v.votante_id === votanteId)
    : null

  // Tally: count votes per jugador
  const tally = jugadores.reduce<Record<string, number>>((acc, j) => {
    acc[j.id] = votos.filter(v => v.mvp_id === j.id).length
    return acc
  }, {})

  const maxVotos = Math.max(...Object.values(tally), 0)
  const mvpActual = maxVotos > 0 ? jugadores.find(j => tally[j.id] === maxVotos) : null

  const candidatos = [...jugadores].sort((a, b) => (tally[b.id] || 0) - (tally[a.id] || 0))

  return (
    <div className="bg-green-950 border border-green-800/60 rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-green-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Votación MVP</h2>
          {mvpActual && votos.length > 0 && (
            <p className="text-amber-400 text-sm mt-0.5">
              ⭐ Líder actual: {mvpActual.nombre}
            </p>
          )}
        </div>
        <span className="text-green-500 text-sm">{votos.length} votos emitidos</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-green-900/60">

        {/* ── Voting form ── */}
        <div className="p-6 space-y-4">
          <p className="text-green-500 text-sm">
            Una sola votación por persona. No podés votarte a vos mismo.
          </p>

          {/* Who are you? */}
          <div>
            <label className="block text-green-400 text-xs font-semibold uppercase tracking-wider mb-2">
              ¿Quién sos?
            </label>
            <select
              value={votanteId}
              onChange={e => setVotanteId(e.target.value)}
              className={selectClass}
            >
              <option value="">— Seleccioná tu nombre —</option>
              {jugadores.map(j => (
                <option key={j.id} value={j.id}>{j.nombre}</option>
              ))}
            </select>
          </div>

          {/* Already voted */}
          {votanteId && votoExistente && (
            <div className="bg-green-900/30 border border-green-700/40 rounded-lg p-4">
              <p className="text-green-400 text-sm">Ya votaste en este partido.</p>
              <p className="text-white font-semibold mt-1">
                Tu voto fue para:{' '}
                <span className="text-amber-400">
                  {jugadores.find(j => j.id === votoExistente.mvp_id)?.nombre ?? '—'}
                </span>
              </p>
            </div>
          )}

          {/* Vote form */}
          {votanteId && !votoExistente && (
            <form action={action} className="space-y-4">
              <input type="hidden" name="votante_id" value={votanteId} />

              <div>
                <label className="block text-green-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  ¿Tu MVP del partido?
                </label>
                <select name="mvp_id" required className={selectClass}>
                  <option value="">— Elegí al mejor del partido —</option>
                  {jugadores
                    .filter(j => j.id !== votanteId)
                    .map(j => (
                      <option key={j.id} value={j.id}>{j.nombre}</option>
                    ))}
                </select>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors text-sm"
              >
                {pending ? 'Votando...' : '⭐ Confirmar voto'}
              </button>
            </form>
          )}

          {/* Not selected yet — idle state */}
          {!votanteId && (
            <p className="text-green-700 text-sm italic">
              Seleccioná tu nombre para votar o ver si ya votaste.
            </p>
          )}
        </div>

        {/* ── Vote tally ── */}
        <div className="p-6">
          <h3 className="text-white font-semibold mb-4">Resultados</h3>

          {votos.length === 0 ? (
            <p className="text-green-700 text-sm italic">Todavía no hay votos.</p>
          ) : (
            <div className="space-y-4">
              {candidatos
                .filter(j => (tally[j.id] || 0) > 0)
                .map(jugador => {
                  const count = tally[jugador.id] || 0
                  const pct = (count / votos.length) * 100
                  const isLeader = count === maxVotos && count > 0

                  return (
                    <div key={jugador.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm font-medium ${isLeader ? 'text-amber-400' : 'text-white'}`}>
                          {isLeader && '⭐ '}{jugador.nombre}
                        </span>
                        <span className={`text-sm font-bold tabular-nums ${isLeader ? 'text-amber-400' : 'text-green-400'}`}>
                          {count} {count === 1 ? 'voto' : 'votos'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-green-900/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isLeader ? 'bg-amber-400' : 'bg-green-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}

              {/* Players with 0 votes */}
              {candidatos
                .filter(j => !tally[j.id])
                .map(jugador => (
                  <div key={jugador.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-green-700">{jugador.nombre}</span>
                      <span className="text-xs text-green-800">0 votos</span>
                    </div>
                    <div className="w-full h-2 bg-green-900/30 rounded-full" />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
