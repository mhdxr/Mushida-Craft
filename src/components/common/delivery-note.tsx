import { Clock3, MapPin, MessageCircle } from "lucide-react";
import {
  buildDeliveryBullets,
  buildDeliverySummary,
  getDeliveryInfo,
} from "@/lib/delivery";
import {
  buildDefaultInquiryMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";

type DeliveryNoteVariant = "card" | "compact";

/**
 * Catatan pengiriman jujur — area + cut-off same-day.
 * Dipakai di PDP, custom order, dsb.
 */
export function DeliveryNote({
  variant = "card",
  showWhatsAppCta = false,
}: {
  variant?: DeliveryNoteVariant;
  showWhatsAppCta?: boolean;
}) {
  const info = getDeliveryInfo();
  const summary = buildDeliverySummary(info);
  const bullets = buildDeliveryBullets(info);
  const waUrl = buildWhatsAppUrl(
    `${buildDefaultInquiryMessage()} Mau cek ongkir & slot pengiriman ke area saya.`,
  );

  if (variant === "compact") {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        💌 <strong className="font-medium text-foreground">Free greeting card</strong>
        {" · "}
        {summary}
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-secondary/30 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush-50 text-primary">
          <MapPin className="h-4 w-4" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold tracking-tight text-foreground">
            Pengiriman & area layanan
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 border-t border-border/40 pt-4 text-sm text-muted-foreground">
        {bullets.map((line) => (
          <li key={line} className="flex gap-2 leading-relaxed">
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span>{line}</span>
          </li>
        ))}
        <li className="flex gap-2 leading-relaxed">
          <span className="mt-0.5 text-primary/70">💌</span>
          <span>
            <strong className="font-medium text-foreground">Free greeting card</strong>
            {" "}untuk setiap pesanan
          </span>
        </li>
      </ul>

      {showWhatsAppCta ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-foreground transition-colors hover:text-primary"
        >
          <MessageCircle className="h-4 w-4 text-primary" />
          Cek ongkir & slot via WhatsApp
        </a>
      ) : null}
    </div>
  );
}
