"use client"

import { useState } from "react"
import  Overview  from "./components/overview"
import  StaffManagement  from "./components/staff-management"
import  MenuManagement  from "./components/menu-management"
import  TableManagement  from "./components/table-management"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />
      case "staff":
        return <StaffManagement />
      case "menu":
        return <MenuManagement />
      case "table":
        return <TableManagement />
      default:
        return <Overview />
    }
  }

  return (
    <div className="flex min-h-screen">
      

      {/* Nội dung */}
      <main className="flex-1 p-6">
        {renderContent()}
      </main>
    </div>
  )
}
