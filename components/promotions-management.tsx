"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Percent, Gift } from "lucide-react"
import { usePromotionList } from "@/hooks/use-promotion-list"
import { usePromotion } from "@/hooks/use-promotion"
import type { Promotion } from "@/hooks/use-promotion"
import { notify } from "@/lib/notify"

interface PromotionsManagementProps {
  onBack: () => void
  onApplyPromotion?: (promo: Promotion) => void
  role?: "staff" | "admin" | string
}

export function PromotionsManagement({ onBack, onApplyPromotion}: PromotionsManagementProps) {
  const { promotions, loading } = usePromotionList()
  const { isPromotionValid } = usePromotion()

  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleApply = (promo: Promotion) => {
    if (!onApplyPromotion) {
      notify.error("Apply handler not provided")
      return
    }

    // Kiểm tra khuyến mãi còn hiệu lực không
    if (!isPromotionValid(promo)) {
      notify.error("This promotion is not valid at the moment")
      return
    }

    setSelectedId(promo.id)
    try {
      onApplyPromotion(promo)
      notify.success("Promotion applied successfully!")
    } catch (err) {
      console.error(err)
      notify.error("Failed to apply promotion")
    } finally {
      setTimeout(() => setSelectedId(null), 700)
    }
  }


  const getStatusColor = (start: string, end: string): string => {
    const now = new Date()
    const s = new Date(start)
    const e = new Date(end)
    if (now < s) return "bg-gray-100 text-gray-800"
    if (now > e) return "bg-red-100 text-red-800"
    return "bg-green-100 text-green-800"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            ← Back to POS
          </Button>
          <h1 className="text-xl font-semibold">Promotions</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Available Promotions</h2>
          {/* Staff không có quyền tạo promotion, vì vậy bỏ nút Add */}
        </div>

        {loading && (
          <div className="text-center text-muted-foreground py-4">
            Loading promotions...
          </div>
        )}

        <div className="grid gap-4">
          {promotions.map((promo) => (
            <Card key={promo.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">{promo.name}</h3>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Percent className="w-3 h-3" />
                      <span>{promo.discount_percentage}% off</span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>Valid: {promo.start_date} to {promo.end_date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(
                        promo.start_date,
                        promo.end_date
                      )}`}
                    >
                      {isPromotionValid(promo) ? "Active" : "Expired / Not Yet Active"}
                    </span>

                    {onApplyPromotion && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApply(promo)}
                        disabled={!isPromotionValid(promo) || selectedId === promo.id}
                      >
                        {selectedId === promo.id ? "Applied" : "Apply"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && promotions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No promotions found.
          </div>
        )}
      </div>
    </div>
  )
}