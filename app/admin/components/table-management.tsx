"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface Table {
  id: number
  table_number: string
  capacity: number
  status: "available" | "occupied" | "reserved"
}

export default function TableManagement() {
    const [tables, setTables] = React.useState<Table[]>([]);
    const [showAddTable, setShowAddTable] = React.useState(false);

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
}