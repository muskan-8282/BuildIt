"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id as string,
        name: session.user.name as string,
        email: session.user.email as string,
      })
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [session, status])

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })
    if (result?.error) {
      throw new Error(result.error)
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    setUser(null)
  }

  const signup = async (name: string, email: string, password: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to sign up")
    }

    await login(email, password)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, signup }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

