"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword || data.confirmPassword) {
        return data.newPassword === data.confirmPassword
      }
      return true
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    },
  )

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/users/profile")
        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }
        const data = await response.json()
        setValue("name", data.name)
        setValue("email", data.email)
        setLoading(false)
      } catch (error) {
        setError("Failed to load profile. Please try again later.")
        setLoading(false)
      }
    }

    if (session) {
      fetchProfile()
    }
  }, [session, setValue])

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      // Show success message
      alert("Profile updated successfully")
    } catch (error) {
      setError("Failed to update profile. Please try again.")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!session) {
    return <div>Please sign in to view your profile.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="currentPassword">Current Password (leave blank to keep unchanged)</Label>
          <Input id="currentPassword" type="password" {...register("currentPassword")} />
          {errors.currentPassword && <p className="text-red-500">{errors.currentPassword.message}</p>}
        </div>
        <div>
          <Label htmlFor="newPassword">New Password (leave blank to keep unchanged)</Label>
          <Input id="newPassword" type="password" {...register("newPassword")} />
          {errors.newPassword && <p className="text-red-500">{errors.newPassword.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit">Update Profile</Button>
      </form>
    </div>
  )
}

