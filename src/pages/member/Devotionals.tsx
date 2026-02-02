import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "@/components/NavLink";
import { useDevotionals } from "@/data/queries";
import { Crown } from "lucide-react";

export default function DevotionalsPage() {
  const { data } = useDevotionals();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data ?? [];
    return (data ?? []).filter((d) =>
      [d.title, d.theme, d.bible_book, (d.tags ?? []).join(" ")].filter(Boolean).join(" ").toLowerCase().includes(s),
    );
  }, [q, data]);

  return (
    <SiteLayout>
      <header className="text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-4 py-2 text-sm font-medium text-emerald-700 backdrop-blur mb-4">
          <Crown className="h-4 w-4" />
          Ensinamentos do Pastor
        </div>
        <h1 className="font-display text-3xl">Pérolas do Pastor</h1>
        <p className="mt-2 text-muted-foreground">Mensagens e sermões do nosso pastor para edificar sua vida espiritual.</p>
        <div className="mt-4 max-w-md">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por tema ou palavra-chave..." />
        </div>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {filtered.map((d) => (
          <Card key={d.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="font-display">
                <NavLink to={`/membro/devocionais/${d.id}`} className="brand-underline">
                  {d.title}
                </NavLink>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <div className="flex flex-wrap gap-2">
                {d.theme && <Badge variant="secondary">{d.theme}</Badge>}
                {d.bible_book && <Badge variant="secondary">{d.bible_book}</Badge>}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {(d.tags ?? []).slice(0, 4).join(" • ")}
              </div>
            </CardContent>
          </Card>
        ))}

        {(!filtered || filtered.length === 0) && (
          <div className="rounded-3xl border bg-card p-6 text-left text-muted-foreground">Nenhuma pérola encontrada. O pastor ainda não publicou nenhum ensinamento.</div>
        )}
      </section>
    </SiteLayout>
  );
}
