"use client"

import { useState, useEffect } from "react"
import type { Project } from "@prisma/client"
import ProjectCard from "./ProjectCard"
import SearchFilters from "./SearchFilters"
import { useSession } from "next-auth/react"
import { useApi } from "../hooks/useApi"
import { Button } from "@/components/ui/button"

type ProjectWithAuthor = Project & {
  author: {
    id: string
    name: string
    email: string
  }
}

export default function ProjectList() {
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithAuthor[]>([])
  const { data: session } = useSession()
  const { data: projects, error, loading, request } = useApi<ProjectWithAuthor[]>()

  useEffect(() => {
    if (session) {
      request("/api/projects")
    }
  }, [session, request])

  useEffect(() => {
    if (projects) {
      setFilteredProjects(projects)
    }
  }, [projects])

  const handleFilterChange = ({ keyword, minPrice, maxPrice }: { 
    keyword: string; 
    minPrice: number; 
    maxPrice: number 
  }) => {
    if (!projects) return

    const filtered = projects.filter((project) => {
      const searchTerm = keyword.toLowerCase().trim()
      const matchesKeyword = searchTerm === '' || 
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm)

      const projectPrice = Number(project.price) || 0
      const matchesPriceRange = 
        projectPrice >= minPrice && 
        projectPrice <= (maxPrice || Number.MAX_SAFE_INTEGER)

      return matchesKeyword && matchesPriceRange
    })

    setFilteredProjects(filtered)
  }

  if (!session) {
    return <div>Please sign in to view projects.</div>
  }

  if (loading) {
    return <div>Loading projects...</div>
  }

  if (error) {
    return (
      <div>
        <p className="text-red-500">{error}</p>
        <Button onClick={() => request("/api/projects")}>Retry</Button>
      </div>
    )
  }

  return (
    <div>
      <SearchFilters onFilterChange={handleFilterChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}

