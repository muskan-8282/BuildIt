import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Project } from "@prisma/client"

type ProjectWithAuthor = Project & {
  author: {
    id: string
    name: string
    email: string
  }
}

export default function ProjectCard({ project }: { project: ProjectWithAuthor }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>By {project.author.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-lg font-bold">${project.price.toFixed(2)}</span>
        <Link href={`/project/${project.id}`}>
          <Button>View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

