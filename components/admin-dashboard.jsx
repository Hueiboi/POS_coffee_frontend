"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Coffee, Table, TrendingUp, Plus, Edit, Trash2 } from "lucide-react"

//Tổng thể toàn bộ phần dashboard admin
export function AdminDashboard({ user, onBack }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [staff, setStaff] = useState([])
  const [menu, setMenu] = useState([])
  const [tables, setTables] = useState([])
  const [reports, setReports] = useState({})
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showAddTable, setShowAddTable] = useState(false)

  //mock data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Mock data for demo
    setStaff([
      { id: 1, username: "staff1", full_name: "Nguyen Van A", role: "staff", shift: "morning" },
      { id: 2, username: "staff2", full_name: "Tran Thi B", role: "staff", shift: "evening" },
    ])

    setMenu([
      { id: 1, name: "Caramel Frappuccino", price: 65000, category: "Coffee", status: "active" },
      { id: 2, name: "Chocolate Frappuccino", price: 70000, category: "Coffee", status: "active" },
    ])

    setTables([
      { id: 1, table_number: "01", capacity: 4, status: "available" },
      { id: 2, table_number: "02", capacity: 2, status: "occupied" },
    ])

    setReports({
      totalOrders: 45,
      totalRevenue: 2850000,
      topItems: ["Caramel Frappuccino", "Chocolate Frappuccino"],
      weeklyGrowth: 12.5,
    })
  }

  //Các phím ở bên trái để chuyển đổi giữa các tab
  const TabButton = ({ id, label, icon: Icon }) => (
    <Button variant={activeTab === id ? "default" : "ghost"} className="justify-start" onClick={() => setActiveTab(id)}>
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Button>
  )

  //Phần giao diện tổng quan, gồm các thẻ thông tin và báo cáo hàng tuần
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Weekly Revenue</p>
                <p className="text-2xl font-bold">{reports.totalRevenue?.toLocaleString("vi-VN")}₫</p>
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
                <p className="text-2xl font-bold">{reports.totalOrders}</p>
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
              <Table className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Available Tables</p>
                <p className="text-2xl font-bold">{tables.filter((t) => t.status === "available").length}</p>
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
              <p className="text-lg font-semibold text-green-600">+{reports.weeklyGrowth}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Selling Items</p>
              <div className="flex gap-2 mt-1">
                {reports.topItems?.map((item, index) => (
                  <Badge key={index} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  //Phần quản lý nhân viên, gồm danh sách nhân viên và chức năng thêm, sửa, xóa
  const renderStaffManagement = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Staff Management</h3>
        <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter username" />
              </div>
              <div>
                <Label htmlFor="fullname">Full Name</Label>
                <Input id="fullname" placeholder="Enter full name" />
              </div>
              <div>
                <Label htmlFor="shift">Shift</Label>
                <select className="w-full p-2 border rounded">
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <Button className="w-full">Add Staff</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{member.full_name}</h4>
                  <p className="text-sm text-muted-foreground">@{member.username}</p>
                  <Badge variant="outline" className="mt-1">
                    {member.shift}
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

  //Phần quản lý thực đơn, gồm danh sách món và chức năng thêm, sửa, xóa
  const renderMenuManagement = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Menu Management</h3>
        <Dialog open={showAddMenu} onOpenChange={setShowAddMenu}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="itemname">Item Name</Label>
                <Input id="itemname" placeholder="Enter item name" />
              </div>
              <div>
                <Label htmlFor="price">Price (VND)</Label>
                <Input id="price" type="number" placeholder="Enter price" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select className="w-full p-2 border rounded">
                  <option value="Coffee">Coffee</option>
                  <option value="Juice">Juice</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              <Button className="w-full">Add Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {menu.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.price.toLocaleString("vi-VN")}₫</p>
                  <Badge variant="outline" className="mt-1">
                    {item.category}
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

  //Phần quản lý bàn, gồm danh sách bàn và chức năng thêm, sửa, xóa
  const renderTableManagement = () => (
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
        {tables.map((table) => (
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            ← Back to POS
          </Button>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <div className="ml-auto">
            <span className="text-sm text-muted-foreground">Welcome, {user?.username}</span>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-64 border-r bg-muted/10 p-4">
          <div className="space-y-2">
            <TabButton id="overview" label="Overview" icon={TrendingUp} />
            <TabButton id="staff" label="Staff Management" icon={Users} />
            <TabButton id="menu" label="Menu Management" icon={Coffee} />
            <TabButton id="tables" label="Table Management" icon={Table} />
          </div>
        </div>

        <div className="flex-1 p-6">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "staff" && renderStaffManagement()}
          {activeTab === "menu" && renderMenuManagement()}
          {activeTab === "tables" && renderTableManagement()}
        </div>
      </div>
    </div>
  )
}
