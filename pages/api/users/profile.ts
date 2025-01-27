import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true },
      })
      res.status(200).json(user)
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" })
    }
  } else if (req.method === "PUT") {
    try {
      const { name, email, currentPassword, newPassword } = req.body

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      if (currentPassword && newPassword) {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordValid) {
          return res.status(400).json({ error: "Current password is incorrect" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
          where: { id: session.user.id },
          data: { password: hashedPassword },
        })
      }

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { name, email },
        select: { id: true, name: true, email: true },
      })

      res.status(200).json(updatedUser)
    } catch (error) {
      res.status(500).json({ error: "Failed to update user profile" })
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

