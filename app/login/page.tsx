"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth-modal"


export default function LoginPage() {
  const router = useRouter()

    const handleAuthSuccess = (data: { access_token: string }) => {
    // decode token
    const payload = JSON.parse(atob(data.access_token.split(".")[1]))
    const user = {
      id: payload.user_id,
      username: payload.username,
      role: payload.role,
    }
    // lưu
    localStorage.setItem("token", data.access_token)
    localStorage.setItem("user", JSON.stringify(user))
    // redirect
    router.push(user.role === "admin" ? "/admin" : "/pos")
  }

  return <AuthModal isOpen={true} onAuthSuccess={handleAuthSuccess}/>
}
