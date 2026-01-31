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
import { Layout, Image, Type, MousePointerClick, Save, Loader2, Megaphone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { TickerConfig, defaultTickerConfig } from "@/components/site/Ticker";
import bannerFamilia from "@/assets/banner-familia.png";
import bannerMaturidade from "@/assets/banner-maturidade.png";
import bannerHomens from "@/assets/banner-homens.png";
import bannerCeia from "@/assets/banner-ceia.png";
import heroVideo from "@/assets/hero-bg.mp4";

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

  // Ticker section state
  const [tickerForm, setTickerForm] = useState<TickerConfig>(defaultTickerConfig);

  // Map to resolve asset paths to actual imports
  const assetMap: Record<string, string> = {
    '/src/assets/banner-familia.png': bannerFamilia,
    'banner-familia.png': bannerFamilia,
    '/src/assets/banner-maturidade.png': bannerMaturidade,
    'banner-maturidade.png': bannerMaturidade,
    '/src/assets/banner-homens.png': bannerHomens,
    'banner-homens.png': bannerHomens,
    '/src/assets/banner-ceia.png': bannerCeia,
    'banner-ceia.png': bannerCeia,
    'hero-bg.mp4': heroVideo,
  };

  const resolveAsset = (url: string) => {
    if (!url) return "";
    // Priorizar URLs completas (Supabase Storage, CDN, etc)
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    // Verificar assetMap para paths locais
    if (assetMap[url]) return assetMap[url];
    const filename = url.split('/').pop();
    if (filename && assetMap[filename]) return assetMap[filename];
    return url;
  };

  // Load existing data
  useEffect(() => {
    if (homeContent?.hero) {
      setHeroForm({
        ...homeContent.hero,
        video_url: resolveAsset(homeContent.hero.video_url)
      });
    }
    if (homeContent?.buttons) {
      setButtonsForm(homeContent.buttons);
    }
    if (homeContent?.carousel) {
      const resolvedSlides = (homeContent.carousel.slides || []).map((s: any) => ({
        ...s,
        image_url: resolveAsset(s.image_url)
      }));
      setCarouselForm({ slides: resolvedSlides });
    }
    if (homeContent?.texts) {
      setTextsForm(homeContent.texts);
    }
    if (homeContent?.ticker) {
      setTickerForm(homeContent.ticker);
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
          <Layout className="h-32 w-32 md:h-40 md:w-40" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur">
            <Layout className="h-4 w-4" />
            CMS Visual
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
            Editor da Home Page
          </h1>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            Personalize textos, imagens e banners da página inicial
          </p>
        </div>
      </header>

      <Tabs defaultValue="ticker" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ticker">
            <Megaphone className="h-4 w-4 mr-2" />
            Letreiro
          </TabsTrigger>
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

        <TabsContent value="ticker">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Letreiro</CardTitle>
              <CardDescription>
                Customize a faixa de boas-vindas animada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate({ section: "ticker", content: tickerForm });
                }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/40">
                  <div className="space-y-0.5">
                    <Label>Ativar Letreiro</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar ou ocultar o letreiro na home
                    </p>
                  </div>
                  <Switch
                    checked={tickerForm.enabled}
                    onCheckedChange={(checked) => setTickerForm({ ...tickerForm, enabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Texto do Letreiro</Label>
                  <Textarea
                    value={tickerForm.text}
                    onChange={(e) => setTickerForm({ ...tickerForm, text: e.target.value })}
                    placeholder="Digite a mensagem..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Efeito de Animação</Label>
                    <Select
                      value={tickerForm.effect}
                      onValueChange={(val: any) => setTickerForm({ ...tickerForm, effect: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scroll">Rolar (Scroll)</SelectItem>
                        <SelectItem value="pulse">Pulsar</SelectItem>
                        <SelectItem value="static">Estático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Velocidade ({tickerForm.speed} - {tickerForm.speed <= 5 ? 'Ultra Rápido' : tickerForm.speed <= 10 ? 'Rápido' : tickerForm.speed <= 20 ? 'Normal' : 'Lento'})</Label>
                    <Slider
                      value={[tickerForm.speed]}
                      min={1}
                      max={30}
                      step={1}
                      onValueChange={(vals) => setTickerForm({ ...tickerForm, speed: vals[0] })}
                    />
                    <p className="text-xs text-muted-foreground">Quanto menor o valor, mais rápido o letreiro passa</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={tickerForm.textColor}
                        onChange={(e) => setTickerForm({ ...tickerForm, textColor: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={tickerForm.textColor}
                        onChange={(e) => setTickerForm({ ...tickerForm, textColor: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={tickerForm.backgroundColor}
                        onChange={(e) => setTickerForm({ ...tickerForm, backgroundColor: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={tickerForm.backgroundColor}
                        onChange={(e) => setTickerForm({ ...tickerForm, backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tamanho da Fonte</Label>
                    <Select
                      value={tickerForm.fontSize}
                      onValueChange={(val) => setTickerForm({ ...tickerForm, fontSize: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text-sm">Pequeno</SelectItem>
                        <SelectItem value="text-base">Normal</SelectItem>
                        <SelectItem value="text-lg">Grande</SelectItem>
                        <SelectItem value="text-xl">Muito Grande</SelectItem>
                        <SelectItem value="text-2xl">Enorme</SelectItem>
                        <SelectItem value="text-3xl">Gigante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fonte</Label>
                    <Select
                      value={tickerForm.fontFamily}
                      onValueChange={(val) => setTickerForm({ ...tickerForm, fontFamily: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="font-ticker">Condensada (Lagoinha - Recomendado)</SelectItem>
                        <SelectItem value="font-sans">Sans Serif (Padrão)</SelectItem>
                        <SelectItem value="font-serif">Serif (Elegante)</SelectItem>
                        <SelectItem value="font-mono">Monoespaçada</SelectItem>
                        <SelectItem value="font-display">Display (Títulos)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">"Condensada" é o estilo igual ao site da Lagoinha</p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label>Negrito</Label>
                    <Switch
                      checked={tickerForm.isBold}
                      onCheckedChange={(checked) => setTickerForm({ ...tickerForm, isBold: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Caixa Alta (MAIÚSCULAS)</Label>
                      <p className="text-xs text-muted-foreground">Estilo impactante como da Lagoinha</p>
                    </div>
                    <Switch
                      checked={tickerForm.isUppercase ?? true}
                      onCheckedChange={(checked) => setTickerForm({ ...tickerForm, isUppercase: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Itálico</Label>
                      <p className="text-xs text-muted-foreground">Texto inclinado estilo Lagoinha</p>
                    </div>
                    <Switch
                      checked={tickerForm.isItalic ?? true}
                      onCheckedChange={(checked) => setTickerForm({ ...tickerForm, isItalic: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Estilo Visual</Label>
                    <Select
                      value={(tickerForm as any).style || "integrated"}
                      onValueChange={(val) => setTickerForm({ ...tickerForm, style: val as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="integrated">Integrado ao Fundo (Lagoinha)</SelectItem>
                        <SelectItem value="boxed">Com Caixa/Borda</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Integrado = sem bordas, faz parte do fundo da página</p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4 bg-gradient-to-r from-amber-100 to-orange-100">
                    <div className="space-y-0.5">
                      <Label>Usar Gradiente</Label>
                      <p className="text-xs text-muted-foreground">Fundo com degradê colorido</p>
                    </div>
                    <Switch
                      checked={tickerForm.useGradient ?? true}
                      onCheckedChange={(checked) => setTickerForm({ ...tickerForm, useGradient: checked })}
                    />
                  </div>

                  {tickerForm.useGradient && (
                    <>
                      <div className="space-y-2">
                        <Label>Cor Inicial do Gradiente</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={tickerForm.gradientFrom || "#FFD54F"}
                            onChange={(e) => setTickerForm({ ...tickerForm, gradientFrom: e.target.value })}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={tickerForm.gradientFrom || "#FFD54F"}
                            onChange={(e) => setTickerForm({ ...tickerForm, gradientFrom: e.target.value })}
                            placeholder="#FFD54F"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Cor Final do Gradiente</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={tickerForm.gradientTo || "#FF9800"}
                            onChange={(e) => setTickerForm({ ...tickerForm, gradientTo: e.target.value })}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={tickerForm.gradientTo || "#FF9800"}
                            onChange={(e) => setTickerForm({ ...tickerForm, gradientTo: e.target.value })}
                            placeholder="#FF9800"
                          />
                        </div>
                      </div>
                    </>
                  )}
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
                      Salvar Letreiro
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

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
                        targetWidth={1200}
                        targetHeight={400}
                      />
                      <p className="text-xs text-muted-foreground">
                        ✅ Imagem será padronizada automaticamente para 1200 x 400 px (panorâmica)
                      </p>
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