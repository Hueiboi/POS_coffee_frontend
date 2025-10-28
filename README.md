# POS Coffee Shop System

Hệ thống POS (Point of Sale) cho quán cà phê được xây dựng với Next.js, React, và TailwindCSS.

## Tính năng chính

- 🔐 **Đăng nhập nhân viên** với JWT authentication
- 🪑 **Quản lý bàn** - chọn bàn, theo dõi trạng thái (available/occupied/reserved)
- 📋 **Menu sản phẩm** - hiển thị danh mục đồ uống, thức ăn với hình ảnh
- 🛒 **Đặt hàng** - thêm món, tùy chỉnh size/topping, tính tổng tiền
- 💳 **Thanh toán** - hỗ trợ tiền mặt, thẻ, chuyển khoản
- 🧾 **In hóa đơn** - xuất hóa đơn chi tiết sau thanh toán
- 👨‍💼 **Admin Dashboard** - quản lý nhân viên, menu, bàn, báo cáo
- 📊 **Báo cáo** - thống kê doanh thu theo ngày/tuần
- 🎁 **Khuyến mãi** - áp dụng discount cho đơn hàng
- 📜 **Lịch sử đơn hàng** - tra cứu đơn hàng đã hoàn thành

## Cài đặt và chạy local

### 1. Clone project và cài đặt dependencies

