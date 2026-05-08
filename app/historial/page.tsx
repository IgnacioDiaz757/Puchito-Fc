import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Partido } from '@/lib/historial'

function formatFecha(fecha: string) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function HistorialPage() {
  const { data } = await supabase
    .from('partidos')
    .select('*')
    .order('fecha', { ascending: false })

  const partidos: Partido[] = data ?? []

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Historial de Partidos</h1>
          <p className="text-green-400 mt-1">{partidos.length} partidos jugados</p>
        </div>
        <Link
          href="/historial/nuevo"
          className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          + Registrar partido
        </Link>
      </div>

      {partidos.length === 0 ? (
        <div className="bg-green-950 border border-green-800/60 rounded-xl p-16 text-center text-green-600">
          No hay partidos registrados.{' '}
          <Link href="/historial/nuevo" className="text-green-400 hover:text-white underline transition-colors">
            Registrá el primero.
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {partidos.map(partido => {
            const resultado =
              partido.goles_equipo1 > partido.goles_equipo2 ? 'equipo1'
              : partido.goles_equipo2 > partido.goles_equipo1 ? 'equipo2'
              : 'empate'

            return (
              <Link
                key={partido.id}
                href={`/historial/${partido.id}`}
                className="flex items-center justify-between bg-green-950 border border-green-800/60 rounded-xl px-6 py-5 hover:border-green-600/50 hover:bg-green-900/20 transition-all group"
              >
                {/* Team 1 */}
                <div className="flex-1 text-right">
                  <p className={`text-base font-bold ${resultado === 'equipo1' ? 'text-white' : 'text-green-600'}`}>
                    {partido.equipo1_nombre}
                  </p>
                  {resultado === 'equipo1' && (
                    <span className="text-xs text-blue-400 font-semibold">GANADOR</span>
                  )}
                </div>

                {/* Score */}
                <div className="flex items-center gap-3 px-6 text-center">
                  <span className={`text-4xl font-black tabular-nums ${resultado === 'equipo1' ? 'text-white' : 'text-green-600'}`}>
                    {partido.goles_equipo1}
                  </span>
                  <div className="text-center">
                    <span className="text-green-700 text-xl">—</span>
                    {resultado === 'empate' && (
                      <p className="text-green-500 text-xs font-semibold">Empate</p>
                    )}
                  </div>
                  <span className={`text-4xl font-black tabular-nums ${resultado === 'equipo2' ? 'text-white' : 'text-green-600'}`}>
                    {partido.goles_equipo2}
                  </span>
                </div>

                {/* Team 2 + date */}
                <div className="flex-1">
                  <p className={`text-base font-bold ${resultado === 'equipo2' ? 'text-white' : 'text-green-600'}`}>
                    {partido.equipo2_nombre}
                  </p>
                  {resultado === 'equipo2' && (
                    <span className="text-xs text-orange-400 font-semibold">GANADOR</span>
                  )}
                </div>

                {/* Date + arrow */}
                <div className="pl-6 text-right shrink-0">
                  <p className="text-green-500 text-xs">{formatFecha(partido.fecha)}</p>
                  <p className="text-green-700 text-xs group-hover:text-green-400 transition-colors mt-1">
                    Ver detalles →
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
