import { SiteLayout } from "@/components/site/SiteLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminTable } from "@/pages/admin/components/AdminTable";

export default function AdminContentPage() {
  return (
    <SiteLayout>
      <header className="text-left">
        <h1 className="font-display text-3xl">Conteúdo</h1>
        <p className="mt-2 text-muted-foreground">CRUD rápido para as principais tabelas (v1). Expandimos os formulários conforme necessário.</p>
      </header>

      <div className="mt-8">
        <Tabs defaultValue="events">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="cells">Células</TabsTrigger>
            <TabsTrigger value="devotionals">Devocionais</TabsTrigger>
            <TabsTrigger value="studies">Estudos</TabsTrigger>
            <TabsTrigger value="missions">Missões</TabsTrigger>
            <TabsTrigger value="departments">Departamentos</TabsTrigger>
            <TabsTrigger value="kids">Kids</TabsTrigger>
            <TabsTrigger value="testimonials">Testemunhos</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            <AdminTable table="events" />
          </TabsContent>
          <TabsContent value="cells" className="mt-6">
            <AdminTable table="cells" />
          </TabsContent>
          <TabsContent value="devotionals" className="mt-6">
            <AdminTable table="devotionals" />
          </TabsContent>
          <TabsContent value="studies" className="mt-6">
            <AdminTable table="studies" />
          </TabsContent>
          <TabsContent value="missions" className="mt-6">
            <AdminTable table="missions" />
          </TabsContent>
          <TabsContent value="departments" className="mt-6">
            <AdminTable table="departments" />
          </TabsContent>
          <TabsContent value="kids" className="mt-6">
            <AdminTable table="kids_contents" />
          </TabsContent>
          <TabsContent value="testimonials" className="mt-6">
            <AdminTable table="testimonials" />
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}
