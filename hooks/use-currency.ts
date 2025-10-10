"use client"

import { useMemo } from "react"

export function useCurrency(locale = "vi-VN", currency = "VND") {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }),
    [locale, currency],
  )

  const formatCurrency = (amount: number): string => {
    return formatter.format(amount)
  }

  return { formatCurrency }
}
