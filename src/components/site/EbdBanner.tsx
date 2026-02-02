import { Card } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import { useEbdDevotionalToday } from "@/data/ebd";
import { BookOpen } from "lucide-react";

export function EbdBanner() {
  const { data } = useEbdDevotionalToday();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4">
      <Card className="group overflow-hidden border bg-brand text-primary-foreground shadow-glow transition-transform duration-200 hover:-translate-y-0.5">
        <NavLink
          to="/ebd"
          className="relative flex items-center justify-between gap-4 px-4 py-3 text-left md:px-6"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              backgroundImage:
                "radial-gradient(700px circle at 20% 20%, rgba(255,255,255,0.22), transparent 40%), radial-gradient(700px circle at 80% 40%, rgba(255,255,255,0.16), transparent 45%)",
            }}
          />

          <div className="relative z-10 min-w-0">
            <div className="flex items-center gap-2 text-base md:text-lg font-bold">
              <BookOpen className="h-4 w-4" />
              <span>Devocional do dia (EBD)</span>
            </div>
            <div className="mt-1 line-clamp-1 font-display text-sm md:text-base opacity-90">
              {data?.title ?? "Abrir devocional de hoje"}
            </div>
          </div>

          <span className="relative z-10 shrink-0 text-sm font-semibold brand-underline">
            <span className="inline-flex items-center gap-2 rounded-xl bg-background/10 px-3 py-1 ring-1 ring-white/20 transition-colors group-hover:bg-background/15">
              Ler agora
              <span className="pulse inline-block h-1.5 w-1.5 rounded-full bg-primary-foreground" />
            </span>
          </span>
        </NavLink>
      </Card>
    </div>
  );
}
