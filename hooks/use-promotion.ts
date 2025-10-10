import { useAPI } from "@/hooks/use-api"

export interface Promotion {
  id: number
  name: string
  discount_percentage: number
  start_date: string
  end_date: string
  description?: string
}

export function usePromotion() {
  const { get } = useAPI()

  const fetchPromotions = async (): Promise<Promotion[]> => {
    try {
      const res = await get<{ data: Promotion[] }>("/promotions")
      return res?.data || []
    } catch {
      return []
    }
  }

  const calculateDiscount = (subtotal: number, promo: Promotion | null): number => {
    if (!promo) return 0
    return Math.round((subtotal * promo.discount_percentage) / 100)
  }

  const isPromotionValid = (promo: Promotion): boolean => {
    const now = new Date()
    const start = new Date(promo.start_date)
    const end = new Date(promo.end_date)
    return now >= start && now <= end
  }

  const validatePromotion = (promo: Promotion | null, subtotal: number): boolean => {
    if (!promo) return false
    if (!isPromotionValid(promo)) return false
    if (subtotal <= 0) return false
    return true
  }

  return { fetchPromotions, calculateDiscount, isPromotionValid, validatePromotion }
}
