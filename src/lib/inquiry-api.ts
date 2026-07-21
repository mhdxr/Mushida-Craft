import { getServerSupabaseClient } from "@/lib/supabase";

export type InquirySource =
  | "pdp_inline"
  | "pdp_sticky"
  | "custom_order"
  | "fab"
  | "footer"
  | "delivery_note"
  | "other";

export interface Inquiry {
  id: string;
  source: InquirySource;
  productId?: string;
  productSlug?: string;
  productName?: string;
  productPrice?: number;
  customerName?: string;
  customerWa?: string;
  notes?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

interface InquiryRow {
  id: string;
  source: InquirySource;
  product_id: string | null;
  product_slug: string | null;
  product_name: string | null;
  product_price: number | null;
  customer_name: string | null;
  customer_wa: string | null;
  notes: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

const TABLE = "inquiries";

function rowToInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    source: row.source,
    productId: row.product_id ?? undefined,
    productSlug: row.product_slug ?? undefined,
    productName: row.product_name ?? undefined,
    productPrice: row.product_price ?? undefined,
    customerName: row.customer_name ?? undefined,
    customerWa: row.customer_wa ?? undefined,
    notes: row.notes ?? undefined,
    meta: row.meta ?? undefined,
    createdAt: row.created_at,
  };
}

export async function createInquiry(input: {
  source: InquirySource;
  productId?: string;
  productSlug?: string;
  productName?: string;
  productPrice?: number;
  customerName?: string;
  customerWa?: string;
  notes?: string;
  meta?: Record<string, unknown>;
}): Promise<Inquiry> {
  const client = getServerSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .insert({
      source: input.source,
      product_id: input.productId?.trim() || null,
      product_slug: input.productSlug?.trim() || null,
      product_name: input.productName?.trim() || null,
      product_price:
        typeof input.productPrice === "number" ? input.productPrice : null,
      customer_name: input.customerName?.trim() || null,
      customer_wa: input.customerWa?.trim() || null,
      notes: input.notes?.trim() || null,
      meta: input.meta ?? {},
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToInquiry(data as InquiryRow);
}

/** Admin: daftar inquiry terbaru. */
export async function listInquiries(limit = 100): Promise<Inquiry[]> {
  const client = getServerSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => rowToInquiry(row as InquiryRow));
}
