"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { useTableManagement, type Table } from "@/hooks/use-table-management"
import { cn } from "@/lib/utils"

interface TableSelectionProps {
  onTableSelect: (table: Table) => void
  selectedTableId?: number
}

export function TableSelection({ onTableSelect, selectedTableId }: TableSelectionProps) {
  const { tables, isDemoMode, loading, fetchTables, getStatusColor, getStatusText } = useTableManagement()

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Choose table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Table list loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Select table
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTables}
            className="transition-all duration-200 hover:scale-105 bg-transparent"
          >
            Refresh
          </Button>
        </CardTitle>
        {isDemoMode && (
          <div
            className={cn(
              "flex items-center gap-2 text-sm text-amber-600",
              "bg-amber-50 p-2 rounded-md border border-amber-200",
              "animate-pulse",
            )}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Demo Mode: Backend API not connected. Using sample data.</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {tables.map((table) => (
            <Button
              key={table.id}
              variant={selectedTableId === table.id ? "default" : "outline"}
              className={cn(
                "h-20 flex flex-col items-center justify-center relative",
                "transition-all duration-200 hover:scale-105 active:scale-95",
                table.status !== "available" && "opacity-50" // vẫn mờ nếu không available
              )}
              onClick={() => onTableSelect(table)}
            >
              <div className="text-lg font-bold">Table {table.table_number}</div>
              <Badge variant="secondary" className={cn("text-xs mt-1", getStatusColor(table.status))}>
                {getStatusText(table.status)}
              </Badge>
              {table.capacity && <span className="text-xs text-muted-foreground mt-1">{table.capacity} seats</span>}
            </Button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-200 rounded animate-pulse"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <span>Reserved</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
