"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAPI } from "@/hooks/use-api"

export interface Table {
  id: number
  table_number: string
  status: "available" | "occupied" | "reserved"
}

export default function TableManagement() {
  const { get, put, post, del } = useAPI()
  const [tables, setTables] = useState<Table[]>([])

  // State để điều khiển hiển thị dialog thêm bàn
  const [showAddTable, setShowAddTable] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState("")

  // Trạng thái edit
  const [editingTable, setEditingTable] = useState<Table | null>(null)

  // Lấy danh sách bàn từ API khi component được mount
  useEffect(() => {
    fetchTables()
  }, [])

  // Hàm lấy danh sách bàn
  const fetchTables = async () => {
    try {
      const data = await get<{ status?: string; data?: Table[] }>("/tables")

      // Kiểm tra đúng định dạng dữ liệu trả về
      if (Array.isArray(data)) {
        setTables(data)
      } else if (Array.isArray(data?.data)) {
        setTables(data.data)
      } else {
        console.warn("Unexpected tables shape:", data)
      }
    } catch (error) {
      console.error("Failed to fetch tables:", error)
    }
  }

  // Hàm xử lý khi thêm bàn mới
  const handleAddTable = async () => {
    if (!newTableNumber) {
      alert("Please provide a valid table number.")
      return
    }

    // Xử lý logic thêm bàn mới, truyền dữ liệu đến API
    try {
      const res = await post(`/tables`, {
        table_number: newTableNumber,
        status: "available",
      })

      // Cập nhật danh sách bàn sau khi thêm thành công, đóng dialog và đặt lại trạng thái input
      if (res) {
        fetchTables()
        setShowAddTable(false)
        setNewTableNumber("")
      }
    } catch (error) {
      console.error("Failed to add table:", error)
    }
  }

  // Hàm xử lý khi chỉnh sửa bàn
  const handleEditTable = async () => {
    if (!editingTable) return
    try {
      await put(`/tables/${editingTable.id}`, {
        table_number: editingTable.table_number,
        status: editingTable.status,
      })
      fetchTables()
      setEditingTable(null)
    } catch (err) {
      console.error("Error editing table:", err)
    }
  }

  // Hàm xử lý khi xóa bàn
  const handleDeleteTable = async (tableId: number) => {
    if (!confirm("Are you sure you want to delete this table?")) return
    try {
      const res = await del(`/tables/${tableId}`)
      // Khi tableId bị xóa không còn trong danh sách thì component sẽ tự động render lại
      if (res) setTables(tables.filter((table) => table.id !== tableId))
    } catch (error) {
      console.error("Failed to delete table:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Table Management</h3>

        {/* Nút mở dialog thêm bàn */}
        <Button onClick={() => setShowAddTable(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Table
        </Button>
      </div>

      {/* Danh sách bàn */}
      <div className="grid gap-4">
        {tables.map((table: Table) => (
          <Card key={table.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Table {table.table_number}</h4>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${
                      table.status === "available"
                        ? "bg-green-100 text-green-800"
                        : table.status === "occupied"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {table.status}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingTable(table)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTable(table.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Edit Table */}
      <Dialog open={!!editingTable} onOpenChange={() => setEditingTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
          </DialogHeader>
          {editingTable && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="tableName">Table Number</Label>
                <Input
                  id="tableName"
                  value={editingTable.table_number}
                  onChange={(e) =>
                    setEditingTable((prev) => prev && { ...prev, table_number: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full border rounded p-2"
                  value={editingTable.status}
                  onChange={(e) =>
                    setEditingTable((prev) => prev && { ...prev, status: e.target.value as Table["status"] })
                  }
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <Button className="w-full" onClick={handleEditTable}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Add Table */}
      <Dialog open={showAddTable} onOpenChange={setShowAddTable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newTableNumber">Table Number</Label>
              <Input
                id="newTableNumber"
                placeholder="Enter table number"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleAddTable}>
              Add Table
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
