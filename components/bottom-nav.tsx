'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Dumbbell, Home, Syringe } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/peptides', label: 'Peptides', icon: Syringe },
  { href: '/reading', label: 'Reading', icon: BookOpen },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
    >
      <ul
        className="velly-glass pointer-events-auto flex w-full max-w-sm items-center justify-between gap-1 rounded-full px-2 py-2 shadow-lg shadow-black/5 dark:shadow-black/40"
        style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <li key={href} className={cn('flex-1', active && 'flex-[1.6]')}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                className={cn(
                  'relative flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors',
                  active
                    ? 'velly-gradient text-white shadow-md shadow-blue-500/30'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
                )}
              >
                <Icon className="size-5" aria-hidden />
                {active ? <span className="pr-1">{label}</span> : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
