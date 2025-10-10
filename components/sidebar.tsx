"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, History, Tag, LogOut, Users, Shield, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"

interface User {
  username: string
  role: string
}

interface Table {
  id: number
  table_number: string
  status: "available" | "occupied" | "reserved"
}

interface SidebarProps {
  user: User | null
  selectedTable: Table | null
  onChangeTable: () => void
  onLogout: () => void
  onNavigate: (view: string) => void
  currentView: string
}

export function Sidebar({ user, selectedTable, onChangeTable, onLogout, onNavigate, currentView }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: "POS System", id: "pos", active: currentView === "pos" },
    { icon: History, label: "Order History", id: "history", active: currentView === "history" },
    { icon: Tag, label: "Promotions", id: "promotions", active: currentView === "promotions" },
  ]

  if (user?.role === "admin") {
    menuItems.push({ icon: Shield, label: "Admin Dashboard", id: "admin", active: currentView === "admin" })
  }

  return (
    <TooltipProvider>
      <div
        className={cn("w-20 bg-card border-r flex flex-col items-center py-6", "shadow-sm transition-all duration-200")}
      >
        {/* Logo */}
        <div className="mb-8">
          <div
            className={cn(
              "w-12 h-12 bg-gradient-to-br from-coffee-brown to-coffee-light rounded-xl",
              "flex items-center justify-center shadow-md",
              "transition-all duration-200 hover:scale-105",
            )}
          >
            <Coffee className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-center flex-1 space-y-3">
          {menuItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={item.active ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-12 h-12 p-0 relative",
                    "transition-all duration-200 hover:scale-105 active:scale-95",
                    item.active && "bg-coffee-brown hover:bg-coffee-brown/90 shadow-md",
                    !item.active && "hover:bg-muted",
                  )}
                  onClick={() => onNavigate(item.id)}
                >
                  <item.icon className={cn("h-5 w-5", item.active ? "text-white" : "text-muted-foreground")} />
                  {item.active && (
                    <div className="absolute -right-1 -top-1 w-3 h-3 bg-coffee-light rounded-full animate-pulse" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Table Info */}
        {selectedTable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-12 h-12 p-0 mb-3 relative",
                  "transition-all duration-200 hover:scale-105 active:scale-95",
                )}
                onClick={onChangeTable}
              >
                <Users className="h-5 w-5 text-muted-foreground" />
                <Badge
                  variant={selectedTable.status === "available" ? "secondary" : "destructive"}
                  className="absolute -top-1 -right-1 text-xs px-1 min-w-[16px] h-4"
                >
                  {selectedTable.table_number}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>
                Table {selectedTable.table_number} - {selectedTable.status}
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* User & Logout */}
        <div className="space-y-2">
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "w-8 h-8 bg-muted rounded-full flex items-center justify-center",
                    "text-xs font-medium text-muted-foreground",
                  )}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>
                  {user.username} ({user.role})
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-12 h-12 p-0",
                  "transition-all duration-200 hover:scale-105 active:scale-95",
                  "hover:bg-destructive hover:text-destructive-foreground",
                )}
                onClick={onLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