\`\`\`bash
# Clone project từ v0 hoặc GitHub
git clone <repository-url>
cd pos-coffee

# Cài đặt dependencies
npm install
# hoặc
yarn install
# hoặc
pnpm install
\`\`\`

### 2. Cấu hình Backend API

Project này cần kết nối với backend API. Tạo file `.env.local`:

\`\`\`env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Hoặc nếu backend chạy trên port khác
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
\`\`\`

### 3. Backend API Endpoints cần thiết

Backend cần cung cấp các endpoints sau:

#### Authentication
- `POST /auth/login` - Đăng nhập (username, password)

#### Tables Management
- `GET /tables` - Lấy danh sách bàn
- `PUT /tables/:id/status` - Cập nhật trạng thái bàn

#### Menu Management
- `GET /menu` - Lấy danh sách sản phẩm
- `POST /menu` - Thêm sản phẩm mới (admin)
- `PUT /menu/:id` - Cập nhật sản phẩm (admin)
- `DELETE /menu/:id` - Xóa sản phẩm (admin)

#### Orders Management
- `POST /orders` - Tạo đơn hàng mới
- `POST /orders/:id/items` - Thêm món vào đơn
- `POST /orders/:id/pay` - Thanh toán đơn hàng
- `GET /orders/history` - Lịch sử đơn hàng

#### Invoices
- `GET /payments/invoices/:order_id` - Lấy hóa đơn chi tiết

#### Staff Management (Admin)
- `GET /staff` - Danh sách nhân viên
- `POST /staff` - Thêm nhân viên mới
- `PUT /staff/:id` - Cập nhật thông tin nhân viên

#### Reports (Admin)
- `GET /reports/daily` - Báo cáo theo ngày
- `GET /reports/weekly` - Báo cáo theo tuần

### 4. Chạy development server

\`\`\`bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
\`\`\`

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

### 5. Demo Mode

Nếu backend chưa sẵn sàng, ứng dụng sẽ tự động chuyển sang **Demo Mode** với:
- Mock data cho menu, bàn, đơn hàng
- Simulation các API calls
- Đầy đủ tính năng để test UI/UX

## Cấu trúc project

\`\`\`
pos-coffee/
├── app/
│   ├── globals.css          # Global styles với TailwindCSS
│   ├── layout.tsx           # Root layout
│   └── page.jsx            # Main POS interface
├── components/
│   ├── ui/                 # Shadcn/ui components
│   ├── auth-modal.jsx      # Modal đăng nhập
│   ├── table-selection.jsx # Component chọn bàn
│   ├── product-menu.jsx    # Menu sản phẩm
│   ├── order-summary.jsx   # Tóm tắt đơn hàng & thanh toán
│   ├── admin-dashboard.jsx # Dashboard quản trị
│   ├── order-history.jsx   # Lịch sử đơn hàng
│   └── promotions-management.jsx # Quản lý khuyến mãi
├── lib/
│   └── utils.ts           # Utility functions
└── public/               # Static assets (images)
\`\`\`

## Luồng hoạt động

1. **Đăng nhập** → Nhập username/password
2. **Chọn bàn** → Chọn bàn trống cho khách dine-in
3. **Đặt hàng** → Thêm món từ menu, tùy chỉnh size/topping
4. **Thanh toán** → Chọn phương thức thanh toán, xác nhận
5. **In hóa đơn** → Hiển thị hóa đơn chi tiết, cập nhật trạng thái bàn

## Troubleshooting

### Lỗi "Cannot find module '@/app/page'"

Đảm bảo:
1. File `tsconfig.json` có cấu hình path alias:
\`\`\`json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
\`\`\`

2. Restart TypeScript server trong VS Code:
   - Ctrl/Cmd + Shift + P
   - Chọn "TypeScript: Restart TS Server"

3. Xóa `.next` folder và restart:
\`\`\`bash
rm -rf .next
npm run dev
\`\`\`

### API Connection Issues

Nếu gặp lỗi "Unexpected token '<', "<!DOCTYPE"...":
- Kiểm tra backend có đang chạy không
- Xác nhận `NEXT_PUBLIC_API_BASE_URL` trong `.env.local`
- Ứng dụng sẽ tự động chuyển sang Demo Mode nếu không kết nối được API

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: TailwindCSS v4, Shadcn/ui
- **Icons**: Lucide React
- **State Management**: React useState/useEffect
- **HTTP Client**: Fetch API
- **Authentication**: JWT tokens trong localStorage

## Đóng góp

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Development Philosophy & Project Architecture
## Mục tiêu
Dự án này không chỉ được xây để chạy, mà để rèn tư duy kiến trúc hệ thống cho developer trong thời đại AI có thể sinh code nhanh hơn con người.
AI có thể viết code, nhưng chỉ con người mới hiểu vì sao code đó được viết như vậy.
Triết lý cốt lõi của dự án:
“Không phải để AI thay thế lập trình viên, mà để AI làm tay thợ — còn mình là người kiến trúc.”

## Kiến trúc tổng thể
Dự án được chia theo 3 tầng chính, giúp tách biệt rõ ràng giữa UI, logic, và data:
Layer	Vai trò chính	Ví dụ trong project
1. UI / Components	Hiển thị, nhận thao tác người dùng	OrderSummary, ProductList, PromotionsManagement
2. Logic / Hooks	Xử lý nghiệp vụ, tính toán, state	usePOSStore, useOrderCalculations, usePromotion
3. Data / API Layer	Giao tiếp với backend server	useAPI, api-client.ts
Luồng dữ liệu đi theo hướng:
UI → Hooks → API → Backend
Và chỉ một chiều duy nhất, đảm bảo tránh vòng lặp state.

## Triết lý thiết kế
1. Single Source of Truth
Toàn bộ dữ liệu dùng chung (ví dụ orderItems, appliedPromotion, user)
được quản lý trong store duy nhất (usePOSStore).
→ Giúp tránh sai lệch giữa các component hiển thị cùng dữ liệu.
2. Logic nằm trong Hook, không nằm trong UI
Component chỉ render — không tính toán, không fetch, không validate.
→ Tách useOrderCalculations, usePromotion ra riêng giúp UI nhẹ, dễ test, dễ thay đổi.
3. API thuần tách khỏi React
api-client.ts là module thuần JS, không dùng hook,
nên có thể được gọi từ bất kỳ hook hoặc context nào mà không gây vòng lặp.
→ Đây là cách “gỡ rối” triệt để vấn đề import chéo mà nhiều dự án gặp phải.
4. Composable & Reusable Hooks
Mỗi hook thực hiện một trách nhiệm duy nhất:
usePOSStore: quản lý state tổng thể
usePromotion: xử lý logic khuyến mãi
useOrderCalculations: tính toán tổng, thuế, giảm giá
→ Các hook có thể kết hợp lại (composed) mà không chồng chéo nhau.

## Luồng dữ liệu POS (tổng quan)
1. User đăng nhập → usePOSStore.login()
2. Chọn bàn & thêm món → cập nhật orderItems
3. Áp dụng khuyến mãi → setAppliedPromotion(promo)
4. Hook useOrderCalculations tự động tính subtotal, discount, total
5. OrderSummary hiển thị số liệu đã tính sẵn
6. Thanh toán → gọi useAPI().post("/orders") gửi order lên server
7. Tất cả dữ liệu hiển thị trên giao diện đều bắt nguồn từ store duy nhất
và được cập nhật qua hook, đảm bảo UI luôn đồng bộ logic.

## Tư duy khi mở rộng hoặc làm dự án mới
- Khi thêm tính năng mới	-> Cách tư duy đúng
- Cần thêm “voucher”, “coupon” ->	Tạo hook riêng (useVoucher), không sửa usePromotion
- Muốn thêm phân quyền (admin/staff) ->	Mở rộng logic trong usePOSStore, không đụng UI
- Cần thay đổi backend API ->	Sửa api-client.ts, không cần chạm logic hoặc component
- Gặp lỗi logic ->	Debug ở hook, không cần vào UI
=> “Nếu hệ thống dễ debug, dễ mở rộng — nghĩa là bạn đang thiết kế đúng.”

## Vấn đề
### Điều hướng trong UI với usePathname, useRouter và redirect
🔹 usePathname
- Dùng để lấy đường dẫn hiện tại.
- Giúp xác định tab nào đang được chọn để highlight trong sidebar.
🔹 useRouter + router.push
- Dùng để điều hướng người dùng khi thực hiện hành động (ví dụ: logout).
- router.push("/") sẽ chuyển về trang chủ sau khi xóa token.
🔹 redirect (server-side)
- Dùng trong AdminIndex để chuyển hướng ngay khi người dùng truy cập /admin.
- Giúp điều hướng thẳng đến /admin/overview mà không cần hiển thị gì.
🔹 Giao diện sidebar
- Hiển thị các tab quản trị như Overview, Staff, Menu, Tables, Reports.
- Tab đang chọn được highlight dựa trên pathname.
🔹 Bảo mật & UX
- Khi logout, token bị xóa khỏi localStorage và người dùng được chuyển về trang chủ.
- Có thể kết hợp thêm kiểm tra token để chặn truy cập trái phép từ layout hoặc middleware.

### Lỗi free table do chưa đồng bộ route
- Thiếu route riêng cho FreeTable

### Lỗi render bill cũ khi ấn printBill mới
* Khi người dùng ấn Print Bill, đôi khi:
Bill in ra lại là hóa đơn cũ (không phải bill mới nhất vừa thanh toán),
Hoặc phải chờ vài phút sau bill mới xuất hiện chính xác.
Điều này xảy ra ngay cả khi dữ liệu trong database đã đúng.

1. Nguyên nhân gốc rễ
- React render không đồng bộ (asynchronous).
Khi bạn gọi:
setInvoice(newInvoice);
window.print();
→ React chưa kịp cập nhật DOM với dữ liệu mới (newInvoice).
→ Lệnh window.print() in snapshot DOM cũ (bill trước đó).
- Tình huống này phổ biến khi:
Giao diện sử dụng Modal/Dialog để hiển thị hóa đơn.
setState được gọi ngay trước window.print().
Có animation hoặc transition khiến DOM chưa render kịp.

2. Giải pháp: Chờ UI “paint” xong rồi mới in
Thêm đoạn helper sau:
```jsx
// utils/waitForPaint.ts
export const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
    // fallback nếu browser không hỗ trợ requestAnimationFrame đúng
    setTimeout(() => resolve(), 500);
  });
