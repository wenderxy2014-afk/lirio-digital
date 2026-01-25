import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import logo from "@/assets/iblv-logo.png";
import { LogIn, UserPlus } from "lucide-react";

interface MemberAuthDialogProps {
  children: React.ReactNode;
}

export function MemberAuthDialog({ children }: MemberAuthDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px] overflow-hidden">
        {/* Background Logo */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <img src={logo} alt="" className="w-64 h-64 grayscale" />
        </div>

        <div className="relative z-10">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 shadow-inner">
              <img src={logo} alt="Logo IBLV" className="h-10 w-10" />
            </div>
            <DialogTitle className="font-display text-2xl">Portal do Membro</DialogTitle>
            <DialogDescription>
              Acesse sua conta ou realize seu cadastro no portal oficial da nossa igreja.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 flex flex-col gap-4">
            <Button
              asChild
              variant="brand"
              size="lg"
              className="h-14 w-full text-lg shadow-glow-sm hover:translate-y-[-2px] transition-all duration-300"
            >
              <a
                href="https://app.enuves.com/authentication/login?returnUrl=%2Fdashboard%2Foverview"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3"
              >
                <LogIn className="w-5 h-5" />
                Fazer Login
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 w-full text-lg border-2 hover:bg-brand/5 hover:border-brand/50 hover:translate-y-[-2px] transition-all duration-300"
            >
              <a
                href="https://app.enuves.com/institutions/92340/people/register"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3"
              >
                <UserPlus className="w-5 h-5" />
                Fazer Cadastro
              </a>
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Você será redirecionado para a plataforma <span className="font-semibold">Enuves</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
