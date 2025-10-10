import { useState, useEffect } from "react"
import { useAPI } from "@/hooks/use-api"
import { Promotion } from "@/hooks/use-promotion"

export function usePromotionList() {
  const { get, post, del } = useAPI()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const res = await get<{ status: string; data: Promotion[]; msg: string }>("/promotions")
      setPromotions(res?.data || [])
    } catch (err) {
      console.error("Failed to fetch promotions:", err)
    } finally {
      setLoading(false)
    }
  }

  const createPromotion = async (promoData: Omit<Promotion, "id">) => {
    const res = await post("/promotions", promoData)
    if (res) await fetchPromotions()
  }

  const deletePromotion = async (id: number) => {
    await del(`/promotions/${id}`)
    await fetchPromotions()
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  return { promotions, loading, fetchPromotions, createPromotion, deletePromotion }
}
