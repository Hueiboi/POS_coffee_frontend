"use client"

import { useState, useCallback } from "react"
import { useAPI } from "./use-api"

export interface Table {
  id: number
  table_number: string
  status: "available" | "occupied" | "reserved"
  capacity?: number
}

const mockTables: Table[] = [
  { id: 1, table_number: "01", status: "available", capacity: 4 },
  { id: 2, table_number: "02", status: "occupied", capacity: 2 },
  { id: 3, table_number: "03", status: "available", capacity: 6 },
  { id: 4, table_number: "04", status: "reserved", capacity: 4 },
  { id: 5, table_number: "05", status: "available", capacity: 2 },
  { id: 6, table_number: "06", status: "available", capacity: 8 },
  { id: 7, table_number: "07", status: "occupied", capacity: 4 },
  { id: 8, table_number: "08", status: "available", capacity: 6 },
]

export function useTableManagement() {
  const [tables, setTables] = useState<Table[]>([])
  const [isDemoMode, setIsDemoMode] = useState(false)
  const { get, put, loading } = useAPI()

  const fetchTables = useCallback(async () => {
    const res = await get<{ data: Table[] }>("/tables") //API trả về object, cần set data thành array để dùng map ở use-table-management

    if (res && Array.isArray(res.data)) {
      setTables(res.data) // ✅ chỉ lấy array
      setIsDemoMode(false)
    } else {
      console.log("[v0] API not available, switching to demo mode")
      setTables(mockTables)
      setIsDemoMode(true)
    }
  }, [get])


  const updateTableStatus = useCallback(
    async (tableId: number, status: Table["status"]) => {
      const result = await put(`/tables/${tableId}/status`, { status })

      if (result) {
        setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, status } : table)))
        return true
      }

      // Fallback: update local state only
      setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, status } : table)))
      return false
    },
    [put],
  )

  const getStatusColor = useCallback((status: Table["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200"
      case "reserved":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }, [])

  const getStatusText = useCallback((status: Table["status"]) => {
    switch (status) {
      case "available":
        return "Available"
      case "occupied":
        return "Occupied"
      case "reserved":
        return "Reserved"
      default:
        return status
    }
  }, [])

  return {
    tables,
    isDemoMode,
    loading,
    fetchTables,
    updateTableStatus,
    getStatusColor,
    getStatusText,
  }
}
