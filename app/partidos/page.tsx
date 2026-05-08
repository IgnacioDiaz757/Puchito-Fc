import { supabase } from '@/lib/supabase'
import { GeneradorPartidos } from './GeneradorPartidos'
import type { Jugador } from '@/lib/jugadores'

export default async function PartidosPage() {
  const { data, error } = await supabase
    .from('jugadores')
    .select('*')
    .order('nombre')

  console.log('JUGADORES:', data)
  console.log('ERROR:', error)

  const jugadores: Jugador[] = data ?? []

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Generador de Partidos
        </h1>

        <p className="text-green-400 mt-1">
          Seleccioná jugadores y generá equipos random
        </p>
      </div>

      <GeneradorPartidos jugadores={jugadores} />
    </div>
  )
}