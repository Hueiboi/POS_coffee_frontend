"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth-modal"

export default function LoginPage() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        if (payload.role === "admin") router.push("/admin")
        else router.push("/pos")
      } catch (err) {
        console.warn("Invalid token:", err)
      }
    }
  }, [router])

  // Hàm này nhận callback khi login thành công
  const handleAuthSuccess = (data: { access_token: string }) => {
    setIsOpen(false) // đóng modal sau khi login
    const payload = JSON.parse(atob(data.access_token.split(".")[1]))
    if (payload.role === "admin") router.push("/admin")
    else router.push("/pos")
  }

  return (
    <AuthModal
      isOpen={isOpen}
      onAuthSuccess={handleAuthSuccess}
    />
  )
}

