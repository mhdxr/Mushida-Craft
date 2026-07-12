import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Memuat halaman...</p>
      </div>
    </div>
  );
}
