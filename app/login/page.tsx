'use client'

import { useActionState } from 'react'
import { signIn } from '@/app/auth/actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const FEATURES = [
  { icon: '⚽', label: 'Estadísticas individuales por jugador' },
  { icon: '📊', label: 'Historial completo de partidos' },
  { icon: '🏆', label: 'Votaciones MVP por partido' },
  { icon: '🤖', label: 'Armado de equipos con IA' },
]

function LoginForm() {
  const [error, action, pending] = useActionState(signIn, null)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Panel izquierdo: branding ── */}
      <div className="relative lg:w-3/5 flex flex-col items-center justify-center px-6 py-10 lg:px-10 lg:py-16 bg-gradient-to-br from-green-900/60 via-[#060f08] to-[#060f08] overflow-hidden">

        {/* Círculo decorativo de fondo */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-700/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-green-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center font-black text-white text-xl shadow-lg shadow-green-900/50">
              BFC
            </div>
            <div>
              <h1 className="text-white text-3xl font-black tracking-tight">Puchito FC</h1>
              <p className="text-green-500 text-sm">Tu fútbol, tus estadísticas.</p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-green-100/80 text-base lg:text-lg font-medium leading-relaxed mb-6 lg:mb-10">
            La plataforma de gestión para el grupo de Puchito.
            Llevá el control de cada partido, gol y MVP.
          </p>

          {/* Features */}
          <ul className="space-y-2 lg:space-y-3 hidden sm:block">
            {FEATURES.map(f => (
              <li key={f.label} className="flex items-center gap-3">
                <span className="text-xl">{f.icon}</span>
                <span className="text-green-300 text-sm">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="lg:w-2/5 flex items-center justify-center px-6 py-10 lg:px-8 lg:py-16 border-t lg:border-t-0 lg:border-l border-green-900/40">
        <div className="w-full max-w-sm">
          <h2 className="text-white text-2xl font-black mb-1">Iniciá sesión</h2>
          <p className="text-green-600 text-sm mb-8">Ingresá tu cuenta para continuar</p>

          <form action={action} className="space-y-4">
            <input type="hidden" name="redirect" value={redirect} />

            <div>
              <label htmlFor="email" className="block text-green-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="tu@email.com"
                className="w-full bg-green-950 border border-green-800/60 rounded-xl px-4 py-3 text-white placeholder-green-800 focus:outline-none focus:border-green-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-green-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-green-950 border border-green-800/60 rounded-xl px-4 py-3 text-white placeholder-green-800 focus:outline-none focus:border-green-500 transition-colors text-sm"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {pending ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-green-700 text-sm mt-6">
            ¿No tenés cuenta?{' '}
            <Link href="/register" className="text-green-400 hover:text-white transition-colors font-medium">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
