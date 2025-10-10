"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAPI } from "@/hooks/use-api"

interface APIResponse<T> {
  status: string
  data: T
  msg?: string
  error?: string
}

interface OrderHistoryProps {
  onBack: () => void
  tableId: number | null
}

interface OrderItem {
  menu_name: string
  quantity: number
  price: number
}

interface Order {
  id: number
  order_code: string
  table_number: string
  created_at: string
  status: "pending" | "completed" | "cancelled"
  total_amount: number
  payment_method?: string
  items: OrderItem[]
}

export function OrderHistory({ onBack, tableId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { get } = useAPI()

  useEffect(() => {
    if (!tableId) return
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const response = await get<APIResponse<Order[]>>(
          `/orders/table/completed/${tableId}`
        )
        console.log("📦 Raw orders from API:", response.data)

        const normalized = response.data.map((order) => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : [],
        }))
        setOrders(normalized)
      } catch (err) {
        console.error("[OrderHistory] error:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [tableId, get])

  const filteredOrders = Array.isArray(orders)
    ? orders.filter(
        (order) =>
          order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.table_number.includes(searchTerm)
      )
    : []

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            ← Back to POS
          </Button>
          <h1 className="text-xl font-semibold">Order History</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order code or table number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{order.order_code}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Table {order.table_number} •{" "}
                      {new Date(order.created_at).toLocaleString("vi-VN")}
                    </p>
                    <p className="font-semibold text-lg">
                      {order.total_amount.toLocaleString("vi-VN")}₫
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Payment: {order.payment_method || "—"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log("👆 View Details:", order)
                      setSelectedOrder(order)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No orders found matching your search.
          </div>
        )}
      </div>

      {/* Dialog outside map */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Order Details – {selectedOrder?.order_code || "—"}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Table</p>
                <p className="font-semibold">
                  Table {selectedOrder.table_number}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-semibold">
                  {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <div className="space-y-2">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ?  (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {item.menu_name} x{item.quantity}
                        </span>
                        <span>
                          {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      Không có món nào
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {selectedOrder.total_amount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-semibold capitalize">
                  {selectedOrder.payment_method || "—"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}