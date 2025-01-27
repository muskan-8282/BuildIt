'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useSession } from 'next-auth/react'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be 1000 characters or less'),
  technologies: z.string().min(1, 'At least one technology is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
})

type FormData = z.infer<typeof schema>

export default function NewProjectForm({ onProjectCreated }: { onProjectCreated?: () => void }) {
  
  const [isOpen, setIsOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const { data: session, status } = useSession()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
  const [isUploading, setIsUploading] = useState(false)

  const onSubmit = async (data: FormData) => {
    if (status !== "authenticated") {
      console.error('User not authenticated')
      return
    }

    setIsUploading(true)
    try {
      let uploadedAttachments = [];
      // Assuming the attachments are to be uploaded separately
      for (const attachment of attachments) {
        console.log(attachment)
        const formData = new FormData();
        formData.append('file', attachment);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload attachment');
        }

        const result = await response.json();
        console.log('Attachment uploaded:', result);
        uploadedAttachments.push({
          filename: attachment?.name,
          url: result?.url,
        }); // Assuming the response contains the filename and URL of the uploaded file
      }

      // Proceed with project creation
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          technologies: data.technologies.split(',').map(tech => tech.trim()),
          attachments: uploadedAttachments, // Send the details of the uploaded attachments
        }),
      })

      if (!projectResponse.ok) {
        throw new Error('Failed to create project')
      }

      const projectResult = await projectResponse.json()
      console.log('Project created:', projectResult)
      
      // Add a small delay before refreshing the list
      // This gives the database a moment to complete the transaction
      setTimeout(() => {
        if (onProjectCreated) {
          onProjectCreated()
        }
        setIsOpen(false)
        reset()
      }, 500)
      
    } catch (error) {
      console.error('Error creating project:', error)
      // Show error message to user
    } finally {
      setIsUploading(false)
    }
  }
  const handleCancel = () => {
    setIsOpen(false)
    reset()
    setAttachments([])
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachments(Array.from(event.target.files))
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    return <div>Please sign in to create a project.</div>
  }

  if (!isOpen) {
    return <Button className="mb-8" onClick={() => setIsOpen(true)}>Post New Project</Button>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-100 p-6 rounded-lg">
      <div>
        <Label htmlFor="title">Project Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} />
        {errors.description && <p className="text-red-500">{errors.description.message}</p>}
      </div>
      <div>
        <Label htmlFor="technologies">Technologies (comma-separated)</Label>
        <Input id="technologies" {...register('technologies')} />
        {errors.technologies && <p className="text-red-500">{errors.technologies.message}</p>}
      </div>
      <div>
        <Label htmlFor="price">Price ($)</Label>
        <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
        {errors.price && <p className="text-red-500">{errors.price.message}</p>}
      </div>
      <div>
        <Label htmlFor="attachments">Attachments</Label>
        <Input id="attachments" type="file" multiple onChange={handleFileChange} className="cursor-pointer" />
        <p className="text-sm text-gray-500 mt-1">Upload documentation, designs, prototypes, or demos</p>
      </div>
      <Button 
        type="submit" 
        className="cursor-pointer"
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Submit Project'}
      </Button>

      <Button 
        type="button" 
        variant="outline" 
        onClick={handleCancel}
        className="ml-2 cursor-pointer"
      >
        Cancel
      </Button>


    </form>
  )
}
