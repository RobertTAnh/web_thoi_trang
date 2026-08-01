"use client";

import { useTransition } from "react";
import { removeCartItem, updateCartItem } from "@/app/actions/cart";

export function CartControls({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="mt-3 flex items-center gap-3">
      <div className="flex items-center border border-line">
        <button
          type="button"
          disabled={pending}
          className="px-2 py-1"
          onClick={() => start(() => updateCartItem(itemId, quantity - 1))}
        >
          −
        </button>
        <span className="min-w-8 text-center text-sm">{quantity}</span>
        <button
          type="button"
          disabled={pending}
          className="px-2 py-1"
          onClick={() => start(() => updateCartItem(itemId, quantity + 1))}
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={pending}
        className="text-xs text-muted underline"
        onClick={() => start(() => removeCartItem(itemId))}
      >
        Xóa
      </button>
    </div>
  );
}
