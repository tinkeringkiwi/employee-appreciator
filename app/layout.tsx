import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Employee Appreciator',
  description: 'A web app for appreciating employees',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  )
}
