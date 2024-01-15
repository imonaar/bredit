import { Navbar } from '@/components/navbar'
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils'
import { ReactQueryClientProvider } from '@/providers/react-query-client-provider'
import '@/styles/globals.css'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

//intercept the authmodal in a layout on the same level as the authmodal
export default function RootLayout({
  children,
  authModal
}: {
  children: React.ReactNode,
  authModal: React.ReactNode,
}) {
  return (
    <ReactQueryClientProvider>
    <html lang='en' className={cn('bg-white text-slate-900 antialiased', inter.className)}>
      <body className='min-h-screen pt-12 bg-slate-50 antialiased'>
          <Navbar />
          {authModal}
          <div className='container max-w-7xl mx-auto h-full pt-12'>
            {children}
          </div>
          <Toaster />
        </body>
      </html>
    </ReactQueryClientProvider>
  )
}
