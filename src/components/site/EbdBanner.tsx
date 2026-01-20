import { Card } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import { useEbdDevotionalToday } from "@/data/ebd";
import { BookOpen } from "lucide-react";

export function EbdBanner() {
  const { data } = useEbdDevotionalToday();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4">
      <Card className="overflow-hidden border bg-brand-soft">
        <NavLink
          to="/ebd"
          className="flex items-center justify-between gap-4 px-4 py-3 text-left md:px-6"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Devocional do dia (EBD)</span>
            </div>
            <div className="mt-1 line-clamp-1 font-display text-base">
              {data?.title ?? "Abrir devocional de hoje"}
            </div>
          </div>
          <span className="shrink-0 text-sm font-medium brand-underline">Ler agora</span>
        </NavLink>
      </Card>
    </div>
  );
}
