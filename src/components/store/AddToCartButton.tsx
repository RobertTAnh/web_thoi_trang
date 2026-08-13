"use client";

import { useTransition } from "react";
import { addToCart } from "@/app/actions/cart";

export function AddToCartButton({
  variantId,
  quantity = 1,
  className,
  label = "Thêm vào giỏ",
  onAdded,
}: {
  variantId: string;
  quantity?: number;
  className?: string;
  label?: string;
  onAdded?: (quantity: number) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || !variantId}
      className={className}
      onClick={() => {
        startTransition(async () => {
          await addToCart(variantId, quantity);
          onAdded?.(quantity);
        });
      }}
    >
      {pending ? "Đang thêm..." : label}
    </button>
  );
}
