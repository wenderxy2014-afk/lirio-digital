import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, Image, Type, MousePointerClick, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface HeroContent {
  welcome_text: string;
  title: string;
  subtitle: string;
  video_url: string;
  show_audio_toggle: boolean;
  show_live_stream: boolean;
}

interface ButtonsContent {
  buttons: Array<{
    label: string;
    url: string;
    variant: string;
  }>;
}

interface CarouselContent {
  slides: Array<{
    image_url: string;
    alt_text: string;
    link?: string;
    order?: number;
  }>;
}

interface TextsContent {
  next_steps_title: string;
  next_steps_description: string;
}

export default function HomeCMSPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch home content
  const { data: homeContent, isLoading } = useQuery({
    queryKey: ["home-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_content")
        .select("*");

      if (error) throw error;

      const content: Record<string, any> = {};
      data?.forEach((item) => {
        content[item.section] = item.content;
      });

      return content;
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ section, content }: { section: string; content: any }) => {
      const { error } = await supabase
        .from("home_content")
        .upsert({
          section,
          content,
          updated_at: new Date().toISOString(),
        }, { onConflict: "section" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      queryClient.invalidateQueries({ queryKey: ["home-content-all"] });
      queryClient.invalidateQueries({ queryKey: ["home_content"] });
      toast({
        title: "Salvo com sucesso!",
        description: "As alterações foram aplicadas",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Hero section state
  const [heroForm, setHeroForm] = useState<HeroContent>({
    welcome_text: "",
    title: "",
    subtitle: "",
    video_url: "",
    show_audio_toggle: true,
    show_live_stream: true,
  });

  // Buttons section state
  const [buttonsForm, setButtonsForm] = useState<ButtonsContent>({
    buttons: [],
  });

  // Carousel section state
  const [carouselForm, setCarouselForm] = useState<CarouselContent>({
    slides: [],
  });

  // Texts section state
  const [textsForm, setTextsForm] = useState<TextsContent>({
    next_steps_title: "",
    next_steps_description: "",
  });

  // Load existing data
  useEffect(() => {
    if (homeContent?.hero) {
      setHeroForm(homeContent.hero);
    }
    if (homeContent?.buttons) {
      setButtonsForm(homeContent.buttons);
    }
    if (homeContent?.carousel) {
      setCarouselForm(homeContent.carousel);
    }
    if (homeContent?.texts) {
      setTextsForm(homeContent.texts);
    }
  }, [homeContent]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editor da Home Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-6">
        <h1 className="font-display text-3xl flex items-center gap-2">
          <Layout className="h-8 w-8" />
          Editor da Home Page
        </h1>
        <p className="mt-2 text-muted-foreground">
          Personalize textos, imagens e banners da página inicial
        </p>
      </header>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">
            <Type className="h-4 w-4 mr-2" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="buttons">
            <MousePointerClick className="h-4 w-4 mr-2" />
            Botões
          </TabsTrigger>
          <TabsTrigger value="carousel">
            <Image className="h-4 w-4 mr-2" />
            Carrossel
          </TabsTrigger>
          <TabsTrigger value="texts">
            <Type className="h-4 w-4 mr-2" />
            Textos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Seção Hero (Principal)</CardTitle>
              <CardDescription>
                Configure o conteúdo da seção principal da home page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate({ section: "hero", content: heroForm });
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="welcome">Texto de Boas-vindas</Label>
                  <Input
                    id="welcome"
                    value={heroForm.welcome_text}
                    onChange={(e) => setHeroForm({ ...heroForm, welcome_text: e.target.value })}
                    placeholder="Bem-vindo(a)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título Principal</Label>
                  <Input
                    id="title"
                    value={heroForm.title}
                    onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                    placeholder="Um lugar para pertencer, crescer e servir."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Textarea
                    id="subtitle"
                    value={heroForm.subtitle}
                    onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                    placeholder="Acompanhe nossos cultos e eventos..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vídeo de Fundo</Label>
                  <ImageUploader
                    currentImageUrl={heroForm.video_url}
                    onUploadComplete={(url) => setHeroForm({ ...heroForm, video_url: url })}
                    folder="hero"
                  />
                  <p className="text-xs text-muted-foreground">
                    Também aceita vídeos (formato MP4 recomendado)
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Toggle de Áudio</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar botão de controle de áudio
                    </p>
                  </div>
                  <Switch
                    checked={heroForm.show_audio_toggle}
                    onCheckedChange={(checked) => setHeroForm({ ...heroForm, show_audio_toggle: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Transmissão ao Vivo</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar banner de transmissão ao vivo
                    </p>
                  </div>
                  <Switch
                    checked={heroForm.show_live_stream}
                    onCheckedChange={(checked) => setHeroForm({ ...heroForm, show_live_stream: checked })}
                  />
                </div>

                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Hero
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buttons">
          <Card>
            <CardHeader>
              <CardTitle>Botões de Ação</CardTitle>
              <CardDescription>
                Gerencie os botões principais da home page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate({ section: "buttons", content: buttonsForm });
                }}
                className="space-y-6"
              >
                {buttonsForm.buttons.map((button, index) => (
                  <div key={index} className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Botão {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newButtons = buttonsForm.buttons.filter((_, i) => i !== index);
                          setButtonsForm({ ...buttonsForm, buttons: newButtons });
                        }}
                      >
                        Remover
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Texto do Botão</Label>
                        <Input
                          value={button.label}
                          onChange={(e) => {
                            const newButtons = [...buttonsForm.buttons];
                            newButtons[index].label = e.target.value;
                            setButtonsForm({ ...buttonsForm, buttons: newButtons });
                          }}
                          placeholder="Ex: Cultos & Eventos"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>URL/Link</Label>
                        <Input
                          value={button.url}
                          onChange={(e) => {
                            const newButtons = [...buttonsForm.buttons];
                            newButtons[index].url = e.target.value;
                            setButtonsForm({ ...buttonsForm, buttons: newButtons });
                          }}
                          placeholder="/cultos"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setButtonsForm({
                      ...buttonsForm,
                      buttons: [...buttonsForm.buttons, { label: "", url: "", variant: "soft" }],
                    });
                  }}
                >
                  Adicionar Botão
                </Button>

                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Botões
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carousel">
          <Card>
            <CardHeader>
              <CardTitle>Carrossel de Banners</CardTitle>
              <CardDescription>
                Adicione e gerencie os banners rotativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate({ section: "carousel", content: carouselForm });
                }}
                className="space-y-6"
              >
                {carouselForm.slides.map((slide, index) => (
                  <div key={index} className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Slide {index + 1}</h4>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={saveMutation.isPending}
                          onClick={() => saveMutation.mutate({ section: "carousel", content: carouselForm })}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSlides = carouselForm.slides.filter((_, i) => i !== index);
                            setCarouselForm({ ...carouselForm, slides: newSlides });
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Imagem do Slide</Label>
                      <ImageUploader
                        currentImageUrl={slide.image_url}
                        onUploadComplete={(url) => {
                          const newSlides = [...carouselForm.slides];
                          newSlides[index].image_url = url;
                          setCarouselForm({ ...carouselForm, slides: newSlides });
                        }}
                        folder="carousel"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Texto Alternativo</Label>
                        <Input
                          value={slide.alt_text}
                          onChange={(e) => {
                            const newSlides = [...carouselForm.slides];
                            newSlides[index].alt_text = e.target.value;
                            setCarouselForm({ ...carouselForm, slides: newSlides });
                          }}
                          placeholder="Descrição da imagem"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Link (opcional)</Label>
                        <Input
                          value={slide.link || ""}
                          onChange={(e) => {
                            const newSlides = [...carouselForm.slides];
                            newSlides[index].link = e.target.value;
                            setCarouselForm({ ...carouselForm, slides: newSlides });
                          }}
                          placeholder="/eventos/especial"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCarouselForm({
                      ...carouselForm,
                      slides: [...carouselForm.slides, { image_url: "", alt_text: "", order: carouselForm.slides.length + 1 }],
                    });
                  }}
                >
                  Adicionar Slide
                </Button>

                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Carrossel
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="texts">
          <Card>
            <CardHeader>
              <CardTitle>Textos Gerais</CardTitle>
              <CardDescription>
                Edite os textos informativos da página
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate({ section: "texts", content: textsForm });
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="next-steps-title">Título "Próximos Passos"</Label>
                  <Input
                    id="next-steps-title"
                    value={textsForm.next_steps_title}
                    onChange={(e) => setTextsForm({ ...textsForm, next_steps_title: e.target.value })}
                    placeholder="Próximos passos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next-steps-description">Descrição "Próximos Passos"</Label>
                  <Textarea
                    id="next-steps-description"
                    value={textsForm.next_steps_description}
                    onChange={(e) => setTextsForm({ ...textsForm, next_steps_description: e.target.value })}
                    placeholder="Ajuste textos oficiais, contatos..."
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Textos
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SiteLayout>
  );
}