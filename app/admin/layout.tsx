"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import clsx from "clsx"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  const navItems = [
    { href: "/admin/overview", label: "Overview" },
    { href: "/admin/staff", label: "Staff" },
    { href: "/admin/menu", label: "Menu" },
    { href: "/admin/tables", label: "Tables" },
    { href: "/admin/reports", label: "Reports" },
  ]

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="relative flex flex-col w-64 bg-[var(--coffee-brown)] text-[var(--coffee-cream)] p-6 space-y-4 shadow-md">
        <h2 className="text-lg font-bold mb-6">Admin Dashboard</h2>

        <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "block px-3 py-2 rounded transition-colors",
                pathname === item.href
                  ? "bg-[var(--coffee-light)] text-[var(--coffee-brown)] font-semibold"
                  : "hover:bg-[var(--coffee-light)] hover:text-[var(--coffee-brown)]"
              )}
            >
              {item.label}
            </Link>
          ))}

          <Button
            className="mt-auto bg-[var(--coffee-cream)] text-[var(--coffee-brown)] hover:bg-[var(--coffee-light)] hover:text-[var(--coffee-brown)]"
            variant="outline"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8 bg-[var(--coffee-cream)] text-[var(--coffee-brown)]">
        {children}
      </main>
    </div>
  )
}
