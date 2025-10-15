// app/admin/components/overview.tsx
"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useAPI } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Coffee, Users, Table as TableIcon } from "lucide-react"

// GET /report/revenue  trả về { status: "success", data: { total_revenue, order_count }, msg }
interface ReportBackend {
  total_revenue: number | null
  order_count: number | null
}
interface ReportResponse {
  status: "success" | "error"
  data: ReportBackend
  msg?: string
}

interface Report {
  totalRevenue: number
  totalOrders: number
  weeklyGrowth?: number // nếu backend có sau này
  topItems?: string[] // nếu backend có sau này
}

export interface Staff {
  id: number
  username: string
  role: "staff" | "admin"
  email?: string
}

export interface TableModel {
  id: number
  table_number: string
  capacity?: number
  status?: "available" | "occupied" | "reserved"
}

export default function Overview() {
  const { get } = useAPI()

  // State gốc
  const [report, setReport] = useState<Report>({
    totalRevenue: 0,
    totalOrders: 0,
    weeklyGrowth: 0,
    topItems: [],
  })
  const [staff, setStaff] = useState<Staff[]>([])
  const [tables, setTables] = useState<TableModel[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Fetch data
  useEffect(() => {
    // Mount để tránh setState khi component đã unmount
    let mounted = true // Biến để kiểm tra component còn mounted hay không
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        // Dùng Promise.allSettled để fetch song song 3 API
        const [reportRes, staffRes, tableRes] = await Promise.allSettled([
          get<ReportResponse>("/report/revenue"),
          get<{ data?: Staff[] }>("/users/all?role=staff"),
          get<{ data?: TableModel[] }>("/tables")
        ])

        if (!mounted) return

        // Report
        // Dùng fulfilled để chắc chắn không bị lỗi, nếu bị lỗi thì không làm gì
        if (reportRes.status === "fulfilled" && reportRes.value?.data) {
          const backend = reportRes.value.data
          setReport({
            totalRevenue: Number(backend.total_revenue) || 0,
            totalOrders: Number(backend.order_count) || 0,
            weeklyGrowth: 5,
            topItems: ["Espresso", "Cappuccino", "Latte"]
          })
        }

        // Staff
        if (staffRes.status === "fulfilled") {
          const data = staffRes.value.data || []
          setStaff(Array.isArray(data) ? data : [])
        }

        // Tables
        if (tableRes.status === "fulfilled") {
          const data = tableRes.value.data || []
          setTables(Array.isArray(data) ? data : [])
        }

      } catch (err: any) {
        if (mounted) setError(err.message || "Error fetching data")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchAll()
    return () => { mounted = false }
  }, [get])

  
  // Format theo tiền tệ Việt Nam, chỉ tính lại khi giá trị thay đổi
  const totalRevenueText = useMemo(
    () => (report.totalRevenue || 0).toLocaleString("vi-VN"),
    [report.totalRevenue],
  );

  // Đếm số bàn trống, chỉ tính lại khi danh sách bàn thay đổi
  const availableTablesCount = useMemo(
    () => tables.filter((t) => t.status === "available").length,
    [tables],
  );

  // UI
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-white rounded shadow" />
          <div className="h-28 bg-white rounded shadow" />
          <div className="h-28 bg-white rounded shadow" />
          <div className="h-28 bg-white rounded shadow" />
        </div>
        <div className="h-40 bg-white rounded shadow" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-red-600">Error loading overview: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Weekly Revenue</p>
                <p className="text-2xl font-bold">{totalRevenueText}₫</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Coffee className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{report.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TableIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Available Tables</p>
                <p className="text-2xl font-bold">{availableTablesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Growth Rate</p>
              <p className="text-lg font-semibold text-green-600">
                +{report.weeklyGrowth ?? 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Selling Items</p>
              <div className="flex gap-2 mt-1">
                {report.topItems && report.topItems.length > 0 ? (
                  report.topItems.map((item, i) => (
                    <Badge key={i} variant="secondary">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No top items yet</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
