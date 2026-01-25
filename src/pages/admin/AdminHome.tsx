import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbPage 
} from "@/components/ui/breadcrumb";
import { Layout, Users, Sparkles } from "lucide-react";

export default function AdminHomePage() {
  return (
    <SiteLayout>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Painel Administrativo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Editor da Home Page
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <p className="text-sm text-muted-foreground">Edite textos, imagens e banners da página inicial.</p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <NavLink to="/admin/home-cms">Abrir Editor</NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Devocionais com IA
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <p className="text-sm text-muted-foreground">Gere devocionais personalizados usando inteligência artificial.</p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <NavLink to="/admin/devocional-ia">Gerar Devocional</NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários e Permissões
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <p className="text-sm text-muted-foreground">Gerencie usuários administrativos e suas permissões.</p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <NavLink to="/admin/usuarios">Gerenciar</NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
