import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ProfileSetupModal from "@/components/ProfileSetupModal";
import { createSupabaseServer } from "@/lib/supabase-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Puchito FC",
  description: "Gestión de partidos y estadísticas de Puchito FC",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  let needsProfile = false
  if (user) {
    const { data } = await supabase
      .from('jugadores')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    needsProfile = !data
  }

  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#060f08]">
        {user && <Navbar />}
        {user && needsProfile && <ProfileSetupModal />}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
