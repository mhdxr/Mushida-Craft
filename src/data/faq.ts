/**
 * FAQ & trust copy — satu sumber untuk UI + JSON-LD.
 * Jaga jujur: handmade (bukan selalu bunga segar), WA-first, same-day terbatas.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "Bagaimana cara order?",
    answer:
      "Pilih bouquet di katalog lalu klik Order via WhatsApp, atau isi form Custom Order. Admin akan bantu konfirmasi stok, desain, ongkir, dan jadwal pengiriman.",
  },
  {
    question: "Metode pembayaran apa saja?",
    answer:
      "Transfer bank dan e-wallet (mis. QRIS). Detail rekening / QR dikirim admin via WhatsApp setelah pesanan dikonfirmasi. Tidak ada checkout otomatis di website.",
  },
  {
    question: "Apakah perlu DP / bayar di muka?",
    answer:
      "Ya. Umumnya DP atau pelunasan diminta sebelum rangkaian dikerjakan, terutama untuk custom dan same-day. Jumlah pastinya dikonfirmasi admin sesuai pesanan.",
  },
  {
    question: "Area mana yang same-day?",
    answer:
      "Same-day tersedia untuk Jakarta Barat dan Jakarta Pusat bila order masuk sebelum pukul 15.00 WIB (slot menyesuaikan antrean). Area lain tetap bisa dilayani — estimasi & ongkir via WhatsApp.",
  },
  {
    question: "Apakah bouquetnya bunga segar?",
    answer:
      "Koleksi utama kami handmade: snack, money, artifisial, graduation, dan satin. Bukan florist bunga segar harian. Cocok untuk hadiah awet dan momen spesial.",
  },
  {
    question: "Bisa request custom?",
    answer:
      "Bisa. Isi form Custom Order (jenis, momen, budget, area, tanggal) — pesan otomatis terbuka di WhatsApp. Sertakan preferensi warna/tema di catatan.",
  },
  {
    question: "Berapa lama pengerjaan?",
    answer:
      "Katalog ready-stock / same-day bisa lebih cepat (tergantung antrean). Custom biasanya butuh waktu lebih — admin akan kasih estimasi setelah detail dikonfirmasi.",
  },
];

export interface TrustItem {
  title: string;
  description: string;
  /** Lucide icon name key — dipetakan di komponen. */
  icon: "message" | "shield" | "truck" | "sparkles";
}

export const trustItems: TrustItem[] = [
  {
    icon: "message",
    title: "Order via WhatsApp",
    description: "Langsung chat admin — tanpa keranjang rumit.",
  },
  {
    icon: "shield",
    title: "Bayar aman",
    description: "Transfer bank / e-wallet setelah konfirmasi pesanan.",
  },
  {
    icon: "truck",
    title: "Same-day Jakbar & Jakpus",
    description: "Order sebelum 15.00 WIB, slot menyesuaikan antrean.",
  },
  {
    icon: "sparkles",
    title: "Handmade personal",
    description: "Dirangkai manual sesuai momen dan budgetmu.",
  },
];
