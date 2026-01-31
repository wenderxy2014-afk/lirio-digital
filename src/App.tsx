import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { RequireAuth, RequireRole } from "@/components/auth/RouteGuards";
import { AuthHashRedirect } from "@/components/auth/AuthHashRedirect";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/Auth";
import EventsPage from "@/pages/Events";
import CellsPage from "@/pages/Cells";
import MissionsPage from "@/pages/Missions";
import DepartmentsPage from "@/pages/Departments";
import KidsPage from "@/pages/Kids";
import TestimonialsPage from "@/pages/Testimonials";
import OfferingsPage from "@/pages/Offerings";
import EbdPage from "@/pages/Ebd";

import MemberHomePage from "@/pages/member/MemberHome";
import DevotionalsPage from "@/pages/member/Devotionals";
import DevotionalDetailPage from "@/pages/member/DevotionalDetail";
import StudiesPage from "@/pages/member/Studies";
import StudyDetailPage from "@/pages/member/StudyDetail";

import AdminHomePage from "@/pages/admin/AdminHome";
import AdminSettingsPage from "@/pages/admin/AdminSettings";
import AdminContentPage from "@/pages/admin/AdminContent";
import AdminSetupPage from "@/pages/admin/Setup";
import AdminUsersPage from "@/pages/admin/Users";
import AdminHomeCMSPage from "@/pages/admin/HomeCMS";
import AdminDevotionalAIPage from "@/pages/admin/DevotionalAI";
import ResetPasswordPage from "@/pages/auth/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AuthHashRedirect />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cultos" element={<EventsPage />} />
            <Route path="/ebd" element={<EbdPage />} />
            <Route path="/celulas" element={<CellsPage />} />
            <Route path="/missoes" element={<MissionsPage />} />
            <Route path="/departamentos" element={<DepartmentsPage />} />
            <Route path="/kids" element={<KidsPage />} />
            <Route path="/testemunhos" element={<TestimonialsPage />} />
            <Route path="/ofertas" element={<OfferingsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin/setup" element={<AdminSetupPage />} />

            <Route element={<RequireAuth />}>
              <Route path="/membro" element={<MemberHomePage />} />
              <Route path="/membro/devocionais" element={<DevotionalsPage />} />
              <Route path="/membro/devocionais/:id" element={<DevotionalDetailPage />} />
              <Route path="/membro/estudos" element={<StudiesPage />} />
              <Route path="/membro/estudos/:id" element={<StudyDetailPage />} />
            </Route>

            <Route element={<RequireRole allowed={["admin", "editor"]} />}>
              <Route path="/admin" element={<AdminHomePage />} />
              <Route path="/admin/conteudo" element={<AdminContentPage />} />
              <Route path="/admin/configuracoes" element={<AdminSettingsPage />} />
              <Route path="/admin/usuarios" element={<AdminUsersPage />} />
              <Route path="/admin/home-cms" element={<AdminHomeCMSPage />} />
              <Route path="/admin/devocional-ia" element={<AdminDevotionalAIPage />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

