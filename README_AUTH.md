
# POS Coffee — Auth Flow Documentation

## Vấn đề ban đầu
Trong hệ thống POS, luồng **đăng nhập / phân quyền / logout** bị rối loạn:
- Admin đăng nhập nhưng bị chuyển vào giao diện POS của staff.
- Logout không xóa state hoặc localStorage, reload vẫn tự login lại.
- Mỗi file (`pos-page.tsx`, `login/page.tsx`, `auth-modal.tsx`, `use-auth.ts`, `use-pos-store.ts`) đều xử lý auth riêng → khó kiểm soát.
- `api-client.ts` còn lỗi cú pháp khiến API fetch không hoạt động ổn định.

Hậu quả: dev sửa chỗ này hỏng chỗ kia, mất gần cả ngày mà flow vẫn sai vì không rõ "nước đang tắc ở ống nào".

---

## Nguyên nhân chính
1. **Auth logic phân tán**
   → Có 3 nơi cùng decode token và redirect (login page, pos page, modal).
   → Mỗi nơi lưu token / user khác nhau.

2. **State trùng lặp giữa `useAuth` và `usePOSStore`**
   → Khi logout ở store, localStorage chưa xoá → reload lại vẫn coi là login.

3. **`api-client.ts` bị lỗi cú pháp**
   → Làm crash request, khiến login API đôi lúc không phản hồi.

4. **Không check role khi restore session**
   → `pos-page.tsx` mặc định `setShowTableSelection(true)` dù user là admin.

---

## Giải pháp đã triển khai

### 1. `api-client.ts`
- Fix toàn bộ cú pháp fetch, merge header đúng chuẩn.
- Tự động đính kèm token từ localStorage.
- Khi gặp lỗi 401/403 → gọi API refresh token, nếu hết hạn thì logout.
  
➡️ Giúp các request ổn định và tự xử lý token hết hạn.

---

### 2. `use-auth.ts`
```ts
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  const login = useCallback(({ token, user }) => {
    setIsAuthenticated(true)
    setUser(user)
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    setUser(null)
    window.location.href = "/login"
  }, [])

  return { isAuthenticated, user, login, logout }
}
```

➡️ Là **nguồn chân lý duy nhất** (single source of truth) về trạng thái login.

---

### 3. `use-pos-store.ts`
- Thêm `login()` / `logout()` đồng bộ với localStorage.  
- Khi `logout` → xóa token + reset state (order, table, promotion).  

➡️ Đảm bảo logout thật sự reset toàn bộ POS state.

---

### 4. `AuthModal.tsx`
Giờ **tự đảm nhiệm toàn bộ login logic**:  
- Gọi API login.  
- Decode token → lấy role.  
- Lưu user/token qua `useAuth().login()`.  
- Redirect đúng role (`/admin` hoặc `/pos`).  

Không cần prop `onAuthSuccess` nữa:
```tsx
<AuthModal isOpen={true} />
```

➡️ Gọn, dễ bảo trì, không lặp logic.

---

### 5. `pos-page.tsx`
- Khi mở trang → đọc token + user trong localStorage.  
- Nếu có → restore session + redirect đúng role.  
- Nếu không có → hiển thị `AuthModal`.  

➡️ Giúp admin/staff đều vào đúng giao diện ngay cả khi reload.

---

### 6. `login/page.tsx`
Đơn giản hoá — chỉ render modal:
```tsx
export default function LoginPage() {
  return <AuthModal isOpen={true} />
}
```

=> Page `/login` giờ chỉ làm nhiệm vụ hiển thị UI login.

---

## Luồng hoạt động tổng thể

```mermaid
graph TD
A[User mở app] --> B{Có token + user trong localStorage?}
B -- Không --> C[Hiện AuthModal]
B -- Có --> D[Decode role]
D -- admin --> E[Redirect /admin]
D -- staff --> F[Redirect /pos]
C --> G[Đăng nhập]
G --> H[API /auth/login]
H --> I[Nhận access_token + role]
I --> J[useAuth().login()]
J --> K[Lưu token + user vào localStorage]
K --> L[Redirect theo role]
```

---

## Kết quả sau khi refactor

| Tình huống | Hành vi hiện tại |
|-------------|------------------|
| Staff login | Vào POS, chọn bàn |
| Admin login | Chuyển đến Admin Dashboard |
| Logout | Xoá token + user, quay lại modal |
| Reload trang | Giữ đúng giao diện theo role |
| Token hết hạn | Tự refresh, nếu fail thì logout |

---

## Kinh nghiệm rút ra

> 🔸 **Không nên để nhiều file xử lý login riêng lẻ.**  
> Dồn toàn bộ vào 1 hook (`useAuth`) và 1 component chính (`AuthModal`).

> 🔸 **Mỗi luồng logic nên có 1 nơi điều hướng rõ ràng.**  
> Trang POS xử lý restore session, còn modal lo login.

> 🔸 **Logout phải luôn clear cả localStorage + state.**  
> Nếu chỉ clear state mà không xóa token, reload sẽ tự login lại.

> 🔸 **Giữ code theo “ống dẫn nước” logic.**  
> Modal → Hook → Store → Redirect → View  
> Khi bug xuất hiện, chỉ cần kiểm tra từng khúc, không phải mò toàn bộ hệ thống.

