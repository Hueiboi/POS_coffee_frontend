"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Percent, Gift } from "lucide-react"
import { usePromotionList } from "@/hooks/use-promotion-list"
import type { Promotion } from "@/hooks/use-promotion"
import { toast } from "./ui/use-toast"

interface PromotionsManagementProps {
  onBack: () => void
  onApplyPromotion?: (promo: Promotion) => void
}

export function PromotionsManagement({ onBack, onApplyPromotion }: PromotionsManagementProps) {
  const { promotions, loading, createPromotion, deletePromotion } = usePromotionList()

  const [showAddPromo, setShowAddPromo] = useState(false)
  const [newPromo, setNewPromo] = useState({
    name: "",
    value: 0,
    start_date: "",
    end_date: "",
  })


  const handleAddPromotion = async () => {
    try {
      await createPromotion({
        name: newPromo.name,
        discount_percentage: newPromo.value,
        start_date: newPromo.start_date,
        end_date: newPromo.end_date,
      })

      setNewPromo({
        name: "",
        value: 0,
        start_date: "",
        end_date: "",
      })

      setShowAddPromo(false)
      toast({
        title: "✅ Promotion added",
        description: `${newPromo.name} (${newPromo.value}% off) has been created.`,
      })
    } catch (error) {
      console.error("Error adding promotion:", error)
      toast({
        title: "❌ Failed to add promotion",
        description: "An error occurred while saving. Please try again.",
        variant: "destructive",
      })
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
          <h1 className="text-xl font-semibold">Promotions Management</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Active Promotions</h2>
          <Dialog open={showAddPromo} onOpenChange={setShowAddPromo}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Promotion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Promotion Name</Label>
                  <Input
                    id="name"
                    value={newPromo.name}
                    onChange={(e) =>
                      setNewPromo((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter promotion name"
                  />
                </div>
                <div>
                  <Label htmlFor="value">Discount Percentage (%)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={newPromo.value.toString()}
                    onChange={(e) =>
                      setNewPromo((prev) => ({
                        ...prev,
                        value: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter discount percentage"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="startdate">Start Date</Label>
                    <Input
                      id="startdate"
                      type="date"
                      value={newPromo.start_date}
                      onChange={(e) =>
                        setNewPromo((prev) => ({
                          ...prev,
                          start_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="enddate">End Date</Label>
                    <Input
                      id="enddate"
                      type="date"
                      value={newPromo.end_date}
                      onChange={(e) =>
                        setNewPromo((prev) => ({
                          ...prev,
                          end_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleAddPromotion}>
                  Add Promotion
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading && (
          <div className="text-center text-muted-foreground py-4">
            Đang tải danh sách ưu đãi...
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
                      <p>
                        Valid: {promo.start_date} to {promo.end_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {onApplyPromotion && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApplyPromotion(promo)}
                      >
                        Apply
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePromotion(promo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && promotions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No promotions found. Create your first promotion to get started!
          </div>
        )}
      </div>
    </div>
  )
}


                        