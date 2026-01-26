import { SiteLayout } from "@/components/site/SiteLayout";
import { HomeAudioToggle } from "@/components/site/HomeAudioToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, HeartHandshake, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useCells, useEvents, useSettings, useAllHomeContent } from "@/data/queries";
import { useAuth } from "@/providers/AuthProvider";
import { MemberAuthDialog } from "@/components/site/MemberAuthDialog";
import { motion, useReducedMotion } from "framer-motion";
import { usePointerGlow } from "@/hooks/usePointerGlow";
import heroVideo from "@/assets/hero-bg.mp4";
import homeCardsVideo from "@/assets/home-cards-bg.mp4";
import igrejaBg from "@/assets/igreja-bg.png";
import bannerFamilia from "@/assets/banner-familia.png";
import bannerMaturidade from "@/assets/banner-maturidade.png";
import bannerHomens from "@/assets/banner-homens.png";
import bannerCeia from "@/assets/banner-ceia.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const Index = () => {
  const reduceMotion = useReducedMotion();
  const glow = usePointerGlow();
  const { data: settings } = useSettings();
  const { data: events } = useEvents();
  const { data: cells } = useCells();
  const { data: homeContent } = useAllHomeContent();
  const { user } = useAuth();

  // Extract content with fallbacks
  const heroData = (homeContent?.hero as any) || {
    welcome_text: "Bem-vindo(a)",
    title: "Um lugar para pertencer, crescer e servir.",
    subtitle: "Acompanhe nossos cultos e eventos, encontre uma célula perto de você e participe da vida da igreja.",
    video_url: heroVideo,
    show_audio_toggle: true,
    show_live_stream: true,
  };

  const buttonsData = ((homeContent?.buttons as any)?.buttons) || [
    { label: "Cultos & Eventos", url: "/cultos", variant: "gradient" },
    { label: "Células", url: "/celulas", variant: "soft" },
    { label: "Ofertas", url: "/ofertas", variant: "soft" },
  ];

  const carouselData = ((homeContent?.carousel as any)?.slides) || [
    { image_url: bannerFamilia, alt_text: "Culto da Família", order: 1 },
    { image_url: bannerMaturidade, alt_text: "Cultura da Maturidade", order: 2 },
    { image_url: bannerHomens, alt_text: "Culto da Rede de Homens", order: 3 },
    { image_url: bannerCeia, alt_text: "A Ceia do Senhor", order: 4 },
  ];

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
  };

  // Resolve image URLs (handle both asset paths and storage URLs)
  const resolvedCarouselData = carouselData.map((slide: any) => {
    const imageUrl = slide.image_url;

    // If it's a local asset path, resolve it from the map
    if (imageUrl && assetMap[imageUrl]) {
      return { ...slide, image_url: assetMap[imageUrl] };
    }

    // If it's already a full URL (from Supabase Storage), use as-is
    return slide;
  });

  const textsData = (homeContent?.texts as any) || {
    next_steps_title: "Próximos passos",
    next_steps_description: "Ajuste textos oficiais, contatos e adicione imagens reais. O admin permite cadastrar conteúdo e moderar testemunhos.",
  };

  // Resolve video URL (handle both paths and imports)
  const videoUrl = typeof heroData.video_url === 'string' && heroData.video_url.startsWith('hero-bg')
    ? heroVideo
    : heroData.video_url;

  return (
    <SiteLayout>
      <section
        className="relative overflow-hidden rounded-3xl border bg-brand p-8 text-primary-foreground shadow-glow md:p-12"
        style={{
          ...glow.style,
          backgroundImage:
            "radial-gradient(900px circle at var(--glow-x, 50%) var(--glow-y, 30%), rgba(255,255,255,0.22), transparent 40%), var(--brand-gradient)",
        }}
      >
        <div className="relative z-10 grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm/6 font-semibold">{heroData.welcome_text}</p>
              {heroData.show_audio_toggle && <HomeAudioToggle />}
            </div>
            <h1 className="mt-2 text-balance font-display text-4xl font-bold tracking-tight md:text-5xl">
              {heroData.title}
            </h1>
            <p className="mt-4 max-w-prose text-base/7 font-medium">
              {heroData.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {buttonsData.map((button: any, index: number) => (
                <Button key={index} asChild variant={button.variant as any} size="xl">
                  <NavLink to={button.url}>
                    {button.label}
                  </NavLink>
                </Button>
              ))}
              {user ? (
                <Button asChild variant="soft" size="xl">
                  <NavLink to="/membro">Área do Membro</NavLink>
                </Button>
              ) : (
                <MemberAuthDialog>
                  <Button variant="soft" size="xl">
                    Área do Membro
                  </Button>
                </MemberAuthDialog>
              )}
            </div>

            {heroData.show_live_stream && settings?.live_stream_url && (
              <div className="mt-6 overflow-hidden rounded-2xl bg-brand p-5 shadow-glow">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base font-bold text-primary-foreground">
                    Transmissão ao vivo
                    <span className="ml-2 align-middle pulse inline-block h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                  <span className="hidden rounded-xl bg-background/20 px-4 py-1.5 text-sm font-semibold text-primary-foreground ring-1 ring-white/30 md:inline-block">
                    Ao vivo
                  </span>
                </div>
                <a
                  className="mt-3 inline-flex items-center gap-2 text-base font-bold text-primary-foreground brand-underline"
                  href={settings.live_stream_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Acessar culto online <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-background/10 ring-1 ring-white/20">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Vídeo de fundo do hero"
              />
              <div className="absolute inset-0 bg-background/10" />
              <div className="relative z-10 grid h-full place-items-end p-6">
                {/* Texto removido conforme solicitado */}
              </div>
            </div>
            {!reduceMotion && (
              <motion.div
                className="pointer-events-none absolute -bottom-6 -right-6 hidden h-28 w-28 rounded-3xl bg-background/10 ring-1 ring-white/20 md:block"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>
        </div>
      </section>

      <section className="relative mt-12 overflow-hidden rounded-3xl border bg-card p-6 shadow-lift md:p-8">
        <video
          className="pointer-events-none absolute inset-0 z-20 h-full w-full object-cover opacity-40"
          src={homeCardsVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Vídeo de fundo da seção de destaques"
        />
        <div className="pointer-events-none absolute inset-0 z-30 bg-background/10" />

        <div className="relative z-10 grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Calendar className="h-5 w-5 text-primary" /> Próximos eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <ul className="space-y-3">
                {(events ?? []).slice(0, 3).map((e) => (
                  <li key={e.id} className="rounded-xl bg-brand-soft p-3">
                    <div className="font-medium">{e.title}</div>
                    <div className="text-sm text-muted-foreground">{e.location ?? "Local a confirmar"}</div>
                  </li>
                ))}
                {(!events || events.length === 0) && (
                  <li className="rounded-xl bg-brand-soft p-3 text-sm text-muted-foreground">
                    Nenhum evento cadastrado ainda.
                  </li>
                )}
              </ul>
              <div className="mt-4">
                <Button asChild variant="soft" size="sm">
                  <NavLink to="/cultos">Ver agenda</NavLink>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Users className="h-5 w-5 text-primary" /> Encontre uma célula
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <p className="text-sm text-muted-foreground">
                Células são encontros durante a semana para comunhão, cuidado e crescimento.
              </p>
              <div className="mt-4 space-y-2">
                {(cells ?? []).slice(0, 2).map((c) => (
                  <div key={c.id} className="rounded-xl bg-brand-soft p-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {c.meeting_day ?? "Dia"} • {c.meeting_time ?? "Horário"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild variant="brand" size="sm">
                  <NavLink to="/celulas">Ver todas</NavLink>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <HeartHandshake className="h-5 w-5 text-primary" /> Contribua
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <p className="text-sm text-muted-foreground">
                Ofertas e dízimos ajudam a manter nosso trabalho e alcançar mais vidas.
              </p>
              <div className="mt-4">
                <Button asChild variant="brand" size="sm">
                  <NavLink to="/ofertas">Ofertar</NavLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-14">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-3xl border bg-card p-8 shadow-lift"
        >
          <h2 className="font-display text-2xl">{textsData.next_steps_title}</h2>
          <p className="mt-2 text-muted-foreground">
            {textsData.next_steps_description}
          </p>
        </motion.div>
      </section>

      <section className="mt-16">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 6000,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {resolvedCarouselData
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((slide: any, index: number) => (
                <CarouselItem key={index}>
                  {slide.link ? (
                    <a
                      href={slide.link}
                      target={slide.link.startsWith("http") ? "_blank" : "_self"}
                      rel={slide.link.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="block relative overflow-hidden rounded-3xl border shadow-lift w-full aspect-video bg-background transition-all hover:ring-2 hover:ring-primary hover:opacity-95"
                    >
                      <img
                        src={slide.image_url}
                        alt={slide.alt_text}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="relative overflow-hidden rounded-3xl border shadow-lift w-full aspect-video bg-background">
                      <img
                        src={slide.image_url}
                        alt={slide.alt_text}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </CarouselItem>
              ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </section>
    </SiteLayout>
  );
};

export default Index;
