import { supabase } from '@/lib/supabase'
import { JugadorForm } from './JugadorForm'
import { JugadorRow } from './JugadorRow'
import type { Jugador } from '@/lib/jugadores'

export default async function AdminPage() {

  const { data, error } = await supabase
    .from('jugadores')
    .select('*')
    .order('goles', { ascending: false })

  const jugadores: Jugador[] = data ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black">
      
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center text-3xl shadow-lg shadow-green-900/50">
              ⚽
            </div>

            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                Panel de Administración
              </h1>

              <p className="text-green-400 mt-1">
                Gestioná jugadores, estadísticas y rendimiento del equipo
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-5 bg-red-950/40 border border-red-800/40 rounded-2xl px-5 py-4">
              <p className="text-red-300 font-medium">
                ❌ Error de conexión con Supabase
              </p>

              <p className="text-red-400 text-sm mt-1">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-gradient-to-br from-green-900/30 to-green-950 border border-green-800/40 rounded-3xl p-6 shadow-xl">
            <p className="text-green-400 text-sm mb-2">
              Jugadores registrados
            </p>

            <h2 className="text-4xl font-black text-white">
              {jugadores.length}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-950 border border-yellow-800/30 rounded-3xl p-6 shadow-xl">
            <p className="text-yellow-400 text-sm mb-2">
              Total de goles
            </p>

            <h2 className="text-4xl font-black text-white">
              {jugadores.reduce((acc, j) => acc + j.goles, 0)}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-950 border border-blue-800/30 rounded-3xl p-6 shadow-xl">
            <p className="text-blue-400 text-sm mb-2">
              MVPs acumulados
            </p>

            <h2 className="text-4xl font-black text-white">
              {jugadores.reduce((acc, j) => acc + (j.mvps || 0), 0)}
            </h2>
          </div>

        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORM */}
          <div className="lg:col-span-1">

            <div className="bg-gradient-to-br from-green-950 to-black border border-green-800/60 rounded-3xl p-7 sticky top-6 shadow-2xl">

              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center text-xl">
                  ➕
                </div>

                <div>
                  <h2 className="text-white font-bold text-lg">
                    Nuevo jugador
                  </h2>

                  <p className="text-green-500 text-sm">
                    Registrá un nuevo integrante
                  </p>
                </div>
              </div>

              <JugadorForm />

            </div>

          </div>

          {/* PLAYER LIST */}
          <div className="lg:col-span-2">

            <div className="bg-gradient-to-br from-green-950 to-black border border-green-800/60 rounded-3xl overflow-hidden shadow-2xl">

              {/* HEADER */}
              <div className="px-7 py-6 border-b border-green-800/50 flex items-center justify-between">

                <div>
                  <h2 className="text-white text-xl font-bold">
                    Jugadores registrados
                  </h2>

                  <p className="text-green-500 text-sm mt-1">
                    Ranking actualizado en tiempo real
                  </p>
                </div>

                <div className="px-4 py-2 rounded-xl bg-green-900/30 border border-green-800/40">
                  <span className="text-green-400 text-sm font-bold">
                    {jugadores.length} jugadores
                  </span>
                </div>

              </div>

              {/* EMPTY */}
              {jugadores.length === 0 ? (

                <div className="px-6 py-24 text-center">

                  <div className="text-6xl mb-5">
                    ⚽
                  </div>

                  <h3 className="text-white text-xl font-bold mb-2">
                    No hay jugadores todavía
                  </h3>

                  <p className="text-green-600">
                    Agregá el primero desde el formulario
                  </p>

                </div>

              ) : (

                <div className="divide-y divide-green-900/40">

                  {jugadores.map((jugador, index) => (

                    <div
                      key={jugador.id}
                      className="hover:bg-green-900/10 transition-all duration-300"
                    >

                      <div className="px-4 py-2 text-xs font-bold text-green-700">
                        #{index + 1}
                      </div>

                      <JugadorRow jugador={jugador} />

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}