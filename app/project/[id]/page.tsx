"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AiOutlineDownload } from "react-icons/ai" // Using a download icon from react-icons library

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be 1000 characters or less"),
  technologies: z.string().min(1, "At least one technology is required"),
  price: z.number().min(0, "Price must be 0 or greater"),
  attachments: z.array(z.string()), // Added to handle attachments
})

type FormData = z.infer<typeof schema>

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }
        const data = await response.json()
        setProject(data)
        reset(data)
      } catch (error) {
        console.error("Error fetching project:", error)
      }
    }

    fetchProject()
  }, [params.id, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          technologies: data.technologies.split(",").map((tech) => tech.trim()),
          attachments: data.attachments, // Assuming attachments are handled as an array of strings
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update project")
      }

      const updatedProject = await response.json()
      setProject(updatedProject)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating project:", error)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`/api/projects/${params.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete project")
        }

        router.push("/")
      } catch (error) {
        console.error("Error deleting project:", error)
      }
    }
  }

  if (status === "loading" || !project) {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    return <div>Please sign in to view this project.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && <p className="text-red-500">{errors.description.message}</p>}
          </div>
          <div>
            <Label htmlFor="technologies">Technologies (comma-separated)</Label>
            <Input id="technologies" {...register("technologies")} />
            {errors.technologies && <p className="text-red-500">{errors.technologies.message}</p>}
          </div>
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
            {errors.price && <p className="text-red-500">{errors.price.message}</p>}
          </div>
          <div>
            <Label htmlFor="attachments">Attachments</Label>
            {project?.attachments?.map((attachment, index) => (
              <div key={index} className="flex justify-between items-center mb-2">
                <span>{attachment}</span>
                <a href={attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                  <AiOutlineDownload />
                </a>
              </div>
            ))}
            {errors.attachments && <p className="text-red-500">{errors.attachments.message}</p>}
          </div>
          <Button type="submit">Save Changes</Button>
          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-4">{project?.title}</h1>
          <p className="text-xl mb-4">By {project?.author?.name}</p>
          <p className="mb-6">{project?.description}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {project?.technologies?.map((tech: string) => (
              <span key={tech} className="bg-gray-200 px-2 py-1 rounded">
                {tech}
              </span>
            ))}
          </div>
          <p className="text-2xl font-bold mb-6">Price: ${project?.price}</p>
          {project?.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {project?.attachments?.map((attachment: string) => (
                <div key={attachment} className="flex justify-between items-center mb-2">
                  <a href={attachment} target="_blank" rel="noopener noreferrer" className="bg-gray-200 px-2 py-1 rounded">
                    {attachment}
                  </a>
                  <a href={attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                    <AiOutlineDownload />
                  </a>
                </div>
              ))}
            </div>
          )}
          {session?.user?.id === project?.authorId && (
            <div className="space-x-4">
              <Button onClick={() => setIsEditing(true)}>Edit Project</Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Project
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

