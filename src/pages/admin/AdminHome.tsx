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
import { Layout, Users, Sparkles, FileText, Settings, Home } from "lucide-react";

export default function AdminHomePage() {
  const menuItems = [
    {
      title: "Conteúdo",
      description: "Devocionais, estudos, eventos, células, missões, kids e testemunhos.",
      icon: FileText,
      href: "/admin/conteudo",
      variant: "brand" as const,
    },
    {
      title: "Configurações",
      description: "Nome da igreja, link de transmissão e Pix.",
      icon: Settings,
      href: "/admin/configuracoes",
      variant: "brand" as const,
    },
    {
      title: "Editor da Home Page",
      description: "Edite textos, imagens e banners da página inicial.",
      icon: Layout,
      href: "/admin/home-cms",
      variant: "outline" as const,
    },
    {
      title: "Devocionais com IA",
      description: "Gere devocionais personalizados usando inteligência artificial.",
      icon: Sparkles,
      href: "/admin/devocional-ia",
      variant: "outline" as const,
    },
    {
      title: "Usuários e Permissões",
      description: "Gerencie usuários administrativos e suas permissões.",
      icon: Users,
      href: "/admin/usuarios",
      variant: "outline" as const,
    },
  ];

  return (
    <SiteLayout>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Painel Administrativo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Header com Glassmorphism */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12 mb-10">
        {/* Ícone decorativo */}
        <div className="absolute right-8 top-8 text-primary/10">
          <Home className="h-32 w-32 md:h-40 md:w-40" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur">
            <Settings className="h-4 w-4" />
            Área Administrativa
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
            Painel Administrativo
          </h1>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            Gerencie conteúdos e configurações do site de forma simples e rápida.
          </p>
        </div>
      </header>

      {/* Grid de Cards */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item, index) => (
          <Card
            key={index}
            className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {/* Ícone decorativo no canto */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />

            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <CardHeader className="relative pb-2">
              <CardTitle className="flex items-center gap-3 font-display text-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <item.icon className="h-6 w-6" />
                </div>
                {item.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative text-left">
              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              <Button
                asChild
                variant={item.variant}
                className={`w-full transition-all duration-300 ${item.variant === "brand"
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl"
                    : ""
                  }`}
              >
                <NavLink to={item.href}>Abrir</NavLink>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </SiteLayout>
  );
}
