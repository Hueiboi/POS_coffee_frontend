import { useState, useEffect } from "react";
import { useAPI } from "@/hooks/use-api";
import { Promotion } from "@/hooks/use-promotion";
import { notify } from "@/lib/notify";

export function usePromotionList() {
  const { get, post, del } = useAPI();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await get<{ status: string; data: Promotion[] }>("/promotions");
      setPromotions(res?.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch promotions:", err);
      notify.error("Failed to fetch promotions");
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async (promoData: Omit<Promotion, "id">) => {
    try {
      await post("/promotions", promoData);
      notify.success("Promotion added successfully!");
      fetchPromotions();
    } catch (err) {
      console.error("❌ Create promotion failed:", err);
      notify.error("Failed to create promotion");
    }
  };

  const deletePromotion = async (id: number) => {
    try {
      await del(`/promotions/${id}`);
      notify.success("Promotion deleted");
      fetchPromotions();
    } catch (err) {
      console.error("❌ Delete promotion failed:", err);
      notify.error("Failed to delete promotion");
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return { promotions, loading, fetchPromotions, createPromotion, deletePromotion };
}
