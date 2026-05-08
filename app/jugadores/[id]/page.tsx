import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Jugador } from '@/lib/jugadores'

// ── Types ────────────────────────────────────────────────────────────────────

type PartidoRow = {
  equipo: 1 | 2
  partido: {
    id: string
    fecha: string
    equipo1_nombre: string
    equipo2_nombre: string
    goles_equipo1: number
    goles_equipo2: number
  }
}

type Resultado = 'V' | 'E' | 'D'

// ── Helpers ──────────────────────────────────────────────────────────────────

function calcOVR(j: Jugador): number {
  if (j.partidos === 0) return 50
  const gxp       = j.goles / j.partidos
  const axp       = j.asistencias / j.partidos
  const mvpRate   = (j.mvps || 0) / j.partidos
  const impacto   = gxp * 40 + axp * 25 + mvpRate * 15
  const ritmo     = Math.min(j.partidos / 15, 1) * 10
  return Math.min(99, Math.max(50, Math.round(50 + impacto + ritmo)))
}

function calcAttr(val: number, max: number): number {
  return Math.min(99, Math.max(25, Math.round((val / max) * 99)))
}

type CardTier = { bg: string; shine: string; text: string; badge: string; label: string }

function getCardTier(ovr: number): CardTier {
  if (ovr >= 87) return {
    bg:    'from-amber-300 via-yellow-100 to-amber-400',
    shine: 'bg-gradient-to-br from-amber-200/40 to-transparent',
    text:  'text-amber-900',
    badge: 'bg-amber-900/20 text-amber-900',
    label: 'ICON',
  }
  if (ovr >= 75) return {
    bg:    'from-yellow-600 via-amber-500 to-yellow-700',
    shine: 'bg-gradient-to-br from-yellow-300/20 to-transparent',
    text:  'text-yellow-950',
    badge: 'bg-yellow-950/20 text-yellow-950',
    label: 'GOLD',
  }
  if (ovr >= 65) return {
    bg:    'from-slate-300 via-gray-200 to-slate-400',
    shine: 'bg-gradient-to-br from-white/30 to-transparent',
    text:  'text-slate-800',
    badge: 'bg-slate-800/20 text-slate-800',
    label: 'SILVER',
  }
  return {
    bg:    'from-amber-800 via-orange-700 to-amber-900',
    shine: 'bg-gradient-to-br from-orange-400/20 to-transparent',
    text:  'text-amber-100',
    badge: 'bg-amber-100/20 text-amber-100',
    label: 'BRONZE',
  }
}

function getResultado(h: PartidoRow): Resultado {
  const { goles_equipo1, goles_equipo2 } = h.partido
  if (goles_equipo1 === goles_equipo2) return 'E'
  const gano1 = goles_equipo1 > goles_equipo2
  return (h.equipo === 1) === gano1 ? 'V' : 'D'
}

function formatFecha(fecha: string) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const RESULT_STYLE: Record<Resultado, string> = {
  V: 'bg-green-600 text-white',
  E: 'bg-yellow-600 text-white',
  D: 'bg-red-700 text-white',
}

