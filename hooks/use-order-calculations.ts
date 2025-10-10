"use client"

import { useMemo } from "react"
import type { OrderItem } from "./use-pos-store"
import type { Promotion } from "./use-promotion"
import { usePromotion } from "./use-promotion"

export function useOrderCalculations(
  items: OrderItem[],
  appliedPromotion: Promotion | null,
  taxRate = 0.1
) {
  const { calculateDiscount, validatePromotion } = usePromotion()

  // Tính subtotal
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  // Tính thuế
  const tax = useMemo(() => subtotal * taxRate, [subtotal, taxRate])

  // Tính giảm giá (promotion)
  const discount = useMemo(() => {
    if (!appliedPromotion) return 0
    if (!validatePromotion(appliedPromotion, subtotal)) return 0
    return calculateDiscount(subtotal, appliedPromotion)
  }, [appliedPromotion, subtotal, validatePromotion, calculateDiscount])

  // Tính tổng cuối cùng
  const total = useMemo(() => subtotal + tax - discount, [subtotal, tax, discount])

  return {
    subtotal,
    tax,
    discount,
    total,
    taxRate,
  }
}