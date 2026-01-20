import { z } from "zod";

export const authSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido").max(255),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(72),
});

export const cellInterestSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(120),
  phone: z.string().trim().min(1, "Informe seu telefone").max(40),
  neighborhood: z.string().trim().max(120).optional().or(z.literal("")),
});

export const testimonialSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(10).max(4000).optional().or(z.literal("")),
  video_url: z.string().trim().url().optional().or(z.literal("")),
  person_name: z.string().trim().max(120).optional().or(z.literal("")),
});
