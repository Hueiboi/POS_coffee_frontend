"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/staff", label: "Staff" },
    { href: "/admin/menu", label: "Menu" },
    { href: "/admin/tables", label: "Tables" },
    { href: "/admin/reports", label: "Reports" },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h2 className="text-lg font-bold mb-6">Admin Dashboard</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "block px-3 py-2 rounded hover:bg-gray-700 transition",
                pathname === item.href && "bg-gray-800 font-semibold"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-gray-50 overflow-auto">{children}</main>
    </div>
  )
}
