import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./components/Providers"
import Navbar from "./components/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "BuildIt",
  description: "Discover. Develop. Disrupt.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}

