"use client";

import { useCallback, useEffect, useState } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

let listeners: ((items: ToastItem[]) => void)[] = [];
let store: ToastItem[] = [];
let counter = 0;

function notify() {
  for (const l of listeners) l(store);
}

export const toast = {
  push(message: string, variant: ToastVariant = "info") {
    const id = ++counter;
    store = [...store, { id, message, variant }];
    notify();
    setTimeout(() => {
      store = store.filter((t) => t.id !== id);
      notify();
    }, 3000);
  },
  success(message: string) {
    this.push(message, "success");
  },
  error(message: string) {
    this.push(message, "error");
  },
  info(message: string) {
    this.push(message, "info");
  },
};

export function useToasts() {
  const [items, setItems] = useState<ToastItem[]>(store);

  useEffect(() => {
    const listener = (next: ToastItem[]) => setItems(next);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    store = store.filter((t) => t.id !== id);
    notify();
  }, []);

  return { items, dismiss };
}
