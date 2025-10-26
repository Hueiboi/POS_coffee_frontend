"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePromotionList } from "@/hooks/use-promotion-list";
import { Loader2, Trash2, PlusCircle } from "lucide-react";
import { notify } from "@/lib/notify";

export default function PromotionManagement() {
  const { promotions, loading, createPromotion, deletePromotion } = usePromotionList();
  const [newPromo, setNewPromo] = useState({
    name: "",
    discount_percentage: "",
    start_date: "",
    end_date: "",
  });

  const handleAdd = async () => {
    if (!newPromo.name || !newPromo.discount_percentage) {
      notify.error("Please fill in all required fields");
      return;
    }
    await createPromotion({
      ...newPromo,
      discount_percentage: Number(newPromo.discount_percentage),
    });
    setNewPromo({ name: "", discount_percentage: "", start_date: "", end_date: "" });
  };

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> Promotion Management
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 mb-6">
          <Input
            placeholder="Promotion name"
            value={newPromo.name}
            onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })}
          />
          <Input
            placeholder="Discount (%)"
            type="number"
            value={newPromo.discount_percentage}
            onChange={(e) => setNewPromo({ ...newPromo, discount_percentage: e.target.value })}
          />
          <Input
            type="date"
            value={newPromo.start_date}
            onChange={(e) => setNewPromo({ ...newPromo, start_date: e.target.value })}
          />
          <Input
            type="date"
            value={newPromo.end_date}
            onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })}
          />
          <Button onClick={handleAdd} className="bg-coffee-brown hover:bg-coffee-brown/90">
            Add Promotion
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading promotions...
          </div>
        ) : (
          <div className="space-y-3">
            {promotions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No promotions found.</p>
            ) : (
              promotions.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border rounded-md p-2 hover:bg-accent/20"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.discount_percentage}% | {p.start_date} → {p.end_date}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deletePromotion(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
