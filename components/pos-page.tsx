"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ProductMenu } from "@/components/product-menu"
import { OrderSummary } from "@/components/order-summary"
import { AuthModal } from "@/components/auth-modal"
import { TableSelection } from "@/components/table-selection"
import { InvoiceModal, InvoiceResponse } from "@/components/invoice-modal"
import { OrderHistory } from "@/components/order-history"
import { PromotionsManagement } from "@/components/promotions-management"
import { Order, usePOSStore } from "@/hooks/use-pos-store"
import { useAPI } from "@/hooks/use-api"
import { toast } from "@/hooks/use-toast"
import { Table } from "@/hooks/use-table-management"
import type { Invoice, InvoiceOrder, InvoiceItem } from "@/components/invoice-modal" // Use the correct Invoice type expected by InvoiceModal
import { transformInvoiceData } from "@/lib/utils"
import { Promotion } from "@/hooks/use-promotion"    

export default function POSPage() {
  const { post, put, get } = useAPI()
  const {
    isAuthenticated,
    user,
    orderItems,
    currentOrder,
    selectedTable,
    appliedPromotion,
    selectedCategory,
    currentView,
    subtotal,
    discount,
    total,
    setIsAuthenticated,
    addToOrder,
    updateOrderItem,
    removeOrderItem,
    clearOrder,
    login,
    logout,
    setCurrentOrder,
    setSelectedTable,
    setAppliedPromotion,
    setSelectedCategory,
    setCurrentView,
  } = usePOSStore()

  // UI state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showTableSelection, setShowTableSelection] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceOrderId, setInvoiceOrderId] = useState<number | null>(null)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [tables, setTables] = useState<Table[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    console.log("POSPage token check:", token);

    if (token && userData) {
      login({ token, user: JSON.parse(userData) })
      setShowTableSelection(true)
    } else {
      setShowAuthModal(true)
    }
  }, [login])

  // backend trả { status, msg, data: { access_token } }
  const handleAuthSuccess = (data: { access_token: string }) => {
    localStorage.setItem("token", data.access_token)
    setIsAuthenticated(true)
    setShowAuthModal(false)
    setShowTableSelection(true)
  }

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table)
    setShowTableSelection(false)
    setCurrentView("pos")
  }

  const handleLogout = () => {
    logout()
    setShowAuthModal(true)
    setShowTableSelection(false)
  }

  const handleApplyPromotion = (promotion: Promotion) => {
    setAppliedPromotion(promotion)
    setCurrentView("pos")
    toast({
      title: `✅ Promotion applied`,
      description: `${promotion.name} (${promotion.discount_percentage}% off)`,
    })
  }

  // Type cho payment method
  type PaymentMethod = "cash" | "card" | "e-wallet"

  // Authentication check
  if (!isAuthenticated) {
    return (
        <AuthModal 
        isOpen={!isAuthenticated}
        onAuthSuccess={(data) => handleAuthSuccess(data)}
        />
        )
    }

  // Table selection
  if (showTableSelection) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Welcome to the new shift!</h1>
            <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">
              Logout
            </button>
          </div>
          <TableSelection onTableSelect={handleTableSelect} selectedTableId={selectedTable?.id} />
        </div>
      </div>
    )
  }

  // Update trạng thái bàn
  // Status được giới hạn bằng Table["status"] để type-safe
  const updateTableStatus = async (tableId: number, status: Table["status"]) => {
    const result = await put(`/tables/${tableId}/status`, { status })
    return !!result
  }

  // Create Order
  const createOrder = async (): Promise<Order | null> => {
    if (!selectedTable) {
      toast({ title: "Please select a table before ordering", variant: "destructive" })
      return null
    }

    if (creatingOrder) return null // chặn double click
    setCreatingOrder(true)

    try {
      const orderData = await post<Order>("/orders", {
        table_id: selectedTable.id,
        order_type: "dine_in",
        created_by: user?.staff_name || user?.username,
        created_by_id: user?.id,
      })

      if (orderData) {
        setCurrentOrder(orderData)
        await updateTableStatus(selectedTable.id, "occupied")
        setSelectedTable((prev) =>
          prev ? { ...prev, status: "occupied" } : null
        )
        toast({ title: "Order created successfully", variant: "default" })
        return orderData
      }

      // Nếu API không có, fallback demo
      const mockOrder: Order = {
        id: Date.now(),
        order_code: `ORD-${Date.now()}`,
        table_id: selectedTable.id,
        order_type: "dine-in",
        status: "pending",
      }
      setCurrentOrder(mockOrder)
      setSelectedTable((prev) =>
        prev ? { ...prev, status: "occupied" } : null
      )
      toast({ title: "Demo order created (API unavailable)", variant: "default" })
      return mockOrder
    } catch (err) {
      toast({ title: "Error while creating order", variant: "destructive" })
      return null
    } finally {
      setCreatingOrder(false)
    }
  }
  
  // Payment
  const handlePrintAndPay = async (paymentMethod: PaymentMethod, total: number) => {
    if (!selectedTable || orderItems.length === 0) {
      alert("Please select a table and add items before printing")
      return
    }

    try {
      let orderId = currentOrder?.id

      // 1️⃣ Tạo order nếu chưa có
      if (!orderId) {
        const res = await post<{ data: Order }>("/orders", {
          table_id: selectedTable.id,
          order_type: "dine-in",
          promotion_id: appliedPromotion?.id || null,
          created_by: user?.staff_name || user?.username || "Unknown", // ✅ thêm
        })

        const createdOrder = res?.data
        if (!createdOrder) throw new Error("Failed to create order")

        setCurrentOrder(createdOrder)
        orderId = createdOrder.id
      }

      // 2️⃣ Thêm món vào order
      for (const item of orderItems) {
        await post(`/orders/${orderId}/items`, {
          product_id: item.id,
          quantity: item.quantity,
        })
      }

      // 3️⃣ Thanh toán order
      await post(`/orders/${orderId}/pay`, {
        payment_method: paymentMethod,
        total_amount: total,
        promotion_id: appliedPromotion?.id || null,
        created_by: user?.staff_name || user?.username || "Unknown", // ✅ thêm
      })

      // 4️⃣ Lấy hóa đơn (fix lỗi undefined.items)
      const invoiceRes = await get<{
        status: string
        msg: string
        data: {
          order: any
          items: any[]
        }
      }>(`/payment/invoices/${orderId}`)
      console.log("[Invoice raw]:", invoiceRes)

      const raw = invoiceRes?.data
      if (!raw || !raw.order || !Array.isArray(raw.items)) {
        console.error("❌ Unexpected invoice structure:", invoiceRes)
        throw new Error("No invoice data")
      }

      const invoiceData = transformInvoiceData(raw)
      setInvoice(invoiceData)
      setInvoiceOrderId(orderId)
      setShowInvoice(true)

      // 5️⃣ Cập nhật trạng thái bàn
      await updateTableStatus(selectedTable.id, "occupied")
      setSelectedTable((prev) => (prev ? { ...prev, status: "occupied" } : null))
    } catch (err) {
      console.error("[FE] Print & Pay error:", err)
      alert("Failed to process invoice. Please try again.")
    }
  }


  // Print bill
  const handlePrintBill = async (paymentMethod: PaymentMethod, total: number) => {
    await handlePrintAndPay(paymentMethod, total)
  }


  const handleFreeTable = async (tableId: number) => {
    try {
      const res = await put(`/tables/${tableId}/status`, { status: "available" })
      if (res) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === tableId ? { ...t, status: "available" } : t
          )
        )
        if (selectedTable?.id === tableId) {
          setSelectedTable({ ...selectedTable, status: "available" })
        }
        clearOrder()
      }
    } catch (err) {
      console.error("Failed to free table:", err)
    }
  }

  if (currentView === "history") {
    return <OrderHistory 
    onBack={() => setCurrentView("pos")}
    tableId={selectedTable?.id ?? null}
    />
  }

  if (currentView === "promotions") {
    return <PromotionsManagement onBack={() => setCurrentView("pos")} onApplyPromotion={handleApplyPromotion} />
  }

  // Main POS interface
  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        user={user}
        selectedTable={selectedTable}
        onChangeTable={() => setShowTableSelection(true)}
        onLogout={handleLogout}
        onNavigate={setCurrentView}
        currentView={currentView}
      />

      <div className="flex-1 flex">
        <ProductMenu
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onAddToOrder={addToOrder}
        />

        <OrderSummary
          items={orderItems}
          onUpdateItem={updateOrderItem}
          onRemoveItem={removeOrderItem}
          onClearOrder={clearOrder}
          onPrintBill={handlePrintBill}
          handleFreeTable={(tableId: number) => handleFreeTable(tableId)}
          currentOrder={currentOrder}
          selectedTable={selectedTable}
          appliedPromotion={appliedPromotion}
          discount={discount}
          subtotal={subtotal}
          total={total}
        />
      </div>

      <InvoiceModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        orderId={invoiceOrderId}
        invoice={invoice}
        user={user}
        handlePrint={() => {
          window.print()
        }}
      />
    </div>
  )
}



