import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const { id } = req.query

  if (req.method === "GET") {
    try {
      const project = await prisma.project.findUnique({
        where: { id: id as string },
        include: { author: true },
      })

      if (!project) {
        return res.status(404).json({ error: "Project not found" })
      }

      res.status(200).json(project)
    } catch (error) {
      console.error("Error fetching project:", error)
      res.status(500).json({ error: "Failed to fetch project" })
    }
  } else if (req.method === "PUT") {
    try {
      const { title, description, technologies, price } = req.body

      const project = await prisma.project.findUnique({
        where: { id: id as string },
      })

      if (!project) {
        return res.status(404).json({ error: "Project not found" })
      }

      if (project.authorId !== session.user.id) {
        return res.status(403).json({ error: "Forbidden" })
      }

      const updatedProject = await prisma.project.update({
        where: { id: id as string },
        data: {
          title,
          description,
          technologies,
          price: Number.parseFloat(price),
        },
      })

      res.status(200).json(updatedProject)
    } catch (error) {
      console.error("Error updating project:", error)
      res.status(500).json({ error: "Failed to update project" })
    }
  } else if (req.method === "DELETE") {
    try {
      const project = await prisma.project.findUnique({
        where: { id: id as string },
      })

      if (!project) {
        return res.status(404).json({ error: "Project not found" })
      }

      if (project.authorId !== session.user.id) {
        return res.status(403).json({ error: "Forbidden" })
      }

      await prisma.project.delete({
        where: { id: id as string },
      })

      res.status(204).end()
    } catch (error) {
      console.error("Error deleting project:", error)
      res.status(500).json({ error: "Failed to delete project" })
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

