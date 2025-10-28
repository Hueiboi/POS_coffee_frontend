import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Invoice, InvoiceItem, InvoiceOrder} from "@/components/invoice-modal"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function transformInvoiceData(raw: any): Invoice {
  // Chuẩn hóa dữ liệu
  const order = raw?.order ?? raw?.data?.order ?? {};
  const itemsRaw = raw?.items ?? raw?.data?.items ?? [];

  // Chuẩn hóa thông tin
  const items: InvoiceItem[] = Array.isArray(itemsRaw)
    ? itemsRaw.map((item: any) => {
        const price = Number(item.price ?? item.unit_price ?? 0);
        const qty = Number(item.quantity ?? 1);
        return {
          name: item.menu_name ?? item.name ?? "Unnamed item",
          quantity: qty,
          unit_price: price,
          total_amount: price * qty,
        };
      })
    : [];
  // Tính toán
  const subtotal = items.reduce((sum, item) => sum + item.total_amount, 0);
  const discountPercentage =
    Number(order.discount_percentage) ||
    Number(order.promotion_discount) ||
    Number(order.promotion?.discount_percentage) ||
    0;
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);

  const taxable = subtotal - discountAmount;
  const tax = Math.round(taxable * 0.1);
  const total = taxable + tax;
  
  // Chuẩn hóa item
  const invoiceOrder: InvoiceOrder = {
    id: order.id ?? 0,
    order_code: order.order_code ?? "N/A",
    table_number: order.table_number ?? "—",
    created_at: order.created_at ?? new Date().toISOString(),
    total_amount: total ?? order.total_amount ?? subtotal,
    status: order.status ?? "completed",
    promotion_id: order.promotion_id ?? null,
    discount_percentage: discountPercentage,
    payment_method: order.payment_method ?? "—",
    created_by:
      order.staff_name ||
      order.created_by ||
      order.processed_by ||
      order.user_name ||
      "Unknown",
  };
  // Trả về
  return {
    order: invoiceOrder,
    items,
    subtotal,
    discountAmount,
    discountPercentage,
    tax,
    total,
  } as Invoice;
}

