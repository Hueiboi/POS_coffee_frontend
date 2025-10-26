"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";

export default function LoginPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  // Khi mở trang login, nếu có token hợp lệ thì tự chuyển hướng
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.role || JSON.parse(user).role;

        if (role === "admin") router.push("/admin");
        else router.push("/pos");
      } catch (err) {
        console.warn("Invalid token:", err);
      }
    }
  }, [router]);

  // Khi login xong
  const handleAuthSuccess = (data: { access_token: string }) => {
    setIsOpen(false); // đóng modal

    try {
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      const role = payload.role;
      const user = {
        id: payload.user_id,
        username: payload.username,
        role: role,
      };

      console.log("🔐 Đăng nhập thành công với vai trò:", role);

      // Lưu token và user mới vào localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect theo role mới
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/pos");
      }
    } catch (err) {
      console.error("Invalid token on login success:", err);
      // Optional: clear localStorage nếu token lỗi
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onAuthSuccess={handleAuthSuccess}
    />
  );
}
