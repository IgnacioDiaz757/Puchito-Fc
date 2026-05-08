'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/app/auth/actions'

const links = [
  { href: '/',          label: 'Dashboard' },
  { href: '/partidos',  label: 'Partidos' },
  { href: '/historial', label: 'Historial' },
  { href: '/jugadores', label: 'Jugadores' },
  { href: '/admin',     label: 'Admin' },
]

interface Props {
  userEmail: string | null
}

export default function NavbarClient({ userEmail }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-green-950/95 backdrop-blur border-b border-green-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center font-bold text-white text-xs group-hover:bg-green-500 transition-colors">
            PFC
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Puchito FC</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-green-800/60 text-white'
                  : 'text-green-400 hover:text-white hover:bg-green-900/40'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {userEmail ? (
            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-green-800/60">
              <span className="text-green-600 text-xs truncate max-w-32">{userEmail}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-green-400 hover:text-white hover:bg-green-900/40 transition-colors"
                >
                  Salir
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-3 px-4 py-2 rounded-lg text-sm font-medium bg-green-700 hover:bg-green-600 text-white transition-colors"
            >
              Ingresar
            </Link>
          )}
        </div>

        {/* Hamburger button */}
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen(prev => !prev)}
          className="md:hidden p-2 rounded-lg hover:bg-green-900/40 transition-colors"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`block h-0.5 bg-white rounded transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-white rounded transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-white rounded transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-green-800/60 px-4 pb-4 pt-2 flex flex-col gap-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-green-800/60 text-white'
                  : 'text-green-400 hover:text-white hover:bg-green-900/40'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2 pt-2 border-t border-green-800/60">
            {userEmail ? (
              <div className="flex items-center justify-between">
                <span className="text-green-600 text-xs truncate max-w-[200px]">{userEmail}</span>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg text-xs font-medium text-green-400 hover:text-white hover:bg-green-900/40 transition-colors"
                  >
                    Salir
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block text-center px-4 py-3 rounded-lg text-sm font-medium bg-green-700 hover:bg-green-600 text-white transition-colors"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
