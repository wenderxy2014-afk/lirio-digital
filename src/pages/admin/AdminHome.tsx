import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";

export default function AdminHomePage() {
  return (
    <SiteLayout>
      <header className="text-left">
        <h1 className="font-display text-3xl">Painel Administrativo</h1>
        <p className="mt-2 text-muted-foreground">Gerencie conteúdos e configurações do site.</p>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Conteúdo</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <p className="text-sm text-muted-foreground">Devocionais, estudos, eventos, células, missões, kids e testemunhos.</p>
            <div className="mt-4">
              <Button asChild variant="brand">
                <NavLink to="/admin/conteudo">Abrir</NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <p className="text-sm text-muted-foreground">Nome da igreja, link de transmissão e Pix.</p>
            <div className="mt-4">
              <Button asChild variant="brand">
                <NavLink to="/admin/configuracoes">Abrir</NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
