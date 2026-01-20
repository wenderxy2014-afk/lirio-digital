import { SiteLayout } from "@/components/site/SiteLayout";
import { HomeAudioToggle } from "@/components/site/HomeAudioToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, HeartHandshake, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useCells, useEvents, useSettings } from "@/data/queries";
import { motion, useReducedMotion } from "framer-motion";
import { usePointerGlow } from "@/hooks/usePointerGlow";
import heroVideo from "@/assets/hero-bg.mp4";
import homeCardsVideo from "@/assets/home-cards-bg.mp4";
import igrejaBg from "@/assets/igreja-bg.png";

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
              <p className="text-sm/6 font-semibold">Bem-vindo(a)</p>
              <HomeAudioToggle />
            </div>
            <h1 className="mt-2 text-balance font-display text-4xl font-bold tracking-tight md:text-5xl">
              Um lugar para pertencer, crescer e servir.
            </h1>
            <p className="mt-4 max-w-prose text-base/7 font-medium">
              Acompanhe nossos cultos e eventos, encontre uma célula perto de você e participe da vida da igreja.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="gradient" size="xl">
                <NavLink to="/cultos">
                  Cultos & Eventos <ArrowRight />
                </NavLink>
              </Button>
              <Button asChild variant="soft" size="xl">
                <NavLink to="/celulas">
                  Células <Users />
                </NavLink>
              </Button>
              <Button asChild variant="soft" size="xl">
                <NavLink to="/ofertas">
                  Ofertas <HeartHandshake />
                </NavLink>
              </Button>
              <Button asChild variant="soft" size="xl">
                <NavLink to="/membro">Área do Membro</NavLink>
              </Button>
            </div>

            {settings?.live_stream_url && (
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
                src={heroVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Vídeo de fundo do hero"
              />
              <div className="absolute inset-0 bg-background/10" />
              <div className="relative z-10 grid h-full place-items-end p-6">
                <div className="max-w-xs rounded-2xl bg-background/20 p-4 text-left ring-1 ring-white/30 backdrop-blur-sm">
                  <div className="font-display text-lg font-bold text-primary-foreground">Bem-vindo(a)!</div>
                  <p className="mt-1 text-sm font-medium text-primary-foreground">
                    Você na página da IBLVBH uma igreja que se importa.
                  </p>
                </div>
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
          <h2 className="font-display text-2xl">Próximos passos</h2>
          <p className="mt-2 text-muted-foreground">
            Ajuste textos oficiais, contatos e adicione imagens reais. O admin permite cadastrar conteúdo e moderar testemunhos.
          </p>
        </motion.div>
      </section>

      <section className="mt-16">
        <div className="relative overflow-hidden rounded-3xl border bg-card shadow-lift">
          <img
            src={igrejaBg}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/70" />
          <div className="relative z-10 p-8 md:p-10">
            <div className="max-w-prose">
              <h2 className="font-display text-2xl">Lírio dos Vales • Belo Horizonte</h2>
              <p className="mt-2 text-muted-foreground">Uma igreja em células.</p>
            </div>
          </div>
          <div className="relative z-10 h-40 md:h-52" />
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;
