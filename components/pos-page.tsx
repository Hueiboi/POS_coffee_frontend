"use client"

import { useState, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { ProductMenu } from "@/components/product-menu"
import { OrderSummary } from "@/components/order-summary"
import { AuthModal } from "@/components/auth-modal"
import { TableSelection } from "@/components/table-selection"
import { OrderHistory } from "@/components/order-history"
import { PromotionsManagement } from "@/components/promotions-management"
import { Order, usePOSStore } from "@/hooks/use-pos-store"
import { useAPI } from "@/hooks/use-api"
import { toast } from "@/hooks/use-toast"
import { Table } from "@/hooks/use-table-management"
import { Invoice, InvoiceModal } from "@/components/invoice-modal" 
import { transformInvoiceData } from "@/lib/utils"
import { Promotion } from "@/hooks/use-promotion"    
import { notify } from "@/lib/notify"
import { useAuth } from "@/hooks/use-auth"

export default function POSPage() {
  const { post, put } = useAPI()
  const { logout } = useAuth()
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
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [tables, setTables] = useState<Table[]>([])

  // Type cho payment method
  type PaymentMethod = "cash" | "card" | "e-wallet"

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      // Đừng gọi login() ở đây nữa
      setIsAuthenticated(true);
      setShowTableSelection(true);
    } else {
      setShowAuthModal(true);
    }
  }, []);

  const handleAuthSuccess = useCallback((data: { access_token: string }) => {
    localStorage.setItem("token", data.access_token)
    setIsAuthenticated(true)
    setShowAuthModal(false)
    setShowTableSelection(true)

  }, [setIsAuthenticated])

  const handleTableSelect = useCallback((table: Table) => {
    setSelectedTable(table)
    setShowTableSelection(false)
    setCurrentView("pos")
  }, [setSelectedTable, setCurrentView])

  const handleLogout = () => {
    logout()
    setIsAuthenticated(false)
    setShowAuthModal(true)
    setShowTableSelection(false)
  }

  const handleApplyPromotion = useCallback((promotion: Promotion) => {
    setAppliedPromotion(promotion)
    setCurrentView("pos")
    toast({
      title: `Promotion applied`,
      description: `${promotion.name} (${promotion.discount_percentage}% off)`,
    })
  }, [setAppliedPromotion, setCurrentView])

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
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          </div>
          <TableSelection onTableSelect={handleTableSelect} selectedTableId={selectedTable?.id} />
        </div>
      </div>
    )
  }

  // Status được giới hạn bằng Table["status"] để type-safe
  const updateTableStatus = async (tableId: number, status: Table["status"]) => {
    const result = await put(`/tables/${tableId}/status`, { status })
    return !!result
  }

  // Create Order
  // const createOrder = async (): Promise<Order | null> => {
  //   if (!selectedTable) {
  //     toast({ title: "Please select a table before ordering", variant: "destructive" })
  //     return null
  //   }

  //   if (creatingOrder) return null // chặn double click
  //   setCreatingOrder(true)

  //   try {
  //     const orderData = await post<Order>("/orders", {
  //       table_id: selectedTable.id,
  //       order_type: "dine_in",
  //       created_by: user?.staff_name || user?.username,
  //       created_by_id: user?.id,
  //     })

  //     if (orderData) {
  //       setCurrentOrder(orderData)
  //       await updateTableStatus(selectedTable.id, "occupied")
  //       setSelectedTable((prev) =>
  //         prev ? { ...prev, status: "occupied" } : null
  //       )
  //       toast({ title: "Order created successfully", variant: "default" })
  //       return orderData
  //     }
  
  // Payment
  const handlePrintAndPay = async (paymentMethod: PaymentMethod, total: number) => {
  if (!selectedTable || orderItems.length === 0) {
    notify.error("Please select a table and add items before printing");
    return;
  }

  try {
    let orderId = currentOrder?.id ?? null;

    // Tạo order nếu chưa có
    if (!orderId) {
      const orderBody: any = {
        table_id: selectedTable.id,
        order_type: "dine-in",
        created_by: user?.staff_name || user?.username || "Unknown",
      };
      if (appliedPromotion?.id) orderBody.promotion_id = appliedPromotion.id;

      const res = await post<{ data: Order }>("/orders", orderBody);
      orderId = res?.data?.id;
      if (!orderId) throw new Error("Failed to create order");
      setCurrentOrder(res.data);
    }

    // Thêm món vào order
    for (const item of orderItems) {
      await post(`/orders/${orderId}/items`, {
        product_id: item.id,
        quantity: item.quantity,
      });
    }

    // Gửi thanh toán, nhận lại invoice trực tiếp
    const paymentBody: any = {
      payment_method: paymentMethod,
      total_amount: total,
      created_by: user?.staff_name || user?.username || "Unknown",
    };
    if (appliedPromotion?.id) {
      paymentBody.promotion_id = appliedPromotion.id;

    }

    const paymentRes = await post<{ status: string; data: Invoice }>(`/orders/${orderId}/pay`, paymentBody);

    const raw = paymentRes?.data;
    if (!raw || !raw.items) {
      console.error("Invoice data incomplete:", raw);
      throw new Error("Invoice missing items");
    }

    await new Promise((r) => setTimeout(r, 200));

    const invoiceData = transformInvoiceData({
      order: raw,
      items: raw.items
    });

    setInvoice(invoiceData);
    setInvoiceOrderId(orderId);
    setShowInvoice(true);
    notify.success("Payment successful!");

    // Cập nhật trạng thái bàn
    await updateTableStatus(selectedTable.id, "occupied");
    setSelectedTable((prev) => (prev ? { ...prev, status: "occupied" } : null));

    return invoiceData
  } catch (err) {
    notify.error("Failed to process payment. Please try again.");
    console.error(err);
  }
};

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
        notify.success("Clear table successfully")
      }
    } catch (err: any) {
      notify.error("Failed to free table")
      console.error(err.message);
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