```

Sau đó, dùng trong file invoice-modal.tsx hoặc component in bill:
```jsx
import { waitForPaint } from "@/utils/waitForPaint";
const handleInternalPrint = async () => {
  if (printing || !invoice) return;

  setPrinting(true);
  try {
    // Đợi React render + browser paint xong nội dung mới nhất
    await waitForPaint();

    // Nếu cha truyền handlePrint riêng thì gọi, nếu không thì in toàn trang
    if (typeof handlePrint === "function") {
      handlePrint();
    } else {
      window.print();
    }
  } finally {
    setPrinting(false);
  }
};
```
3. Giải thích hoạt động
Bước	Cơ chế	Ý nghĩa
requestAnimationFrame	Đợi browser render 1 frame tiếp theo	Cho phép DOM cập nhật state mới
Gọi 2 lần liên tiếp	Đảm bảo React commit + browser paint hoàn tất	Tránh in nội dung chưa vẽ xong
setTimeout(500)	Fallback cho browser cũ	Đảm bảo không bị treo

=> Kết quả:
- Bill được in ngay lập tức và chính xác, không còn in bill cũ hoặc chậm vài phút nữa.
- Gợi ý mở rộng (tái sử dụng)

Bạn có thể tạo custom hook usePrint để dùng lại ở nhiều nơi:
```jsx
import { useState } from "react";
import { waitForPaint } from "@/utils/waitForPaint";

export function usePrint() {
  const [printing, setPrinting] = useState(false);

  const printElement = async (onBeforePrint?: () => void) => {
    if (printing) return;
    setPrinting(true);

    try {
      if (onBeforePrint) onBeforePrint();
      await waitForPaint();
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  return { printElement, printing };
}
//Sau đó chỉ cần gọi:
const { printElement } = usePrint();
await printElement(() => setInvoice(newData));
```
4. Kết luận
Nguyên nhân:
window.print() được gọi trước khi React cập nhật DOM mới → in dữ liệu cũ.
Giải pháp:
Thêm hàm waitForPaint() để đảm bảo UI render xong trước khi in.
Kết quả:
Hóa đơn in luôn đúng, không delay, không lệch dữ liệu giữa order và payment.

### Lỗi Auth, khá nghiêm trọng vì flow dài
- [README-AUTH](./README_AUTH.md)

### Hiểu thêm về cơ chế truyền trong REACT
- Trong React, component con không import trực tiếp hàm của cha,
mà cha truyền xuống con qua props.
```jsx
// Parent
function POSPage() {
  const handlePrintAndPay = (method, total) => console.log("Paying:", method, total)

  return <OrderSummary onPrintBill={handlePrintAndPay} />
}

// Child
function OrderSummary({ onPrintBill }) {
  return (
    <button onClick={() => onPrintBill("cash", 50000)}>
      Print invoice
    </button>
  )
}
```