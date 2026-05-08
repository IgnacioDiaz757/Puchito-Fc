import { createSupabaseServer } from '@/lib/supabase-server'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  return <NavbarClient userEmail={user?.email ?? null} />
}
