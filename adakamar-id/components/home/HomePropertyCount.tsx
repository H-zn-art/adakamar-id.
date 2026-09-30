"use client";

import { useState, useEffect } from "react";
import { propertiesApi } from "@/lib/api";

/**
 * Fetches the real total property count from the backend and
 * renders it inline as "Lihat Semua (N)".
 */
export default function HomePropertyCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    propertiesApi
      .list({ limit: 1, page: 1 })
      .then((res) => {
        const total = res?.meta?.total ?? res?.meta?.totalItems ?? null;
        if (typeof total === "number") {
          setCount(total);
        }
      })
      .catch(() => {
        // Silently fail — will show static text
      });
  }, []);

  return (
    <span>
      {count !== null ? `Lihat Semua (${count})` : "Lihat Semua"}
    </span>
  );
}
