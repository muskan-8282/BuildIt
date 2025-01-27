export interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  price: number
  author: string
  attachments: string[]
}

export const projects: Project[] = [
  {
    id: "1",
    title: "AI-powered Task Manager",
    description: "A task management app that uses AI to prioritize and suggest tasks.",
    technologies: ["React", "Node.js", "TensorFlow.js"],
    price: 500,
    author: "Jane Doe",
    attachments: ["documentation.pdf", "demo.mp4"],
  },
  {
    id: "2",
    title: "Blockchain-based Voting System",
    description: "A secure and transparent voting system built on blockchain technology.",
    technologies: ["Solidity", "Ethereum", "Web3.js"],
    price: 1000,
    author: "John Smith",
    attachments: ["whitepaper.pdf", "prototype.zip"],
  },
  // Add more mock projects as needed
]

export const allTechnologies = Array.from(new Set(projects.flatMap((p) => p.technologies)))

