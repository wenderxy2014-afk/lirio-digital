import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";

export default function MemberHomePage() {
  return (
    <SiteLayout>
      <header className="text-left">
        <h1 className="font-display text-3xl">Área do Membro</h1>
        <p className="mt-2 text-muted-foreground">Conteúdos exclusivos e materiais da igreja.</p>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Devocionais</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <p className="text-sm text-muted-foreground">Leituras diárias e reflexões.</p>
            <div className="mt-4">
              <Button asChild variant="brand">
                <NavLink to="/membro/devocionais">Acessar</NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Estudos</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <p className="text-sm text-muted-foreground">Séries de ensino e materiais.</p>
            <div className="mt-4">
              <Button asChild variant="brand">
                <NavLink to="/membro/estudos">Acessar</NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
