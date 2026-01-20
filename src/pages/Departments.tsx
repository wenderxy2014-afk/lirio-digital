import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDepartments } from "@/data/queries";

export default function DepartmentsPage() {
  const { data } = useDepartments();

  return (
    <SiteLayout>
      <header className="text-left">
        <h1 className="font-display text-3xl">Departamentos & Contatos</h1>
        <p className="mt-2 text-muted-foreground">Encontre o ministério e fale com a liderança.</p>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {(data ?? []).map((d) => (
          <Card key={d.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="font-display">{d.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <p className="text-sm text-muted-foreground">{d.description ?? "Descrição a confirmar"}</p>
              <div className="mt-4 rounded-2xl bg-brand-soft p-4 text-sm">
                <div className="font-medium">Contato</div>
                <div className="mt-1 text-muted-foreground">Líder: {d.leader_name ?? "A confirmar"}</div>
                <div className="text-muted-foreground">WhatsApp: {d.contact_whatsapp ?? "-"}</div>
                <div className="text-muted-foreground">E-mail: {d.contact_email ?? "-"}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </SiteLayout>
  );
}
