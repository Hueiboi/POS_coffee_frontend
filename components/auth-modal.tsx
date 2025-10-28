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
import { useRouter } from "next/navigation"
import { useAPI } from "@/hooks/use-api"
import { notify } from "@/lib/notify"

interface AuthModalProps {
  isOpen: boolean
  onAuthSuccess: (
    data: { access_token: string, user: {username: string, role: string}}
  ) => void
}

interface LoginResponse {
  status: string;
  msg: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

export function AuthModal({ isOpen, onAuthSuccess }: AuthModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { post } = useAPI();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await post<LoginResponse>("/auth/login", { username, password });

      if (res?.data?.access_token) {
        const { access_token, refresh_token } = res.data;

        // Lưu token
        localStorage.setItem("token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        
        // Giải mã token để lấy user
        const payload = JSON.parse(atob(access_token.split(".")[1]));
        const usernameFromToken = payload.username || username;
        const role = payload.role ;
        
        // Lưu user vào localStorage để trang POS đọc lại
        const userObj = { username: usernameFromToken, role };
        localStorage.setItem("user", JSON.stringify(userObj));

        // Gọi callback để LoginPage nhận biết login xong
        onAuthSuccess({ access_token, user: userObj });

        notify.success("Login successful!");
      } else {
        notify.error("Invalid response from server");
      }
    } catch (err: any) {
      console.error(err);
      notify.error("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };


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
      </DialogContent>
    </Dialog>
  )
}
