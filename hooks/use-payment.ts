"use client"

import { useCallback } from "react"
import { useAPI } from "./use-api"

export interface PaymentMethod {
  id: string
  name: string
  icon: string
}

export const paymentMethods: PaymentMethod[] = [
  { id: "cash", name: "Cash", icon: "💵" },
  { id: "card", name: "Card", icon: "💳" },
  { id: "e-wallet", name: "E-wallet", icon: "📱" },
]

export function usePayment() {
  const { post } = useAPI()

  const processPayment = useCallback(
  async (
    orderId: number,
    paymentMethod: string,
    amount: number,
    promotionCode?: string,
    discountAmount?: number,
    user?: { username: string }
  ) => {
    try {
      const res = await post(`/orders/${orderId}/pay`, {
        payment_method: paymentMethod,
        amount_paid: amount,
        promotion_code: promotionCode,
        discount_amount: discountAmount,
        processed_by: user?.username || "Unknown",
      })

      console.log("Res result: ", res)
      return res
    } catch (error) {
      console.error("Payment failed:", error)
      return null
    }
  },
  [post],
)

  return {
    paymentMethods,
    processPayment,
  }
}
