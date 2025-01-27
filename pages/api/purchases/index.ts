import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { PrismaClient } from "@prisma/client"
import Stripe from "stripe"

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15" })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method === "POST") {
    try {
      const { projectId } = req.body
      const project = await prisma.project.findUnique({ where: { id: projectId } })
      if (!project) {
        return res.status(404).json({ error: "Project not found" })
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(project.price * 100), // Stripe expects amount in cents
        currency: "usd",
        metadata: { projectId, userId: session?.user?.id },
      })

      res.status(200).json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment intent" })
    }
  } else {
    res.setHeader("Allow", ["POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

