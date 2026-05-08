import { supabase } from '@/lib/supabase'
import type { Jugador } from '@/lib/jugadores'
import Link from 'next/link'

const POSICION_BADGE: Record<string, string> = {
  Delantero:      'bg-red-900/60 text-red-300',
  Centrocampista: 'bg-blue-900/60 text-blue-300',
  Defensa:        'bg-yellow-900/60 text-yellow-300',
  Portero:        'bg-purple-900/60 text-purple-300',
}

function calcOVR(j: Jugador): number {
  if (j.partidos === 0) return 50
  const gxp = j.goles / j.partidos
  const axp = j.asistencias / j.partidos
  const mvpRate = (j.mvps || 0) / j.partidos
  const impacto = gxp * 40 + axp * 25 + mvpRate * 15
  const ritmo = Math.min(j.partidos / 15, 1) * 10
  return Math.min(99, Math.max(50, Math.round(50 + impacto + ritmo)))
}

function ovrTier(ovr: number): { label: string; gradient: string; text: string } {
  if (ovr >= 87) return { label: 'ICON',   gradient: 'from-purple-900 via-purple-800 to-purple-950', text: 'text-purple-300' }
  if (ovr >= 75) return { label: 'GOLD',   gradient: 'from-amber-900 via-yellow-800 to-amber-950',   text: 'text-amber-300'  }
  if (ovr >= 65) return { label: 'SILVER', gradient: 'from-slate-700 via-slate-600 to-slate-800',    text: 'text-slate-300'  }
  return                { label: 'BRONZE', gradient: 'from-orange-900 via-orange-800 to-orange-950', text: 'text-orange-300' }
}

export default async function JugadoresPage() {
  const { data } = await supabase
    .from('jugadores')
    .select('*')
    .order('nombre')

  const jugadores: Jugador[] = data ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Jugadores</h1>
          <p className="text-green-400 mt-1">{jugadores.length} jugadores registrados</p>
        </div>
      </div>

      {jugadores.length === 0 ? (
        <div className="bg-green-950 border border-green-800/60 rounded-xl p-16 text-center">
          <p className="text-green-600 text-lg">No hay jugadores registrados.</p>
          <Link href="/admin" className="text-green-400 hover:text-white text-sm mt-2 inline-block transition-colors">
            Agregá jugadores desde el panel admin →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {jugadores.map(j => {
            const ovr = calcOVR(j)
            const tier = ovrTier(ovr)
            const initials = j.nombre.split(' ').map(n => n[0]).join('')

            return (
              <Link
                key={j.id}
                href={`/jugadores/${j.id}`}
                className={`bg-gradient-to-br ${tier.gradient} border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 hover:scale-105 hover:border-white/30 transition-all duration-200 shadow-lg`}
              >
                {/* Avatar */}
                {j.foto_url ? (
                  <img src={j.foto_url} alt={j.nombre} className="w-24 h-24 rounded-full object-cover border-2 border-white/20 shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-black/30 border border-white/20 flex items-center justify-center font-black text-white text-2xl">
                    {initials}
                  </div>
                )}

                {/* OVR */}
                <div className="text-center">
                  <p className={`text-4xl font-black ${tier.text}`}>{ovr}</p>
                  <p className={`text-xs font-bold tracking-widest ${tier.text} opacity-70`}>{tier.label}</p>
                </div>

                {/* Name & position */}
                <div className="text-center">
                  <p className="text-white font-bold text-sm leading-tight">{j.nombre}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${POSICION_BADGE[j.posicion]}`}>
                    {j.posicion}
                  </span>
                </div>

                {/* Quick stats */}
                <div className="w-full grid grid-cols-3 gap-1 text-center border-t border-white/10 pt-3">
                  <div>
                    <p className="text-white font-black text-sm">{j.goles}</p>
                    <p className="text-white/40 text-xs">GOL</p>
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">{j.asistencias}</p>
                    <p className="text-white/40 text-xs">ASI</p>
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">{j.mvps || 0}</p>
                    <p className="text-white/40 text-xs">MVP</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
