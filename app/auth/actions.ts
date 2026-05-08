'use server'

import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signIn(prevState: string | null, formData: FormData): Promise<string | null> {
  const supabase = await createSupabaseServer()
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return error.message

  revalidatePath('/', 'layout')
  const redirectTo = (formData.get('redirect') as string) || '/'
  redirect(redirectTo)
}

export async function signUp(prevState: string | null, formData: FormData): Promise<string | null> {
  const supabase = await createSupabaseServer()
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return error.message

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function setupJugador(prevState: string | null, formData: FormData): Promise<string | null> {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'No autenticado'

  const nombre  = (formData.get('nombre') as string).trim()
  const posicion = formData.get('posicion') as string

  if (!nombre) return 'El nombre es obligatorio'

  const { error } = await supabase
    .from('jugadores')
    .insert({ nombre, posicion, goles: 0, asistencias: 0, partidos: 0, mvps: 0, user_id: user.id })

  if (error) return error.message

  revalidatePath('/', 'layout')
  return 'success'
}
