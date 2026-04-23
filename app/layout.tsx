import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { OfflineSyncProvider } from '@/components/offline-sync-provider'
import { ServiceWorkerRegister } from '@/components/sw-register'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Velly',
  description: 'Personal tracker for workouts, peptides, and reading.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Velly',
  appleWebApp: {
    capable: true,
    title: 'Velly',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E8F4FF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0F1E' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="top-center" />
          <OfflineSyncProvider />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  )
}
