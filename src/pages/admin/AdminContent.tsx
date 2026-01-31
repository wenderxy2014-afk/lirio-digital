import { SiteLayout } from "@/components/site/SiteLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminTable } from "@/pages/admin/components/AdminTable";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { FileText, Calendar, Users, BookOpen, Globe, Building2, Baby, MessageSquareHeart, ArrowLeft } from "lucide-react";

export default function AdminContentPage() {
  const tabs = [
    { value: "events", label: "Eventos", icon: Calendar, table: "events" },
    { value: "cells", label: "Células", icon: Users, table: "cells" },
    { value: "devotionals", label: "Devocionais", icon: BookOpen, table: "devotionals" },
    { value: "studies", label: "Estudos", icon: FileText, table: "studies" },
    { value: "missions", label: "Missões", icon: Globe, table: "missions" },
    { value: "departments", label: "Departamentos", icon: Building2, table: "departments" },
    { value: "kids", label: "Kids", icon: Baby, table: "kids_contents" },
    { value: "testimonials", label: "Testemunhos", icon: MessageSquareHeart, table: "testimonials" },
  ];

  return (
    <SiteLayout>
      {/* Botão Voltar */}
      <Button asChild variant="ghost" className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
        <NavLink to="/admin">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Painel
        </NavLink>
      </Button>

      {/* Hero Header com Glassmorphism */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12 mb-10">
        {/* Ícone decorativo */}
        <div className="absolute right-8 top-8 text-primary/10">
          <FileText className="h-32 w-32 md:h-40 md:w-40" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur">
            <FileText className="h-4 w-4" />
            Gerenciador de Conteúdo
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
            Conteúdo
          </h1>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            Gerencie todos os conteúdos do site em um só lugar.
          </p>
        </div>
      </header>

      <div className="mt-8">
        <Tabs defaultValue="events" className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-card to-primary/5 p-2 shadow-lg border-0">
            <TabsList className="flex flex-wrap gap-1 bg-transparent h-auto p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-xl px-4 py-2.5 transition-all duration-300 flex items-center gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              <div className="rounded-2xl bg-gradient-to-br from-card to-primary/5 p-6 shadow-lg border-0">
                <AdminTable table={tab.table as "events" | "cells" | "devotionals" | "studies" | "missions" | "departments" | "kids_contents" | "testimonials"} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </SiteLayout>
  );
}
