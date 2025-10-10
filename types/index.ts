// This file contains all TypeScript interfaces used across components

// Product interface - represents menu items
export interface Product {
  id: number
  name: string
  price: number
  category: string
  image?: string
  description?: string
}

// Order item interface - represents items in an order with customizations
export interface OrderItem extends Product {
  quantity: number
  size?: "S" | "M" | "L"
  sugar?: "No" | "Low" | "Normal" | "High"
  ice?: "No" | "Low" | "Normal" | "High"
  mood?: "A" | "B"
  notes?: string
}

// Table interface - represents restaurant tables
export interface Table {
  id: number
  table_number: string
  status: "available" | "occupied" | "reserved"
  capacity?: number
  name?: string // optional nếu backend không luôn trả
}


// User interface - represents authenticated users
export interface User {
  id: number
  username: string
  role: "admin" | "staff"
  email?: string
  staff_name?: string
}

// Order interface - represents complete orders
export interface Order {
  id: number
  order_code: string
  table_id: number
  order_type: "dine-in" | "takeaway"
  status: "pending" | "completed" | "cancelled"
  created_at?: string
  total_amount?: number
}

// Promotion interface - represents discount promotions
export interface Promotion {
  id: number
  name: string
  code: string
  type: "percentage" | "fixed"
  value: number
  min_order: number
  is_active: boolean
  description?: string
}

export interface InvoiceItem {
  name: string
  quantity: number
  unit_price: number
  total: number
}

export interface Invoice {
  id: number
  order_code: string
  table_number: string
  created_at: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  discount: number
  promotion_id?: string
  total: number
  payment_method: string
  staff_name: string
}
