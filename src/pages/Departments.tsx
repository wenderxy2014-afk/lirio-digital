import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDepartments } from "@/data/queries";
import { Building2, User, Phone, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DepartmentsPage() {
  const { data } = useDepartments();

  return (
    <SiteLayout>
      {/* Hero Header com Glassmorphism */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur">
            <Building2 className="h-4 w-4" />
            Ministérios da Igreja
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
            Departamentos & Contatos
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Conheça nossos ministérios e entre em contato com a liderança de cada área.
          </p>
        </div>
      </header>

      {/* Grid de Departamentos */}
      <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((d) => (
          <Card
            key={d.id}
            className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {/* Ícone decorativo no canto */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />

            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <CardHeader className="relative pb-2">
              <CardTitle className="flex items-center gap-3 font-display text-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Users className="h-6 w-6" />
                </div>
                {d.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative text-left">
              {d.description && (
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  {d.description}
                </p>
              )}

              {/* Card de Contato */}
              <div className="space-y-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                <div className="text-xs font-medium text-primary uppercase tracking-wide flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Contato
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 shadow-sm">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{d.leader_name ?? "A confirmar"}</span>
                  </div>

                  {d.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${d.contact_whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 text-sm group/link"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]/10 shadow-sm transition-colors group-hover/link:bg-[#25D366]/20">
                        <Phone className="h-4 w-4 text-[#25D366]" />
                      </div>
                      <span className="text-muted-foreground group-hover/link:text-[#25D366] transition-colors">
                        {d.contact_whatsapp}
                      </span>
                    </a>
                  )}

                  {d.contact_email && (
                    <a
                      href={`mailto:${d.contact_email}`}
                      className="flex items-center gap-3 text-sm group/link"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 shadow-sm transition-colors group-hover/link:bg-primary/10">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground group-hover/link:text-primary transition-colors truncate">
                        {d.contact_email}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!data || data.length === 0) && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed bg-gradient-to-br from-background to-primary/5 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Nenhum departamento cadastrado</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Em breve teremos informações sobre nossos ministérios.
            </p>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
