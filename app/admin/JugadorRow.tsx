'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import { actualizarJugador, eliminarJugador } from '@/app/actions'
import { POSICIONES } from '@/lib/jugadores'
import type { Jugador } from '@/lib/jugadores'

const POSICION_BADGE: Record<string, string> = {
  Delantero:      'bg-red-900/60 text-red-300',
  Centrocampista: 'bg-blue-900/60 text-blue-300',
  Defensa:        'bg-yellow-900/60 text-yellow-300',
  Portero:        'bg-purple-900/60 text-purple-300',
}

const inputClass =
  'bg-green-900/50 border border-green-700/60 rounded-lg px-2.5 py-1.5 text-white text-sm focus:outline-none focus:border-green-500 transition-colors w-full'

export function JugadorRow({ jugador }: { jugador: Jugador }) {
  const [editando, setEditando] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const boundAction = actualizarJugador.bind(null, jugador.id)
  const [error, action, pending] = useActionState(boundAction, null)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !pending && !error) {
      setEditando(false)
      setPreview(null)
    }
    wasPending.current = pending
  }, [pending, error])

  const initials = jugador.nombre.split(' ').map((n: string) => n[0]).join('')
  const deleteAction = eliminarJugador.bind(null, jugador.id)
  const avatarSrc = preview ?? jugador.foto_url ?? null

  if (editando) {
    return (
      <div className="px-6 py-4 bg-green-900/20 border-b border-green-900/60 last:border-b-0">
        <form action={action} className="space-y-3">
          {/* Foto */}
          <div>
            <label className="block text-green-500 text-xs mb-1">Foto</label>
            <div className="flex items-center gap-3">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="w-12 h-12 rounded-full object-cover border border-green-700 shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-800 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {initials}
                </div>
              )}
              <input
                type="file"
                name="foto"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0]
                  setPreview(file ? URL.createObjectURL(file) : null)
                }}
                className="text-green-400 text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-green-800 file:text-green-300 file:text-xs hover:file:bg-green-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Nombre y posición */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-green-500 text-xs mb-1">Nombre</label>
              <input name="nombre" type="text" defaultValue={jugador.nombre} required className={inputClass} />
            </div>
            <div>
              <label className="block text-green-500 text-xs mb-1">Posición</label>
              <select name="posicion" defaultValue={jugador.posicion} className={inputClass}>
                {POSICIONES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'goles',       label: 'Goles',         value: jugador.goles },
              { name: 'asistencias', label: 'Asistencias',   value: jugador.asistencias },
              { name: 'partidos',    label: 'Partidos (PJ)', value: jugador.partidos },
            ].map(({ name, label, value }) => (
              <div key={name}>
                <label className="block text-green-500 text-xs mb-1">{label}</label>
                <input name={name} type="number" min={0} defaultValue={value} className={inputClass} />
              </div>
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/40 rounded px-3 py-1.5">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {pending ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => { setEditando(false); setPreview(null) }}
              disabled={pending}
              className="px-4 py-1.5 bg-green-900/40 hover:bg-green-800/40 text-green-300 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-green-900/10 transition-colors border-b border-green-900/60 last:border-b-0">
      {/* Avatar + nombre */}
      <div className="flex items-center gap-3 min-w-0">
        {jugador.foto_url ? (
          <img src={jugador.foto_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-green-800 flex items-center justify-center text-white font-semibold text-xs shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white font-medium text-sm truncate">{jugador.nombre}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${POSICION_BADGE[jugador.posicion]}`}>
            {jugador.posicion}
          </span>
        </div>
      </div>

      {/* Stats + buttons */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:flex gap-5 text-center">
          <div>
            <p className="text-white font-bold text-sm">{jugador.goles}</p>
            <p className="text-green-600 text-xs">goles</p>
          </div>
          <div>
            <p className="text-green-300 font-bold text-sm">{jugador.asistencias}</p>
            <p className="text-green-600 text-xs">asist.</p>
          </div>
          <div>
            <p className="text-green-400 font-bold text-sm">{jugador.partidos}</p>
            <p className="text-green-600 text-xs">PJ</p>
          </div>
        </div>

        <button
          onClick={() => setEditando(true)}
          className="p-2 text-green-600 hover:text-green-300 hover:bg-green-800/40 rounded-lg transition-colors"
          title="Editar jugador"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>

        <form action={deleteAction}>
          <button
            type="submit"
            className="p-2 text-green-700 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
            title="Eliminar jugador"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
