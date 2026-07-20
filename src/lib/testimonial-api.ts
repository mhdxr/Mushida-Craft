import { getBrowserSupabaseClient, getServerSupabaseClient } from "@/lib/supabase";
import type { Testimonial, TestimonialStatus } from "@/types";

const TABLE = "testimonials";

interface TestimonialRow {
  id: string;
  name: string;
  role: string | null;
  message: string;
  rating: number;
  status: TestimonialStatus;
  created_at: string;
}

function rowToTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? undefined,
    message: row.message,
    rating: row.rating,
    status: row.status,
    createdAt: row.created_at,
  };
}

/** Public: ambil testimoni yang sudah disetujui (terbaru dulu). */
export async function fetchApprovedTestimonials(
  limit = 8,
): Promise<Testimonial[]> {
  const client = getBrowserSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => rowToTestimonial(row as TestimonialRow));
}

/** Public submit (service role): simpan sebagai pending. */
export async function createTestimonial(input: {
  name: string;
  role?: string;
  message: string;
  rating: number;
}): Promise<Testimonial> {
  const client = getServerSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .insert({
      name: input.name.trim(),
      role: input.role?.trim() || null,
      message: input.message.trim(),
      rating: input.rating,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToTestimonial(data as TestimonialRow);
}

/** Admin: daftar semua testimoni (pending dulu, lalu terbaru). */
export async function listAllTestimonials(): Promise<Testimonial[]> {
  const client = getServerSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (data ?? []).map((row) =>
    rowToTestimonial(row as TestimonialRow),
  );
  // Pending di atas, lalu approved (keduanya tetap urut created_at desc di dalam grup).
  return rows.sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "pending" ? -1 : 1;
  });
}

/** Admin: setujui testimoni. */
export async function approveTestimonial(
  id: string,
): Promise<Testimonial | null> {
  const client = getServerSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .update({ status: "approved" })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ? rowToTestimonial(data as TestimonialRow) : null;
}

/** Admin: hapus testimoni. */
export async function deleteTestimonial(id: string): Promise<void> {
  const client = getServerSupabaseClient();
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
