"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Receipt, Calendar, User, X, Printer } from "lucide-react"
import { User as UserType } from "@/hooks/use-pos-store"

const formatCurrency = (value?: number | null) =>
  typeof value === "number" ? value.toLocaleString("vi-VN") + "₫" : "—"

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleString("vi-VN") : "—"

export interface InvoiceItem {
  name: string
  quantity: number
  unit_price: number
  total_amount: number
}

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
  created_by?: string | null
}

export interface Invoice {
  order: InvoiceOrder
  items: InvoiceItem[]

  subtotal: number
  discountPercentage: number
  discountAmount: number
  tax: number
  total: number
}

export interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  orderId?: number | null
  invoice?: Invoice | null
  handlePrint?: () => void
  user: UserType | null
}

export function InvoiceModal({
  isOpen,
  onClose,
  orderId,
  invoice: parentInvoice,
  handlePrint,
  user,
}: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(parentInvoice ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const [printing, setPrinting] = useState(false)

  // Sync prop -> local state khi parentInvoice thay đổi
  useEffect(() => {
    setInvoice(parentInvoice ?? null)
  }, [parentInvoice])

  const noInvoice = !invoice || !invoice.order
  const total = Number(invoice?.order.total_amount || 0)
  const tax = Math.round(total * 10 / 110) // = total * (10/110) = subtotal*0.1
  const subtotal = total - tax

  const waitForPaint = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve())
      })
      // fallback
      setTimeout(() => resolve(), 500)
    })

  //Hook print
  // Internal print handler: chờ paint rồi gọi handlePrint prop nếu có, ngược lại window.print()
  const handleInternalPrint = async () => {
    if (printing) return
    if (!invoice) return

    setPrinting(true)
    try {
      // Đảm bảo modal đã render nội dung mới
      await waitForPaint()

      // Nếu parent truyền handlePrint (ví dụ react-to-print handler), gọi nó
      if (typeof handlePrint === "function") {
        handlePrint()
      } else {
        // fallback in toàn bộ window (modal đang hiển thị)
        window.print()
      }
    } finally {
      setPrinting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-lg max-h-[90vh] overflow-y-auto",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-coffee-brown">
            <Receipt className="h-5 w-5" />
            Invoice
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center py-6">Loading invoice...</p>
        ) : noInvoice ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No invoice data available yet.</p>
            <p className="text-xs text-muted-foreground">If you just paid, please wait a moment.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6" id="invoice-content">
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
                      <Badge variant="outline">{invoice.order.order_code}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg">🪑</span>
                      <span className="font-medium">Table:</span>
                      <span>{invoice.order.table_number || "—"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Date:</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(invoice.order.created_at)}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{invoice.order.created_by || user?.staff_name || user?.username || "—"}</span>
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

                    {invoice.items.map((item: any, index: number) => (
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
                        <div className="text-right text-muted-foreground">{formatCurrency(item.unit_price)}</div>
                        <div className="text-right font-medium">{formatCurrency(item.total_amount)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Totals */}
             <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>

                  {invoice.discountPercentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({invoice.order.discount_percentage}%):</span>
                      <span>-{formatCurrency(invoice.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (10%):</span>
                    <span>{formatCurrency(invoice.tax)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-coffee-brown">{formatCurrency(invoice.total)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2">
                    <span>Payment Method:</span>
                    <span className="capitalize font-medium">{invoice.order.payment_method}</span>
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
          </>
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
            onClick={handleInternalPrint}
            disabled={printing || noInvoice}
            className={cn(
              "flex-1 bg-coffee-brown hover:bg-coffee-brown/90",
              "transition-all duration-200 hover:scale-105 active:scale-95"
            )}
          >
            <Printer className="mr-2 h-4 w-4" />
            {printing ? "Printing..." : "Print"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}