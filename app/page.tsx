"use client"

import { useAuth } from "./contexts/AuthContext"
import ProjectList from "./components/ProjectList"
import NewProjectForm from "./components/NewProjectForm"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const { user, logout } = useAuth()

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">BuildIt</h1>
          <p className="text-sm text-gray-600 mb-8 leading-[0.50]">Discover. Develop. Disrupt.</p>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span>Welcome, {user.name}</span>
            <Button onClick={logout} variant="outline">Log out</Button>
          </div>
        )}
      </div>

      {user ? (
        <>
          <NewProjectForm />
          <ProjectList />
        </>
      ) : (
        <div className="text-center">
          <p className="mb-4">Log in or sign up to view and post projects.</p>
          <Link href="/login">
            <Button className="mr-4">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">Sign up</Button>
          </Link>
        </div>
      )}
    </main>
  )
}

