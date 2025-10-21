"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAPI } from "@/hooks/use-api"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { notify } from "@/lib/notify"

interface RevenueResponse {
    status: string; 
    data: { total_revenue: number; order_count: number }
}

interface RevenueData {
    date: string,
    revenue: number
}

export default function Report() {
  const { get } = useAPI()
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(false)
  const [totalRevenue, setTotalRevenue] = useState(0)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await get<RevenueResponse>("/report/revenue")
      
      // Res trả về obj (không phải array)
      const backend = res.data;
      const revenue = Number(backend.total_revenue) || 0;
        
      // Map thành dạng data mảng dùng cho LineChart
      const mockData: RevenueData[] = [
        { date: "Today", revenue }
      ];

      setData(mockData);
      setTotalRevenue(revenue)
    } catch (err) {
      notify.error("Report fetch error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reports & Analytics</h3>
        <Button onClick={fetchReport} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRevenue.toLocaleString("vi-VN")}₫</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.length ? Math.round(totalRevenue / data.length).toLocaleString("vi-VN") : 0}₫
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Days Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Revenue by Day</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis width={80}/>
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString("vi-VN")}₫`}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line type="monotone" dataKey="revenue" stroke="#b45309" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bảng tổng hợp (nếu cần thêm sau) */}
    </div>
  )
}
