"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

export interface Menu {
  id: number
  name: string
  price: number
  stock_quantity: number
  category?: string
  status?: "available" | "unavailable"
}

export default function MenuManagement() {
    const [menu, setMenu] = React.useState<Menu[]>([]);
    const [showAddMenu, setShowAddMenu] = React.useState(false);

    return(
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
}