import { useMemo, useState } from "react";
import zapImg from "@/assets/zap-new.png";
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
          className="group fixed bottom-6 right-6 z-50 flex flex-col items-center"
          aria-label="Abrir chat via WhatsApp"
          title="WhatsApp"
        >
          {/* Label "Fale Conosco" */}
          <div className="absolute bottom-full mb-3 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-emerald-600 shadow-xl transition-all hover:scale-105">
            Fale Conosco
            <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white"></div>
          </div>

          {/* Button Container with Pulse */}
          <div className="relative flex items-center justify-center">
            {/* Pulse Ring */}
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-green-500/60 opacity-75 duration-1000" />

            {/* Main Button Image */}
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-[#25D366] shadow-2xl transition-transform hover:scale-110">
              <img
                src={zapImg}
                alt="WhatsApp"
                className="h-full w-full object-cover p-0"
                loading="lazy"
              />
            </div>
          </div>
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
