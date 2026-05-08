import { supabase } from '@/lib/supabase'
import type { Jugador } from '@/lib/jugadores'
import Link from 'next/link'

const POSICION_BADGE: Record<string, string> = {
  Delantero: 'bg-red-900/60 text-red-300',
  Centrocampista: 'bg-blue-900/60 text-blue-300',
  Defensa: 'bg-yellow-900/60 text-yellow-300',
  Portero: 'bg-purple-900/60 text-purple-300',
}

const MEDALLAS = ['🥇', '🥈', '🥉']

export default async function Home() {

  const { data } = await supabase
    .from('jugadores')
    .select('*')
    .order('goles', { ascending: false })

  const goleadores: Jugador[] = data ?? []

  const totalGoles = goleadores.reduce(
    (s, j) => s + j.goles,
    0
  )

  const totalAsistencias = goleadores.reduce(
    (s, j) => s + j.asistencias,
    0
  )

  const totalPartidos =
    goleadores.length > 0
      ? Math.max(...goleadores.map(j => j.partidos))
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black">

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="mb-10">

          <div className="flex items-center gap-4 mb-3">

            <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center text-4xl shadow-lg shadow-green-900/60">
              ⚽
            </div>

            <div>
              <h1 className="text-4xl font-black text-white">
                Dashboard
              </h1>

              <p className="text-green-400 mt-1">
                Temporada 2025 / 2026
              </p>
            </div>

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="bg-gradient-to-br from-green-900/30 to-green-950 border border-green-800/40 rounded-3xl p-7 shadow-2xl">
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest">
              Total Goles
            </p>

            <h2 className="text-5xl font-black text-white mt-3">
              {totalGoles}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-950 border border-blue-800/30 rounded-3xl p-7 shadow-2xl">
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest">
              Asistencias
            </p>

            <h2 className="text-5xl font-black text-white mt-3">
              {totalAsistencias}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-950 border border-yellow-800/30 rounded-3xl p-7 shadow-2xl">
            <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest">
              Partidos
            </p>

            <h2 className="text-5xl font-black text-white mt-3">
              {totalPartidos}
            </h2>
          </div>

        </div>

        {/* TABLA */}
        <div className="bg-gradient-to-br from-green-950 to-black border border-green-800/60 rounded-3xl overflow-hidden shadow-2xl">

          {/* HEADER TABLA */}
          <div className="px-7 py-6 border-b border-green-800/50 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-black text-white">
                Tabla de Goleadores
              </h2>

              <p className="text-green-500 text-sm mt-1">
                Ranking actualizado en tiempo real
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-green-900/30 border border-green-800/40">
              <span className="text-green-400 text-sm font-bold">
                {goleadores.length} jugadores
              </span>
            </div>

          </div>

          {/* VACIO */}
          {goleadores.length === 0 ? (

            <div className="px-6 py-24 text-center">

              <div className="text-7xl mb-5">
                ⚽
              </div>

              <h3 className="text-white text-2xl font-black mb-2">
                No hay jugadores todavía
              </h3>

              <p className="text-green-600">
                Agregá jugadores desde el panel admin
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-green-900/20 border-b border-green-800/40">

                    {['#', 'Jugador', 'Goles', 'Asist.', 'PJ', 'Promedio'].map(h => (

                      <th
                        key={h}
                        className={`py-4 text-xs font-bold uppercase tracking-widest text-green-400 ${
                          h === '#' || h === 'Jugador'
                            ? 'px-6 text-left'
                            : 'px-4 text-center'
                        }`}
                      >
                        {h}
                      </th>

                    ))}

                  </tr>

                </thead>

                <tbody className="divide-y divide-green-900/30">

                  {goleadores.map((jugador, idx) => {

                    const isTop = idx === 0

                    const initials = jugador.nombre
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')

                    return (

                      <tr
                        key={jugador.id}
                        className={`hover:bg-green-900/10 transition-all duration-300 ${
                          isTop
                            ? 'bg-amber-950/10'
                            : ''
                        }`}
                      >

                        <td className="px-6 py-5">

                          {idx < 3 ? (
                            <span className="text-3xl">
                              {MEDALLAS[idx]}
                            </span>
                          ) : (
                            <span className="text-green-700 font-bold">
                              #{idx + 1}
                            </span>
                          )}

                        </td>

                        <td className="px-6 py-5">

                          <Link href={`/jugadores/${jugador.id}`} className="flex items-center gap-4 group">

                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg transition-transform group-hover:scale-105 ${
                              isTop
                                ? 'bg-amber-500 text-black'
                                : 'bg-green-800 text-white'
                            }`}>
                              {initials}
                            </div>

                            <div>

                              <p className={`font-bold text-lg group-hover:underline underline-offset-2 ${
                                isTop
                                  ? 'text-amber-400'
                                  : 'text-white'
                              }`}>
                                {jugador.nombre}
                              </p>

                              <div className="flex items-center gap-2 mt-1">

                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${POSICION_BADGE[jugador.posicion]}`}>
                                  {jugador.posicion}
                                </span>

                                <span className="text-yellow-400 text-xs font-bold">
                                  🏆 {jugador.mvps || 0}
                                </span>

                              </div>

                            </div>

                          </Link>

                        </td>

                        <td className="px-4 py-5 text-center">

                          <span className={`text-3xl font-black ${
                            isTop
                              ? 'text-amber-400'
                              : 'text-white'
                          }`}>
                            {jugador.goles}
                          </span>

                        </td>

                        <td className="px-4 py-5 text-center">

                          <span className="text-green-300 font-bold">
                            {jugador.asistencias}
                          </span>

                        </td>

                        <td className="px-4 py-5 text-center">

                          <span className="text-green-500 font-bold">
                            {jugador.partidos}
                          </span>

                        </td>

                        <td className="px-4 py-5 text-center">

                          <span className="text-green-400 font-bold tabular-nums">
                            {jugador.partidos > 0
                              ? (jugador.goles / jugador.partidos).toFixed(2)
                              : '0.00'}
                          </span>

                        </td>

                      </tr>

                    )
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  )
}