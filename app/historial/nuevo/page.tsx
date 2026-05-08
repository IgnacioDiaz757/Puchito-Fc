import { supabase } from '@/lib/supabase'
import { RegistrarPartidoForm } from './RegistrarPartidoForm'
import Link from 'next/link'
import type { Jugador } from '@/lib/jugadores'

export default async function NuevoPartidoPage() {
  const { data } = await supabase
    .from('jugadores')
    .select('*')
    .order('nombre')

  const jugadores: Jugador[] = data ?? []

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link
          href="/historial"
          className="text-green-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 mb-4"
        >
          ← Volver al historial
        </Link>
        <h1 className="text-3xl font-bold text-white">Registrar Partido</h1>
        <p className="text-green-400 mt-1">
          Cargá el resultado y asigná los jugadores de cada equipo
        </p>
      </div>

      {jugadores.length === 0 ? (
        <div className="bg-green-950 border border-green-800/60 rounded-xl p-10 text-center text-green-600">
          No hay jugadores registrados.{' '}
          <Link href="/admin" className="text-green-400 hover:text-white underline transition-colors">
            Agregá jugadores desde el panel admin.
          </Link>
        </div>
      ) : (
        <div className="bg-green-950 border border-green-800/60 rounded-xl p-6">
          <RegistrarPartidoForm jugadores={jugadores} />
        </div>
      )}
    </div>
  )
}
