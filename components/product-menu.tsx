"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAPI } from "@/hooks/use-api"
import { cn } from "@/lib/utils"

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock_quantity: number
}

interface ProductMenuProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onAddToOrder: (item: Omit<Product, "stock_quantity"> & { quantity?: number }) => void
}

const fallbackProducts: Product[] = [
  { id: 1, name: "Caramel Frappuccino", price: 3.95, category: "Coffee", stock_quantity: 10 },
  { id: 2, name: "Chocolate Frappuccino", price: 4.51, category: "Coffee", stock_quantity: 8 },
  { id: 3, name: "Coffee Latte", price: 4.79, category: "Coffee", stock_quantity: 12 },
  { id: 4, name: "Peppermint Macchiato", price: 5.34, category: "Coffee", stock_quantity: 5 },
  { id: 5, name: "Orange Juice", price: 2.5, category: "Juice", stock_quantity: 15 },
  { id: 6, name: "Apple Juice", price: 2.3, category: "Juice", stock_quantity: 10 },
  { id: 7, name: "Green Tea", price: 2.0, category: "Tea", stock_quantity: 20 },
  { id: 8, name: "Croissant", price: 3.0, category: "Snack", stock_quantity: 6 },
]

const categories = ["All", "Coffee", "Tea", "Juice", "Snack"]

export function ProductMenu({ selectedCategory, onCategoryChange, onAddToOrder }: ProductMenuProps) {
  const [products, setProducts] = useState<Product[]>([])
  const { get, loading, error } = useAPI()

  const filteredProducts = useMemo(() => {
    return selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory)
  }, [products, selectedCategory])

  // Ghi nhớ hàm fetch sản phẩm theo category, dùng trong useEffect để tránh gọi lại không cần thiết
  const fetchProducts = useCallback(async () => {
    const endpoint = selectedCategory === "All" ? "/menu" : `/menu?category=${selectedCategory}`
    const res: { data: Product[] } | null = await get<{ data: Product[] }>(endpoint)

    if (res && Array.isArray(res.data)) {
      setProducts(res.data)
    } else {
      // Use fallback data
      const fallbackFiltered =
        selectedCategory === "All" ? fallbackProducts : fallbackProducts.filter((p) => p.category === selectedCategory)
      setProducts(fallbackFiltered)
    }
  }, [selectedCategory, get])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Ghi nhớ hàm thêm sản phẩm vào đơn hàng, tránh tạo lại mỗi lần render
  const handleAddToOrder = useCallback(
    (product: Product) => {
      onAddToOrder({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: 1,
      })
    },
    [onAddToOrder],
  )

  return (
    <div className="flex-1 p-6">
      {/* Category Selection */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Choose Category</h2>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => onCategoryChange(category)}
              className={cn("rounded-full transition-all duration-200", "hover:scale-105 active:scale-95")}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-foreground">
          {selectedCategory === "All" ? "All Items" : `${selectedCategory} Menu`}
        </h3>
        {error && (
          <p className="text-sm text-orange-600 mt-2 animate-pulse">⚠️ Backend not connected - showing demo data</p>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <div className="overflow-y-auto h-[calc(100vh-250px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  "hover:shadow-lg hover:-translate-y-1",
                  "group cursor-pointer",
                )}
                onClick={() => product.stock_quantity > 0 && handleAddToOrder(product)}
              >
                <div className="aspect-square bg-gradient-to-br from-coffee-light to-coffee-cream flex items-center justify-center">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                    {product.category === "Coffee"
                      ? "☕"
                      : product.category === "Tea"
                        ? "🍵"
                        : product.category === "Juice"
                          ? "🧃"
                          : "🥐"}
                  </span>
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <Badge variant="secondary" className="font-bold">
                      ${Number(product.price).toFixed(2)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {product.category} • Stock: {product.stock_quantity}
                  </p>

                  <Button
                    className={cn(
                      "w-full transition-all duration-200",
                      product.stock_quantity === 0 && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={product.stock_quantity === 0}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToOrder(product)
                    }}
                  >
                    {product.stock_quantity === 0 ? "Out of Stock" : "Add to Order"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
