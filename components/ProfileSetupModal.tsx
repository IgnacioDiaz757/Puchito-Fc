'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setupJugador } from '@/app/auth/actions'
import { POSICIONES } from '@/lib/jugadores'

export default function ProfileSetupModal() {
  const router = useRouter()
  const [result, action, pending] = useActionState(setupJugador, null)

  useEffect(() => {
    if (result === 'success') router.refresh()
  }, [result, router])

  const error = result && result !== 'success' ? result : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-[#060f08] border border-green-800/60 rounded-2xl p-8 shadow-2xl">

        <div className="text-center mb-7">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center font-bold text-white mx-auto mb-4">
            BFC
          </div>
          <h2 className="text-white text-xl font-black">Completá tu perfil</h2>
          <p className="text-green-600 text-sm mt-1">Ingresá tus datos de jugador para continuar</p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-green-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
              Tu nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              autoFocus
              placeholder="Ej: Juan García"
              className="w-full bg-green-950 border border-green-800/60 rounded-xl px-4 py-3 text-white placeholder-green-800 focus:outline-none focus:border-green-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label htmlFor="posicion" className="block text-green-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
              Posición
            </label>
            <select
              id="posicion"
              name="posicion"
              defaultValue="Delantero"
              className="w-full bg-green-950 border border-green-800/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors text-sm"
            >
              {POSICIONES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm mt-2"
          >
            {pending ? 'Guardando...' : 'Empezar a jugar'}
          </button>
        </form>
      </div>
    </div>
  )
}
