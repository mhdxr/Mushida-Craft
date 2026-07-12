"use client";

import { useCallback, useEffect, useState } from "react";
import { localProductRepository } from "@/lib/product-store";
import type { Product } from "@/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const list = await localProductRepository.list();
    setProducts(list);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: Omit<Product, "id" | "createdAt">) => {
      await localProductRepository.create(input);
      await refresh();
    },
    [refresh],
  );

  const update = useCallback(
    async (id: string, input: Partial<Product>) => {
      await localProductRepository.update(id, input);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await localProductRepository.remove(id);
      await refresh();
    },
    [refresh],
  );

  const reset = useCallback(async () => {
    await localProductRepository.reset();
    await refresh();
  }, [refresh]);

  return { products, isLoading, refresh, create, update, remove, reset };
}
