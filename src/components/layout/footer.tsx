import Link from "next/link";
import { Flower2, Instagram, MessageCircle, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-cream-50">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Flower2 className="h-5 w-5" />
              </span>
              <span className="font-serif text-xl font-semibold">Mushida</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Hand-tied bouquet artisan untuk setiap momen berharga.
              Premium, elegan, dengan sentuhan personal.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-base font-semibold">Jelajah</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/katalog" className="hover:text-foreground">
                  Katalog
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-foreground">
                  Custom Order
                </Link>
              </li>
              <li>
                <Link href="/#cara-order" className="hover:text-foreground">
                  Cara Order
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-foreground">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-base font-semibold">Kategori</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/katalog?category=hand-bouquet"
                  className="hover:text-foreground"
                >
                  Hand Bouquet
                </Link>
              </li>
              <li>
                <Link
                  href="/katalog?category=wedding"
                  className="hover:text-foreground"
                >
                  Wedding
                </Link>
              </li>
              <li>
                <Link
                  href="/katalog?category=graduation"
                  className="hover:text-foreground"
                >
                  Graduation
                </Link>
              </li>
              <li>
                <Link
                  href="/katalog?category=anniversary"
                  className="hover:text-foreground"
                >
                  Anniversary
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-base font-semibold">Kontak</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span>WhatsApp 0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-primary" />
                <span>@Mushida.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>hello@Mushida.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Mushida. All rights reserved.</p>
          <p>Made with 🌸 in Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}
