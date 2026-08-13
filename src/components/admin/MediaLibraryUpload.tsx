"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadProductImagesAction } from "@/app/admin/actions";

export function MediaLibraryUpload() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <label className="inline-flex cursor-pointer rounded bg-[#ee4d2d] px-5 py-2.5 font-bold text-white">
        {pending ? "Đang tải..." : "+ Tải ảnh lên"}
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={pending}
          className="sr-only"
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            event.target.value = "";
            if (!files.length) return;
            startTransition(async () => {
              const data = new FormData();
              files.forEach((file) => data.append("images", file));
              const result = await uploadProductImagesAction(data);
              setMessage(result.message);
              if (result.ok) router.refresh();
            });
          }}
        />
      </label>
      {message && <p className="mt-2 text-xs text-muted">{message}</p>}
    </div>
  );
}