const RESULT_LABEL: Record<Resultado, string> = {
  V: 'Victoria', E: 'Empate', D: 'Derrota',
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function JugadorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [{ data: rawJugador }, { data: rawHistorial }] = await Promise.all([
    supabase.from('jugadores').select('*').eq('id', id).single(),
    supabase
      .from('partido_jugadores')
      .select('equipo, partido:partidos(id, fecha, equipo1_nombre, equipo2_nombre, goles_equipo1, goles_equipo2)')
      .eq('jugador_id', id),
  ])

  if (!rawJugador) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <p className="text-red-400">Jugador no encontrado.</p>
        <Link href="/" className="text-green-400 hover:text-white text-sm mt-2 inline-block">← Volver</Link>
      </div>
    )
  }

  const j = rawJugador as Jugador
  const historial = ((rawHistorial ?? []) as Array<{ equipo: 1 | 2; partido: PartidoRow['partido'][] | null }>)
    .filter(h => h.partido?.[0])
    .map(h => ({ equipo: h.equipo, partido: h.partido![0] } as PartidoRow))
    .sort((a, b) => b.partido.fecha.localeCompare(a.partido.fecha))

  // ── Computed stats ──────────────────────────────────────────────────────────
  const ovr      = calcOVR(j)
  const tier     = getCardTier(ovr)
  const initials = j.nombre.split(' ').map(n => n[0]).join('')

  const gxp     = j.partidos > 0 ? j.goles / j.partidos : 0
  const axp     = j.partidos > 0 ? j.asistencias / j.partidos : 0
  const efi     = gxp + axp
  const mvpRate = j.partidos > 0 ? (j.mvps || 0) / j.partidos : 0

  const atributos = [
    { label: 'GOL', value: calcAttr(gxp,     1.0), desc: 'Goles por partido' },
    { label: 'ASI', value: calcAttr(axp,     0.75), desc: 'Asistencias por partido' },
    { label: 'EFI', value: calcAttr(efi,     1.5),  desc: 'G+A por partido' },
    { label: 'MVP', value: calcAttr(mvpRate, 0.5),  desc: 'Tasa de MVP' },
    { label: 'RIT', value: calcAttr(j.partidos, 20), desc: 'Partidos jugados' },
    { label: 'G/P', value: calcAttr(gxp,     0.8),  desc: 'Promedio de gol' },
  ]

  const resultados = historial.map(getResultado)
  const victorias  = resultados.filter(r => r === 'V').length
  const empates    = resultados.filter(r => r === 'E').length
  const derrotas   = resultados.filter(r => r === 'D').length
  const forma      = resultados.slice(0, 5)
  const pctVictorias = historial.length > 0
    ? Math.round((victorias / historial.length) * 100)
    : 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="text-green-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 mb-8"
      >
        ← Volver al dashboard
      </Link>

      {/* ── Top: FIFA card + right column ── */}
      <div className="flex flex-col lg:flex-row gap-10 mb-10">

        {/* FIFA Card */}
        <div className="flex justify-center lg:justify-start shrink-0">
          <div
            className={`relative w-60 rounded-2xl bg-gradient-to-b ${tier.bg} shadow-2xl overflow-hidden`}
            style={{ aspectRatio: '2.5/3.5' }}
          >
            {/* Shine overlay */}
            <div className={`absolute inset-0 ${tier.shine} pointer-events-none`} />

            <div className="relative h-full flex flex-col p-4">
              {/* OVR + label + position */}
              <div className={`flex items-start justify-between ${tier.text}`}>
                <div>
                  <div className="text-6xl font-black leading-none tracking-tight">{ovr}</div>
                  <div className={`text-xs font-black uppercase tracking-widest mt-0.5 px-2 py-0.5 rounded-full w-fit ${tier.badge}`}>
                    {tier.label}
                  </div>
                  <div className="text-sm font-bold mt-2 opacity-80">{j.posicion.slice(0, 3).toUpperCase()}</div>
                </div>
                {/* decorative dots */}
                <div className="opacity-20 text-right text-xs leading-relaxed">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>● ● ●</div>
                  ))}
                </div>
              </div>

              {/* Avatar */}
              <div className="flex justify-center flex-1 items-center py-2">
                {j.foto_url ? (
                  <img
                    src={j.foto_url}
                    alt={j.nombre}
                    className="w-36 h-36 rounded-full object-cover shadow-xl border-4 border-black/10"
                  />
                ) : (
                  <div className={`w-36 h-36 rounded-full flex items-center justify-center font-black text-4xl shadow-xl border-4 border-black/10 ${tier.text} bg-black/15`}>
                    {initials}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className={`text-center font-black text-sm uppercase tracking-wider leading-tight mb-3 ${tier.text}`}>
                {j.nombre.split(' ')[0]}
                {j.nombre.split(' ').length > 1 && (
                  <><br />{j.nombre.split(' ').slice(1).join(' ')}</>
                )}
              </div>

              {/* 6 attributes 2×3 */}
              <div className={`grid grid-cols-3 gap-0 border-t border-black/20 pt-3 ${tier.text}`}>
                {atributos.map(a => (
                  <div key={a.label} className="text-center py-1">
                    <div className="text-xl font-black leading-none">{a.value}</div>
                    <div className="text-xs font-bold opacity-60 mt-0.5">{a.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: name, forma, stats, attribute bars */}
        <div className="flex-1 space-y-6">

          {/* Name + position */}
          <div>
            <h1 className="text-4xl font-black text-white leading-tight">{j.nombre}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-green-400 font-semibold">{j.posicion}</span>
              <span className="text-green-800">·</span>
              <span className="text-green-500 text-sm font-medium">OVR {ovr}</span>
              <span className="text-green-800">·</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                ovr >= 87 ? 'bg-amber-500/20 text-amber-400'
                : ovr >= 75 ? 'bg-yellow-500/20 text-yellow-400'
                : ovr >= 65 ? 'bg-slate-500/20 text-slate-300'
                : 'bg-orange-800/20 text-orange-400'
              }`}>
                {tier.label}
              </span>
            </div>
          </div>

          {/* Forma: últimos 5 partidos */}
          <div>
            <p className="text-green-500 text-xs font-semibold uppercase tracking-widest mb-2">
              Forma reciente
            </p>
            <div className="flex items-center gap-2">
              {forma.map((r, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shadow-lg ${RESULT_STYLE[r]}`}
                  title={RESULT_LABEL[r]}
                >
                  {r}
                </div>
              ))}
              {Array.from({ length: 5 - forma.length }).map((_, i) => (
                <div key={i} className="w-9 h-9 rounded-xl bg-green-900/30 border border-green-900/40" />
              ))}
              {forma.length === 0 && (
                <span className="text-green-700 text-sm italic">Sin partidos registrados</span>
              )}
            </div>
          </div>

          {/* Season stats */}
          <div>
            <p className="text-green-500 text-xs font-semibold uppercase tracking-widest mb-3">
              Estadísticas
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Goles',       value: j.goles,       color: 'text-white' },
                { label: 'Asistencias', value: j.asistencias, color: 'text-green-300' },
                { label: 'Partidos',    value: j.partidos,    color: 'text-green-400' },
                { label: 'MVPs',        value: j.mvps || 0,   color: 'text-amber-400' },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="bg-green-950 border border-green-800/60 rounded-xl p-4 text-center"
                >
                  <p className={`text-3xl font-black ${color}`}>{value}</p>
                  <p className="text-green-600 text-xs mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Attribute bars */}
          <div>
            <p className="text-green-500 text-xs font-semibold uppercase tracking-widest mb-3">
              Atributos
            </p>
            <div className="space-y-2.5">
              {atributos.map(a => {
                const color = a.value >= 80 ? 'bg-green-400'
                  : a.value >= 65 ? 'bg-amber-400'
                  : 'bg-orange-500'
                const textColor = a.value >= 80 ? 'text-green-400'
                  : a.value >= 65 ? 'text-amber-400'
                  : 'text-orange-500'
                return (
                  <div key={a.label} className="flex items-center gap-3">
                    <span className="text-green-500 text-xs font-black w-8 shrink-0">{a.label}</span>
                    <div className="flex-1 h-2.5 bg-green-900/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${a.value}%`, transition: 'width 0.8s ease' }}
                      />
                    </div>
                    <span className={`text-sm font-black w-8 text-right tabular-nums ${textColor}`}>
                      {a.value}
                    </span>
                    <span className="text-green-800 text-xs w-44 hidden sm:block">{a.desc}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Win/Draw/Loss banner ── */}
      {historial.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-900/30 border border-green-700/30 rounded-2xl p-5 text-center">
            <p className="text-green-400 text-4xl font-black">{victorias}</p>
            <p className="text-green-600 text-xs font-semibold uppercase tracking-widest mt-1">Victorias</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-2xl p-5 text-center">
            <p className="text-yellow-400 text-4xl font-black">{empates}</p>
            <p className="text-yellow-700 text-xs font-semibold uppercase tracking-widest mt-1">Empates</p>
          </div>
          <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-5 text-center">
            <p className="text-red-400 text-4xl font-black">{derrotas}</p>
            <p className="text-red-700 text-xs font-semibold uppercase tracking-widest mt-1">Derrotas</p>
          </div>
        </div>
      )}

      {/* Win rate bar */}
      {historial.length > 0 && (
        <div className="bg-green-950 border border-green-800/60 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">
              Tasa de victorias
            </span>
            <span className="text-white font-black">{pctVictorias}%</span>
          </div>
          <div className="w-full h-3 bg-green-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${pctVictorias}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Match history ── */}
      <div className="bg-green-950 border border-green-800/60 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-green-800/60 flex items-center justify-between">
          <h2 className="text-white font-bold">Historial de partidos</h2>
          <span className="text-green-500 text-sm">{historial.length} partidos</span>
        </div>

        {historial.length === 0 ? (
          <div className="px-6 py-12 text-center text-green-700">
            Este jugador no tiene partidos registrados todavía.
          </div>
        ) : (
          <div className="divide-y divide-green-900/60">
            {historial.map((h, i) => {
              const res         = getResultado(h)
              const miEquipo    = h.equipo === 1 ? h.partido.equipo1_nombre : h.partido.equipo2_nombre
              const rival       = h.equipo === 1 ? h.partido.equipo2_nombre : h.partido.equipo1_nombre
              const misGoles    = h.equipo === 1 ? h.partido.goles_equipo1 : h.partido.goles_equipo2
              const rivalGoles  = h.equipo === 1 ? h.partido.goles_equipo2 : h.partido.goles_equipo1

              return (
                <Link
                  key={i}
                  href={`/historial/${h.partido.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-green-900/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${RESULT_STYLE[res]}`}>
                      {res}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">
                        <span className="text-green-300">{miEquipo}</span>
                        <span className="text-green-700 mx-2">vs</span>
                        {rival}
                      </p>
                      <p className="text-green-700 text-xs mt-0.5">{formatFecha(h.partido.fecha)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-white font-black tabular-nums">
                        {misGoles} — {rivalGoles}
                      </p>
                      <p className={`text-xs font-semibold ${
                        res === 'V' ? 'text-green-400' : res === 'E' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {RESULT_LABEL[res]}
                      </p>
                    </div>
                    <span className="text-green-800 group-hover:text-green-400 transition-colors text-sm">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
