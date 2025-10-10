"use client"

import { useState, useCallback, useMemo } from "react"
import { Table } from "@/hooks/use-table-management"
import { usePromotion, Promotion } from "@/hooks/use-promotion"

// ==== Types (giữ nguyên của bạn) ====
export interface OrderItem {
  id: number
  name: string
  price: number
  category: string
  quantity: number
  notes?: string
}

export interface User {
  id: number
  username: string
  role: "staff" | "admin"
  email?: string
  staff_name?: string
}

export interface AuthData {
  token: string
  user: User
}

export interface Order {
  id: number
  order_code: string
  table_id: number
  order_type: string
  status: string
  created_by?: string
  created_at?: string
}

// ==== Main Hook ====
export function usePOSStore() {
  const { calculateDiscount, validatePromotion } = usePromotion()

  // --- Authentication ---
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // --- Order state ---
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null)

  // --- UI state ---
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentView, setCurrentView] = useState("pos")

  // --- Derived values ---
  const subtotal = useMemo(
    () => orderItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [orderItems],
  )

  const discount = useMemo(() => {
    if (!appliedPromotion) return 0
    if (!validatePromotion(appliedPromotion, subtotal)) return 0

    return calculateDiscount(subtotal, appliedPromotion)
  }, [appliedPromotion, subtotal, validatePromotion, calculateDiscount])

  const total = useMemo(() => Math.max(subtotal - discount, 0), [subtotal, discount])

  // --- Actions ---
  const addToOrder = useCallback((item: Omit<OrderItem, "quantity"> & { quantity?: number }) => {
    setOrderItems((prev) => {
      const existingIndex = prev.findIndex((existing) => existing.id === item.id)

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].quantity += item.quantity || 1
        return updated
      }

      return [...prev, { ...item, quantity: item.quantity || 1 }]
    })
  }, [])

  const updateOrderItem = useCallback((index: number, updates: Partial<OrderItem>) => {
    setOrderItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], ...updates }
      return updated
    })
  }, [])

  const removeOrderItem = useCallback((index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearOrder = useCallback(() => {
    setOrderItems([])
    setCurrentOrder(null)
    setAppliedPromotion(null)
  }, [])

  const login = useCallback((authData: AuthData) => {
    setIsAuthenticated(true)
    setUser(authData.user)
    localStorage.setItem("token", authData.token)
    localStorage.setItem("user", JSON.stringify(authData.user))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    setUser(null)
    setSelectedTable(null)
    clearOrder()
  }, [clearOrder])

  // --- Export all states and actions ---
  return {
    // State
    isAuthenticated,
    user,
    orderItems,
    currentOrder,
    selectedTable,
    appliedPromotion,
    selectedCategory,
    currentView,

    // Computed values
    subtotal,
    discount,
    total,

    // Actions
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
  }
}
