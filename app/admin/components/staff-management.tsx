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

export interface Staff {
  id: number
  username: string
  role: "staff" | "admin"
  email?: string
  password: string
}

export default function StaffManagement() {
  const { get, post, put, del } = useAPI()
  const [staff, setStaff] = useState<Staff[]>([])

  // State để điều khiển dialog
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  // Lấy danh sách nhân viên
  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const res = await get<{ data?: Staff[] }>("/users/all?role=staff")
      if (Array.isArray(res?.data)) setStaff(res.data)
    } catch (err) {
      console.error("Failed to fetch staff:", err)
    }
  }

  // Thêm nhân viên mới
  const handleAddStaff = async () => {
    if (!newUsername) {
      alert("Please enter a username.")
      return
    }
    try {
      await post("/users", {
        username: newUsername,
        email: newEmail || `${newUsername}@example.com`,
      })
      fetchStaff()
      setShowAddStaff(false)
      setNewUsername("")
      setNewEmail("")
    } catch (err) {
      console.error("Error adding staff:", err)
    }
  }

  // Chỉnh sửa nhân viên
  const handleEditStaff = async () => {
    if (!editingStaff) return;
  
    try {
      const payload: any = {
        username: editingStaff.username,
        email: editingStaff.email,
        role: editingStaff.role,
      };
  
      // chỉ gửi password nếu người dùng nhập mới
      if (editingStaff.password && editingStaff.password.length >= 6) {
        payload.password = editingStaff.password;
      }
  
      await put(`/users/${editingStaff.id}`, payload);
      fetchStaff(); // reload danh sách
      setEditingStaff(null);
    } catch (err) {
      console.error("Error editing staff:", err);
    }
  };
  

  // Xóa nhân viên
  const handleDeleteStaff = async (id: number) => {
    if (!confirm("Are you sure you want to delete this staff?")) return
    try {
      await del(`/users/${id}`)
      setStaff(staff.filter((s) => s.id !== id))
    } catch (err) {
      console.error("Error deleting staff:", err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Staff Management</h3>
        <Button onClick={() => setShowAddStaff(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Danh sách staff */}
      <div className="grid gap-4">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{member.username}</h4>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {member.role}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingStaff(member)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteStaff(member.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Add */}
      <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Enter email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleAddStaff}>
              Add Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={!!editingStaff} onOpenChange={() => setEditingStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
          </DialogHeader>
          {editingStaff && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editUsername">Username</Label>
                <Input
                  id="editUsername"
                  value={editingStaff.username}
                  onChange={(e) =>
                    setEditingStaff((prev) => prev && { ...prev, username: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  value={editingStaff.email}
                  onChange={(e) =>
                    setEditingStaff((prev) => prev && { ...prev, email: e.target.value })
                  }
                />
              </div>
              <Button className="w-full" onClick={handleEditStaff}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
