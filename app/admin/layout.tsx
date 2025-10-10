"use client"

import React from "react"
import Link from "next/link"

export const metadata = {
  title: 'Admin Panel',
  description: 'Admin panel for managing the application',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>
        <nav className="space-y-3">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/reports">Reports</Link>
          <Link href="/admin/menu">Menu</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
