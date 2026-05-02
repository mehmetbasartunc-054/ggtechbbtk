import { AmbientBackground } from "@/components/ambient-background"
import { Toaster } from "@/components/ui/sonner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative min-h-screen">
      <AmbientBackground />
      {children}
      <Toaster />
    </main>
  )
}
