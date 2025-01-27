"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center text-red-600">Authentication Error</h1>
        <p className="text-center">
          {error === "CredentialsSignin"
            ? "Invalid email or password. Please try again."
            : "An error occurred during authentication."}
        </p>
        <div className="text-center">
          <Link href="/login" className="text-blue-500 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

