'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export async function registrarPartido(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {


  const fecha           = formData.get('fecha') as string
  const equipo1_nombre  = (formData.get('equipo1_nombre') as string).trim()
  const equipo2_nombre  = (formData.get('equipo2_nombre') as string).trim()
  const goles_equipo1   = Number(formData.get('goles_equipo1') || 0)
  const goles_equipo2   = Number(formData.get('goles_equipo2') || 0)
  const jug1            = formData.getAll('jugadores_equipo1') as string[]
  const jug2            = formData.getAll('jugadores_equipo2') as string[]

  if (!equipo1_nombre || !equipo2_nombre)
    return 'Los nombres de los equipos son obligatorios'
  if (jug1.length === 0 || jug2.length === 0)
    return 'Cada equipo debe tener al menos un jugador'

  const { data: partido, error } = await supabase
    .from('partidos')
    .insert({ fecha, equipo1_nombre, equipo2_nombre, goles_equipo1, goles_equipo2 })
    .select('id')
    .single()

  if (error || !partido) return `Error al crear el partido: ${error?.message}`

  const filas = [
    ...jug1.map(id => ({ partido_id: partido.id, jugador_id: id, equipo: 1 })),
    ...jug2.map(id => ({ partido_id: partido.id, jugador_id: id, equipo: 2 })),
  ]

  const { error: jugErr } = await supabase.from('partido_jugadores').insert(filas)
  if (jugErr) return `Error asignando jugadores: ${jugErr.message}`

  revalidatePath('/historial')
  redirect(`/historial/${partido.id}`)
}

export async function votarMVP(
  partidoId: string,
  prevState: string | null,
  formData: FormData
): Promise<string | null> {


  const votante_id = formData.get('votante_id') as string
  const mvp_id     = formData.get('mvp_id') as string

  if (!votante_id || !mvp_id) return 'Seleccioná quién sos y tu MVP'
  if (votante_id === mvp_id) return 'No podés votarte a vos mismo'

  const { data: existente } = await supabase
    .from('votos_mvp')
    .select('id')
    .eq('partido_id', partidoId)
    .eq('votante_id', votante_id)
    .maybeSingle()

  if (existente) return 'Ya votaste en este partido'

  const { error } = await supabase
    .from('votos_mvp')
    .insert({ partido_id: partidoId, votante_id, mvp_id })

  if (error) return `Error al votar: ${error.message}`

  revalidatePath(`/historial/${partidoId}`)
  return null
}
