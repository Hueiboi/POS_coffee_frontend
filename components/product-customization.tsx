"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import type { Product, OrderItem } from "@/types"

interface ProductCustomizationProps {
  product: Product
  onAddToOrder: (customization: Omit<OrderItem, keyof Product>) => void
  onClose: () => void
}

export function ProductCustomization({ product, onAddToOrder, onClose }: ProductCustomizationProps) {
  const [mood, setMood] = useState<"A" | "B">("A")
  const [size, setSize] = useState<"S" | "M" | "L">("M")
  const [sugar, setSugar] = useState<"No" | "Low" | "Normal" | "High">("Normal")
  const [ice, setIce] = useState<"No" | "Low" | "Normal" | "High">("Normal")
  const [quantity, setQuantity] = useState(1)

  const handleAddToOrder = () => {
    onAddToOrder({
      quantity,
      size,
      sugar,
      ice,
      mood,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customize {product.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-24 h-24 mx-auto mb-2 rounded-lg"
            />
            <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Mood</h4>
            <div className="flex gap-2">
              {["A", "B"].map((m) => (
                <Button
                  key={m}
                  variant={mood === m ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(m as "A" | "B")}
                  className="w-12"
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Size</h4>
            <div className="flex gap-2">
              {["S", "M", "L"].map((s) => (
                <Button
                  key={s}
                  variant={size === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSize(s as "S" | "M" | "L")}
                  className="w-12"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Sugar</h4>
            <div className="flex gap-2 flex-wrap">
              {["No", "Low", "Normal", "High"].map((s) => (
                <Button
                  key={s}
                  variant={sugar === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSugar(s as any)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Ice</h4>
            <div className="flex gap-2 flex-wrap">
              {["No", "Low", "Normal", "High"].map((i) => (
                <Button key={i} variant={ice === i ? "default" : "outline"} size="sm" onClick={() => setIce(i as any)}>
                  {i}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Quantity</h4>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                -
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
                +
              </Button>
            </div>
          </div>

          <Button onClick={handleAddToOrder} className="w-full">
            Add to Order
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
