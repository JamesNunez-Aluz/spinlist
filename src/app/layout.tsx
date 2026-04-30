import type { Metadata } from 'next'
import { Bricolage_Grotesque, Geist } from 'next/font/google'
import './globals.css'

const display = Bricolage_Grotesque({
  variable: '--font-display',
  subsets: ['latin'],
})

const sans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SpinList — spin to pick your next task',
  description: 'Add tasks. Weight them. Spin the wheel. Do what fate decides.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
