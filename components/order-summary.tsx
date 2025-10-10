"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { OrderItem, Order } from "@/hooks/use-pos-store"
import { useOrderCalculations } from "@/hooks/use-order-calculations"
import type { Promotion } from "@/hooks/use-promotion"
import { useCurrency } from "@/hooks/use-currency"
import { PaymentMethod, usePayment } from "@/hooks/use-payment"
import { cn } from "@/lib/utils"
import { Table } from "@/types"


interface OrderSummaryProps {
  items: OrderItem[]
  onUpdateItem: (index: number, updates: Partial<OrderItem>) => void
  onRemoveItem: (index: number) => void
  onClearOrder: () => void
  onPrintBill: (paymentMethod: "cash" | "card" | "e-wallet", total: number) => void
  handleFreeTable: (tableId: number) => void
  currentOrder: Order | null
  selectedTable: Table | null
  appliedPromotion: Promotion | null
  discount: number
  subtotal?: number
  total?: number
}

export function OrderSummary({
  items,
  onUpdateItem,
  onRemoveItem,
  onClearOrder,
  onPrintBill,
  handleFreeTable,
  currentOrder,
  selectedTable,
  appliedPromotion,
  
}: OrderSummaryProps) {
  const { subtotal, tax, discount, total } = useOrderCalculations(items, appliedPromotion)
  const { formatCurrency } = useCurrency()
  const { paymentMethods } = usePayment()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)


  const handleQuantityChange = (index: number, change: number) => {
    const newQuantity = items[index].quantity + change
    if (newQuantity > 0) {
      onUpdateItem(index, { quantity: newQuantity })
    }
  }

  return (
    <div className="w-80 bg-card border-l p-6 flex flex-col">
      {/* Table Information */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              "w-8 h-8 bg-primary rounded-full flex items-center justify-center",
              "transition-all duration-200 hover:scale-105",
            )}
          >
            <span className="text-primary-foreground text-sm font-bold">{selectedTable?.table_number || "A"}</span>
          </div>

          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {selectedTable ? `Table ${selectedTable.table_number}` : "Staff User"}
            </span>
            {selectedTable && (
              <Badge
                variant={selectedTable.status === "available" ? "secondary" : "destructive"}
                className="text-xs w-fit"
              >
                {selectedTable.status === "available" ? "Available" : "Occupied"}
              </Badge>
            )}
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-1 right-1"
            onClick={() => handleFreeTable(selectedTable?.id!)}
          >
            Free Table
          </Button>

        </div>

        {currentOrder && (
          <p className="text-sm text-muted-foreground">Orders: {currentOrder.order_code || `#${currentOrder.id}`}</p>
        )}
      </div>

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 opacity-50">🍽️</div>
              <p className="text-muted-foreground">No items</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg",
                  "hover:bg-muted/50 transition-colors duration-200",
                )}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-coffee-light to-coffee-cream rounded flex items-center justify-center">
                  <span className="text-lg">
                    {item.category === "Coffee"
                      ? "☕"
                      : item.category === "Tea"
                        ? "🍵"
                        : item.category === "Juice"
                          ? "🧃"
                          : "🥐"}
                  </span>
                </div>

                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}

                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(index, -1)}
                      className={cn("h-6 w-6 p-0 transition-all duration-200", "hover:scale-110 active:scale-95")}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <span className="text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(index, 1)}
                      className={cn("h-6 w-6 p-0 transition-all duration-200", "hover:scale-110 active:scale-95")}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveItem(index)}
                      className={cn(
                        "h-6 w-6 p-0 ml-auto transition-all duration-200",
                        "hover:scale-110 active:scale-95 hover:bg-destructive hover:text-destructive-foreground",
                      )}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="secondary" className="font-bold">
                    {formatCurrency(item.price * item.quantity)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Order Summary and Payment */}
      {items.length > 0 && (
        <>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount {appliedPromotion && `(${appliedPromotion.name})`}</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Payment methods</h4>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant={selectedPaymentMethod?.id === method.id ? "default" : "outline"}
                  onClick={() => setSelectedPaymentMethod(method)}
                  className={cn(
                    "flex flex-col items-center p-3 h-auto",
                    "transition-all duration-200 hover:scale-105 active:scale-95"
                  )}
                >
                  <span className="text-lg mb-1">{method.icon}</span>
                  <span className="text-xs">{method.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
          <Button
            onClick={() => {
              if (!selectedPaymentMethod) {
                alert("Please select a payment method")
                return
              }
              onPrintBill(selectedPaymentMethod.id as "cash" | "card" | "e-wallet", total)
            }}
            className={cn("w-full transition-all duration-200", "hover:scale-105 active:scale-95")}
          >
            Print invoice
          </Button>

          <Button
            onClick={onClearOrder}
            className={cn("w-full transition-all duration-200", "hover:scale-105 active:scale-95")}
            variant="outline"
          >
            Clear order
          </Button>
        </div>
        </>
      )}
    </div>
  )
}
