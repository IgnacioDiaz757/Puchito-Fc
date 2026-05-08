'use client'

import { useActionState } from 'react'
import { signUp } from '@/app/auth/actions'
import Link from 'next/link'

export default function RegisterPage() {
  const [error, action, pending] = useActionState(signUp, null)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center font-bold text-white text-lg mx-auto mb-4">
            BFC
          </div>
          <h1 className="text-white text-2xl font-black">Barcelo FC</h1>
          <p className="text-green-600 text-sm mt-1">Creá tu cuenta</p>
        </div>

        <form action={action} className="space-y-4">
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
              autoComplete="new-password"
              minLength={6}
              placeholder="mínimo 6 caracteres"
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
            {pending ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-green-700 text-sm mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-green-400 hover:text-white transition-colors font-medium">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
