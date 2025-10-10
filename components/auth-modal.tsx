"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthModalProps {
  isOpen: boolean
  onAuthSuccess: (data: { access_token: string }) => void
}

export function AuthModal({ isOpen, onAuthSuccess }: AuthModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError("")

  try {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/api"
        : "https://your-production-domain.com" // nên có URL rõ ràng

    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    console.log("[v0] Login response status:", response.status)

    const data = await response.json()

    if (!response.ok) {
      const message =
        data?.message || "Failed to sign in. Please check your credentials."
      setError(message)
      return
    }

    const accessToken = data?.data?.access_token

    if (!accessToken) {
      throw new Error("No access token in response")
    }

    // Lưu token và user tạm
    localStorage.setItem("token", accessToken)
    localStorage.setItem(
      "user",
      JSON.stringify({
        username,
        role: username.toLowerCase().includes("admin") ? "admin" : "staff",
      }),
    )

    console.log("[v0] Login successful:", accessToken)
    onAuthSuccess({ access_token: accessToken })
  } catch (error: any) {
    console.error("[v0] Login error:", error)

    const ALLOW_DEMO_LOGIN = false

    if (ALLOW_DEMO_LOGIN) {
      console.log("[v0] Using demo mode login")

      const mockToken = "demo-token-" + Date.now()

      localStorage.setItem("token", mockToken)
      localStorage.setItem(
        "user",
        JSON.stringify({
          username,
          role: username.toLowerCase().includes("admin") ? "admin" : "staff",
          id: Date.now(),
        }),
      )

      onAuthSuccess({ access_token: mockToken })
    } else {
      setError("Unable to login. Please check your credentials.")
    }
  } finally {
    setIsLoading(false) // luôn reset loading
  }
}

  return (
    <Dialog open={isOpen}>
      <DialogContent className={cn("sm:max-w-md", "animate-in fade-in-0 zoom-in-95 duration-200")}>
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-coffee-brown to-coffee-light rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">☕</span>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">Welcome Back</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Please sign in to access the POS system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className={cn(
                "transition-all duration-200",
                "focus:ring-2 focus:ring-coffee-brown focus:border-transparent",
              )}
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={cn(
                  "pr-10 transition-all duration-200",
                  "focus:ring-2 focus:ring-coffee-brown focus:border-transparent",
                )}
                required
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className={cn(
              "w-full bg-coffee-brown hover:bg-coffee-brown/90",
              "transition-all duration-200 hover:scale-105 active:scale-95",
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <Alert className="bg-coffee-cream border-coffee-light">
          <AlertCircle className="h-4 w-4 text-coffee-brown" />
          <AlertDescription className="text-coffee-brown text-xs">
            <strong>Demo Mode:</strong> Enter any username and password to continue. Use "admin" in username for admin
            access.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  )
}
