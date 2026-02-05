import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import logo from "@/assets/iblv-logo.png";
import { useAuth, hasAnyRole } from "@/providers/AuthProvider";
import { MemberAuthDialog } from "./MemberAuthDialog";
import { AdminLoginDialog } from "./AdminLoginDialog";

const nav = [
  { to: "/", label: "Início" },
  { to: "/cultos", label: "Cultos & Eventos" },
  { to: "/celulas", label: "Células" },
  { to: "/missoes", label: "Missões" },
  { to: "/kids", label: "Kids" },
  { to: "/testemunhos", label: "Testemunhos" },
  { to: "/ofertas", label: "Ofertas" },
];

export function SiteHeader() {
  const { user, roles, signOut } = useAuth();
  const canAdmin = hasAnyRole(roles, ["admin", "editor"]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand shadow-glow">
            <img src={logo} alt="Símbolo da Igreja Batista Lírio dos Vales" className="h-6 w-6" />
          </span>
          <div className="text-left leading-tight">
            <div className="font-display text-sm tracking-tight">Igreja Batista</div>
            <div className="font-display text-base">Lírio dos Vales</div>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="text-lg font-bold text-muted-foreground/80 transition-colors hover:text-primary brand-underline"
              activeClassName="text-primary font-extrabold"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {canAdmin ? (
                <Button asChild className="bg-green-600 hover:bg-green-700 text-white border-green-700" size="sm">
                  <NavLink to="/admin">Painel Ativo</NavLink>
                </Button>
              ) : (
                <Button asChild variant="soft" size="sm">
                  <NavLink to="/membro">Área do Membro</NavLink>
                </Button>
              )}

              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" size="sm" onClick={() => void signOut()}>
                Sair
              </Button>
            </>
          ) : (
            <>
              {/* Botão administrativo discreto para quem não está logado */}
              <div className="hidden md:block">
                <AdminLoginDialog>
                  <button className="text-muted-foreground/30 hover:text-primary transition-colors p-2" title="Acesso Administrativo">
                    <ShieldCheck className="h-4 w-4" />
                  </button>
                </AdminLoginDialog>
              </div>
              <MemberAuthDialog>
                <Button variant="brand" size="sm">
                  Membros
                </Button>
              </MemberAuthDialog>
            </>
          )}
        </div>
      </div>

      <nav className="border-t bg-background/60 md:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-1 px-2 py-2">
          {nav.slice(0, 6).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="rounded-lg px-2 py-2 text-center text-sm text-muted-foreground"
              activeClassName="bg-accent text-foreground"
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
