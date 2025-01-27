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

  console.log(req)
  console.log(res)

  if (req.method === "GET") {
    try {
      const projects = await prisma.project.findMany({
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attachments: true, // Include attachments in the response
        },
      })
      res.status(200).json(projects)
    } catch (error) {
      console.error("Error fetching projects:", error)
      res.status(500).json({ error: "Failed to fetch projects" })
    }
  } else if (req.method === "POST") {
    try {
      const { title, description, technologies, price, attachments } = req.body // Extract attachments from the request body

      const project = await prisma.project.create({
        data: {
          title,
          description,
          technologies,
          price: Number.parseFloat(price),
          authorId: session?.user?.id,
          attachments: {
            create: attachments?.map((attachment: {filename:string, url:string}) => ({
              filename: attachment?.filename,
              url: attachment?.url, // Assuming the attachment URL is the same as the filename for simplicity
            })),
          },
        },
      })

      res.status(201).json(project)
    } catch (error) {
      console.error("Error creating project:", error)
      res.status(500).json({ error: "Failed to create project" })
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

