import { useMemo, useState } from "react";
import zapImg from "@/assets/zap.png";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WHATSAPP_NUMBER_E164 = "5531994231888";

function buildWhatsAppUrl(message: string) {
  const text = message.trim();
  const base = `https://wa.me/${WHATSAPP_NUMBER_E164}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function WhatsAppFloatingChat() {
  const [message, setMessage] = useState(
    "Olá! Vim pelo site da Igreja Batista Lírio dos Vales e gostaria de falar com vocês.",
  );

  const href = useMemo(() => buildWhatsAppUrl(message), [message]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group fixed bottom-6 right-6 z-50"
          aria-label="Abrir chat via WhatsApp"
          title="WhatsApp"
        >
          <span className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-xl transition-opacity group-hover:opacity-80" />
          <span className="absolute -inset-1 -z-10 rounded-full bg-primary/15 animate-[pulse_2.2s_ease-in-out_infinite]" />
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border bg-background/60 shadow-glow backdrop-blur transition-transform group-hover:scale-[1.03] active:scale-[0.98]">
            <img
              src={zapImg}
              alt="WhatsApp"
              className="h-8 w-8"
              loading="lazy"
            />
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-display">WhatsApp</DialogTitle>
          <DialogDescription>
            Envie uma mensagem e abriremos o WhatsApp para você continuar o atendimento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="min-h-[120px]"
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="brand" className="w-full sm:w-auto">
              <a href={href} target="_blank" rel="noreferrer">
                Enviar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
