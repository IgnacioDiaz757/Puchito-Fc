import { supabase } from '@/lib/supabase'
import { VotarMVP } from './VotarMVP'
import Link from 'next/link'
import type { Jugador } from '@/lib/jugadores'
import type { VotoMVP } from '@/lib/historial'

const POSICION_BADGE: Record<string, string> = {
  Delantero:      'bg-red-900/60 text-red-300',
  Centrocampista: 'bg-blue-900/60 text-blue-300',
  Defensa:        'bg-yellow-900/60 text-yellow-300',
  Portero:        'bg-purple-900/60 text-purple-300',
}

function formatFecha(fecha: string) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function PartidoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [{ data: partido }, { data: pjData }, { data: votosData }] = await Promise.all([
    supabase.from('partidos').select('*').eq('id', id).single(),
    supabase
      .from('partido_jugadores')
      .select('equipo, jugador:jugadores(*)')
      .eq('partido_id', id),
    supabase
      .from('votos_mvp')
      .select('votante_id, mvp_id')
      .eq('partido_id', id),
  ])

  if (!partido) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-red-400">Partido no encontrado.</p>
        <Link href="/historial" className="text-green-400 hover:text-white text-sm mt-2 inline-block">
          ← Volver al historial
        </Link>
      </div>
    )
  }

  type PJRow = {
  equipo: number
  jugador: Jugador[]
}

const rows = (pjData ?? []) as PJRow[]

const equipo1: Jugador[] = rows
  .filter(r => r.equipo === 1)
  .flatMap(r => r.jugador)

const equipo2: Jugador[] = rows
  .filter(r => r.equipo === 2)
  .flatMap(r => r.jugador)
  const todosJugadores: Jugador[] = [...equipo1, ...equipo2]
  const votos: VotoMVP[] = (votosData ?? []) as VotoMVP[]

  const resultado =
    partido.goles_equipo1 > partido.goles_equipo2 ? 'equipo1'
    : partido.goles_equipo2 > partido.goles_equipo1 ? 'equipo2'
    : 'empate'

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link
        href="/historial"
        className="text-green-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 mb-6"
      >
        ← Volver al historial
      </Link>

      {/* Match header */}
      <div className="bg-green-950 border border-green-800/60 rounded-xl p-8 mb-6 text-center">
        <p className="text-green-500 text-sm capitalize mb-5">
          {formatFecha(partido.fecha)}
        </p>

        <div className="flex items-center justify-center gap-6 md:gap-12">
          {/* Team 1 */}
          <div className="flex-1 text-right">
            <p className={`text-xl md:text-2xl font-bold ${resultado === 'equipo1' ? 'text-white' : 'text-green-700'}`}>
              {partido.equipo1_nombre}
            </p>
            {resultado === 'equipo1' && (
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wide">Ganador</span>
            )}
          </div>

          {/* Score */}
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-6xl md:text-7xl font-black tabular-nums ${resultado === 'equipo1' ? 'text-white' : 'text-green-700'}`}>
              {partido.goles_equipo1}
            </span>
            <div className="text-center">
              <span className="text-green-800 text-3xl font-light">—</span>
              {resultado === 'empate' && (
                <p className="text-green-400 text-xs font-bold mt-1">EMPATE</p>
              )}
            </div>
            <span className={`text-6xl md:text-7xl font-black tabular-nums ${resultado === 'equipo2' ? 'text-white' : 'text-green-700'}`}>
              {partido.goles_equipo2}
            </span>
          </div>

          {/* Team 2 */}
          <div className="flex-1 text-left">
            <p className={`text-xl md:text-2xl font-bold ${resultado === 'equipo2' ? 'text-white' : 'text-green-700'}`}>
              {partido.equipo2_nombre}
            </p>
            {resultado === 'equipo2' && (
              <span className="text-xs text-orange-400 font-bold uppercase tracking-wide">Ganador</span>
            )}
          </div>
        </div>
      </div>

      {/* Players per team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {[
          { nombre: partido.equipo1_nombre, jugadores: equipo1, color: 'bg-blue-900/20', label: 'text-blue-400' },
          { nombre: partido.equipo2_nombre, jugadores: equipo2, color: 'bg-orange-900/20', label: 'text-orange-400' },
        ].map((equipo, ei) => (
          <div key={ei} className="bg-green-950 border border-green-800/60 rounded-xl overflow-hidden">
            <div className={`px-6 py-4 border-b border-green-800/60 ${equipo.color}`}>
              <h2 className="text-white font-bold">{equipo.nombre}</h2>
              <p className={`text-xs font-semibold mt-0.5 ${equipo.label}`}>
                {equipo.jugadores.length} jugadores
              </p>
            </div>
            <div className="divide-y divide-green-900/60">
              {equipo.jugadores.length === 0 ? (
                <p className="px-6 py-4 text-green-700 text-sm">Sin jugadores registrados</p>
              ) : (
                equipo.jugadores.map(j => (
                  <div key={j.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{j.nombre}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${POSICION_BADGE[j.posicion]}`}>
                        {j.posicion}
                      </span>
                    </div>
                    <div className="text-right text-xs text-green-500">
                      <p>{j.goles} goles</p>
                      <p>{j.asistencias} asist.</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MVP voting */}
      {todosJugadores.length > 0 && (
        <VotarMVP
          partidoId={id}
          jugadores={todosJugadores}
          votos={votos}
        />
      )}
    </div>
  )
}
