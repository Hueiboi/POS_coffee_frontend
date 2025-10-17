"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useAPI } from "@/hooks/use-api"

export interface Menu {
  id: number
  name: string
  price: number
  category?: string
  stock_quantity?: number
}

export default function MenuManagement() {
  const { get, post, put, del } = useAPI()
  const [menu, setMenu] = useState<Menu[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState<number | string>("")
  const [newCategory, setNewCategory] = useState("Coffee")

  const [editingItem, setEditingItem] = useState<Menu | null>(null)

  // Fetch danh sách menu
  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await get<{ data?: Menu[] }>("/menu")
      if (Array.isArray(res?.data)) setMenu(res.data)
    } catch (err) {
      console.error("Failed to fetch menu:", err)
    }
  }

  // Thêm item
  const handleAddMenu = async () => {
    if (!newName || !newPrice) {
      alert("Please enter name and price.")
      return
    }
    try {
      await post("/menu", {
        name: newName,
        price: Number(newPrice),
        category: newCategory,
      })
      fetchMenu()
      setShowAdd(false)
      setNewName("")
      setNewPrice("")
    } catch (err) {
      console.error("Error adding menu item:", err)
    }
  }

  // Edit item
  const handleEditMenu = async () => {
    if (!editingItem) return
    try {
      await put(`/menu/${editingItem.id}`, {
        name: editingItem.name,
        price: editingItem.price,
        category: editingItem.category,
      })
      fetchMenu()
      setEditingItem(null)
    } catch (err) {
      console.error("Error editing menu:", err)
    }
  }

  // Delete item
  const handleDeleteMenu = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      await del(`/menu/${id}`)
      setMenu(menu.filter((m) => m.id !== id))
    } catch (err) {
      console.error("Error deleting menu item:", err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Menu Management</h3>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Danh sách menu */}
      <div className="grid gap-4">
        {menu.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.price.toLocaleString("vi-VN")}₫
                </p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {item.category}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteMenu(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Add */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="price">Price (VND)</Label>
              <Input
                id="price"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full p-2 border rounded"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="Coffee">Coffee</option>
                <option value="Juice">Juice</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
            <Button className="w-full" onClick={handleAddMenu}>
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem((prev) => prev && { ...prev, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editPrice">Price (VND)</Label>
                <Input
                  id="editPrice"
                  type="number"
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem((prev) => prev && { ...prev, price: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editCategory">Category</Label>
                <select
                  id="editCategory"
                  className="w-full border rounded p-2"
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem((prev) => prev && { ...prev, category: e.target.value })
                  }
                >
                  <option value="Coffee">Coffee</option>
                  <option value="Juice">Juice</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              <Button className="w-full" onClick={handleEditMenu}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
