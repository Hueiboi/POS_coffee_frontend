"use client"

import { AdminDashboard } from "@/components/admin-dashboard";
import React from "react";

export default function AdminPage() {
    const fakeUser = {username: "adminPOS", role: "admin"}
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <AdminDashboard user={fakeUser} onBack={() => console.log("Back button clicked")}/>
    </div>
  )
}
