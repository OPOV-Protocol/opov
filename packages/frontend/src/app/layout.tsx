import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OPOV - DOAs for People',
  description: 'OPOV is an open protocol enabling DAOs to leverage WorldID for sybil-resistant, one person one vote participation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
