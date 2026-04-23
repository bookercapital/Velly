import { BottomNav } from '@/components/bottom-nav'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-lg px-4 py-6">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
