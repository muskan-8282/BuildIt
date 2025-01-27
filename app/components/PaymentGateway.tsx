"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PaymentGatewayProps {
  amount: number
  onPaymentComplete: () => void
}

export default function PaymentGateway({ amount, onPaymentComplete }: PaymentGatewayProps) {
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you would integrate with a payment provider here
    console.log("Processing payment...")
    setTimeout(() => {
      console.log("Payment successful!")
      onPaymentComplete()
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="1234 5678 9012 3456"
          required
        />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            placeholder="MM/YY"
            required
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="cvv">CVV</Label>
          <Input id="cvv" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" required />
        </div>
      </div>
      <p className="text-lg font-bold">Total Amount: ${amount}</p>
      <Button type="submit" className="w-full">
        Pay Now
      </Button>
    </form>
  )
}

