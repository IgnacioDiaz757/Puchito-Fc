'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { Posicion } from '@/lib/jugadores'

const BUCKET = 'fotos-jugadores'

async function uploadFoto(id: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${id}.${ext}`
  const buffer = new Uint8Array(await file.arrayBuffer())
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true })
  if (error) return null
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export async function crearJugador(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const nombre = (formData.get('nombre') as string).trim()
  const posicion = formData.get('posicion') as Posicion
  const goles = Number(formData.get('goles') || 0)
  const asistencias = Number(formData.get('asistencias') || 0)
  const partidos = Number(formData.get('partidos') || 0)

  if (!nombre) return 'El nombre es obligatorio'

  const { data: nuevo, error } = await supabase
    .from('jugadores')
    .insert([{ nombre, posicion, goles, asistencias, partidos, mvps: 0 }])
    .select()
    .single()

  if (error || !nuevo) return `Error al guardar: ${error?.message}`

  const fotoFile = formData.get('foto') as File
  if (fotoFile && fotoFile.size > 0) {
    const publicUrl = await uploadFoto(nuevo.id, fotoFile)
    if (publicUrl) {
      await supabase.from('jugadores').update({ foto_url: publicUrl }).eq('id', nuevo.id)
    }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/partidos')
  revalidatePath('/jugadores')
  return null
}

export async function eliminarJugador(id: string) {
  await supabase.from('jugadores').delete().eq('id', id)
  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/partidos')
  revalidatePath('/jugadores')
}

export async function actualizarJugador(
  id: string,
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const nombre = (formData.get('nombre') as string).trim()
  const posicion = formData.get('posicion') as Posicion
  const goles = Number(formData.get('goles') || 0)
  const asistencias = Number(formData.get('asistencias') || 0)
  const partidos = Number(formData.get('partidos') || 0)
  const mvps = Number(formData.get('mvps') || 0)

  if (!nombre) return 'El nombre es obligatorio'

  const update: Record<string, unknown> = { nombre, posicion, goles, asistencias, partidos, mvps }

  const fotoFile = formData.get('foto') as File
  if (fotoFile && fotoFile.size > 0) {
    const publicUrl = await uploadFoto(id, fotoFile)
    if (publicUrl) update.foto_url = publicUrl
  }

  const { error } = await supabase.from('jugadores').update(update).eq('id', id)
  if (error) return `Error al actualizar: ${error.message}`

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/partidos')
  revalidatePath('/jugadores')
  revalidatePath(`/jugadores/${id}`)
  return null
}

export async function sumarMVP(id: string) {
  const { data } = await supabase.from('jugadores').select('mvps').eq('id', id).single()
  await supabase.from('jugadores').update({ mvps: (data?.mvps || 0) + 1 }).eq('id', id)
  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/partidos')
}

export async function votarMVP(id: string) {
  const { data } = await supabase.from('jugadores').select('mvps').eq('id', id).single()
  await supabase.from('jugadores').update({ mvps: (data?.mvps || 0) + 1 }).eq('id', id)
  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/partidos')
}
