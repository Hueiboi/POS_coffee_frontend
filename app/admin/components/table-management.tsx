"use client"

import { useState, useEffect} from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAPI } from "@/hooks/use-api"

export interface Table {
  id: number
  table_number: string
  capacity: number
  status: "available" | "occupied" | "reserved"
}

export default function TableManagement() {
    const {get , post, del} = useAPI();
    const [tables, setTables] = useState<Table[]>([]);
    const [showAddTable, setShowAddTable] = useState(false); // State để điều khiển hiển thị dialog thêm bàn
    const [newTableNumber, setNewTableNumber] = useState("");
    const [newCapacity, setNewCapacity] = useState("");

    // Lấy danh sách bàn từ API khi component được mount
    useEffect(() => {
        fetchTables();
    }, [])

    // Hàm lấy danh sách bàn
    const fetchTables = async () => {
      try {
        const data = await get<{ status?: string; data?: Table[] }>("/tables");
        // Kiểm tra đúng định dạng dữ liệu trả về
        if (Array.isArray(data)) {
          setTables(data)
        } else if (Array.isArray(data?.data)) {
          setTables(data.data)
        } else {
          console.warn("Unexpected tables shape:", data)
        }
      } catch (error) {
        console.error("Failed to fetch tables:", error);
      }
    }

    // Hàm xử lý khi thêm bàn mới
    const handleAddTable = async () => {
      if(!newTableNumber || !newCapacity) {
        alert("Please provide valid table number and capacity.");
      }
      // Xử lý logic thêm bàn mới, truyền dữ liệu đến API
      try {
        const newTable = await post<Table>("tables", {
          table_number: newTableNumber,
          capacity: newCapacity,
          status: "available"
        })
        // Cập nhật danh sách bàn sau khi thêm thành công, đóng dialog và đặt lại trạng thái input
        if(newTable) {
          setTables([...tables, newTable]);
          setShowAddTable(false);
          setNewTableNumber("");
          setNewCapacity("");  
        }
      } catch (error) {
        console.error("Failed to add table:", error);
      }
    }

    // Hàm xử lý khi xóa bàn
    const handleDeleteTable = async (tableId: number) => {
      if(!confirm("Are you sure you want to delete this table?")) return;
      try {
        const res = await del(`/tables/${tableId}`);
        // Khi tableId bị xóa không còn trong danh sách thì component sẽ tự động render lại
        if(res) setTables(tables.filter(table => table.id !== tableId));
      } catch (error) {
        console.error("Failed to delete table:", error);
      }
    }

    return(
        <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Table Management</h3>
                <Dialog open={showAddTable} onOpenChange={setShowAddTable}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Table
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Table</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div> 
                        <Label htmlFor="tablenumber">Table Number</Label>
                        <Input id="tablenumber" placeholder="Enter table number" />
                      </div>
                      <div>
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input id="capacity" type="number" placeholder="Enter capacity" />
                      </div>
                      <Button className="w-full">Add Table</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
        
              <div className="grid gap-4">
                {tables.map((table: Table) => (
                  <Card key={table.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">Table {table.table_number}</h4>
                          <p className="text-sm text-muted-foreground">Capacity: {table.capacity} people</p>
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
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
    )
}