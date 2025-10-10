"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Receipt, Calendar, User, X, Printer } from "lucide-react"
import { User as UserType} from "@/hooks/use-pos-store"   



// ============================
// Helpers
// ============================
const formatCurrency = (value?: number | null) =>
  typeof value === "number" ? value.toLocaleString("vi-VN") + "₫" : "—"

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleString("vi-VN") : "—"

// ============================
// Types
// ============================
// Một món trong hóa đơn
export interface InvoiceItem {
  name: string
  quantity: number
  unit_price: number
  total: number
}

// Thông tin đơn hàng
export interface InvoiceOrder {
  id?: number
  order_code: string
  table_number?: string | null
  created_at: string
  total_amount: number
  status?: string
  promotion_id?: number | null
  discount_percentage?: number | null
  payment_method?: string | null
  created_by?: string | null // chính là staff_name
}

// Cấu trúc hóa đơn tổng hợp
export interface Invoice {
  order: InvoiceOrder
  items: InvoiceItem[]
}

export interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  orderId?: number | null
  invoice?: Invoice | null
  handlePrint: () => void
  user: UserType | null
}

export interface InvoiceResponse {
  data: Invoice
}

// ============================
// Component
// ============================
export function InvoiceModal({ isOpen, onClose, orderId, invoice: parentInvoice, handlePrint, user }: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(parentInvoice ?? null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Nếu chưa có dữ liệu
  if (!invoice || !invoice.order) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg text-center">
          <DialogHeader>
            <DialogTitle>No invoice data available</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const { order, items } = invoice

  const subtotal = Number(order.total_amount) || 0
  const tax = subtotal * 0.1
  const total = subtotal + tax

   return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn("sm:max-w-lg max-h-[90vh] overflow-y-auto", "animate-in fade-in-0 zoom-in-95 duration-200")}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-coffee-brown">
            <Receipt className="h-5 w-5" />
            Invoice
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center py-6">Loading invoice...</p>
        ) : (
          <div className="space-y-6" id="invoice-content">
            {/* Header */}
            <Card className="bg-gradient-to-r from-coffee-cream to-coffee-light border-coffee-brown/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">☕</span>
                  <h2 className="text-xl font-bold text-coffee-brown">PlayStation Coffee</h2>
                </div>
                <p className="text-sm text-coffee-brown/80">123 Đường ABC, Thụy Khuê, Tây Hồ</p>
                <p className="text-sm text-coffee-brown/80">Tel: 123 456 789 JQK</p>
              </CardContent>
            </Card>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Order:</span>
                    <Badge variant="outline">{order.order_code}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">🪑</span>
                    <span className="font-medium">Table:</span>
                    <span>{order.table_number || "—"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.created_by || user?.staff_name || user?.username || "—"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Items */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                    <div>Item</div>
                    <div className="text-center">Qty</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">Total</div>
                  </div>

                  {items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className={cn(
                        "grid grid-cols-4 gap-2 text-sm py-2",
                        "hover:bg-muted/50 rounded transition-colors duration-200"
                      )}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="text-right text-muted-foreground">
                        {formatCurrency(item.unit_price)}
                      </div>
                      <div className="text-right font-medium">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (10%):</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>

                  {order.discount_percentage && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-{order.discount_percentage}%</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-coffee-brown">{formatCurrency(total)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2">
                    <span>Payment Method:</span>
                    <div className="flex items-center gap-2 capitalize font-medium">
                      {order.payment_method}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <Card className="bg-coffee-cream border-coffee-light">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-coffee-brown font-medium">Thank you for visiting!</p>
                <p className="text-xs text-coffee-brown/80 mt-1">We hope to see you again soon</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className={cn("flex-1 transition-all duration-200", "hover:scale-105 active:scale-95")}
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
          <Button
            onClick={handlePrint}
            className={cn(
              "flex-1 bg-coffee-brown hover:bg-coffee-brown/90",
              "transition-all duration-200 hover:scale-105 active:scale-95"
            )}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
