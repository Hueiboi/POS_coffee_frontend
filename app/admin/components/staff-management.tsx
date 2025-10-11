"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

export interface Staff {
  id: number
  username: string
  role: "staff" | "admin"
  email?: string
}

export default function StaffManagement() {
    const [staff, setStaff] = React.useState<Staff[]>([]);
    const [showAddStaff, setShowAddStaff] = React.useState(false);

    return(
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
                          <h4 className="font-semibold">{member.username}</h4>
                          <p className="text-sm text-muted-foreground">@{member.username}</p>
                          <Badge variant="outline" className="mt-1">
                            {member.role}
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