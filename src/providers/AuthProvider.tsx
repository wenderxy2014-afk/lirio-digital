import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "editor" | "member";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// SUPER ADMIN WHITELIST (Acesso Garantido)
const SUPER_ADMINS = [
  "wenderxy@outlook.com.br",
  "wenderxy2014@gmail.com",
  "ricardo@igreja.com" // Adicione outros se precisar
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Check Whitelist first (Instant Acess)
        const email = newSession.user.email;
        if (email && SUPER_ADMINS.some(admin => email.toLowerCase().includes(admin.toLowerCase()))) {
          console.log("💎 Super Admin Access Granted to:", email);
          setRoles(['admin', 'editor']); // Force roles
        } else {
          // Normal DB Check
          setTimeout(() => {
            (async () => {
              try {
                const { data } = await supabase
                  .from("user_roles")
                  .select("role")
                  .eq("user_id", newSession.user.id);
                setRoles((data?.map((r) => r.role) as AppRole[]) ?? []);
              } catch {
                setRoles([]);
              }
            })();
          }, 0);
        }
      } else {
        setRoles([]);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: existingSession } }) => {
        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          const email = existingSession.user.email;

          // Check Whitelist on Load
          if (email && SUPER_ADMINS.some(admin => email.toLowerCase().includes(admin.toLowerCase()))) {
            console.log("💎 Super Admin Access Restored (Load):", email);
            setRoles(['admin', 'editor']);
          } else {
            return supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", existingSession.user.id)
              .then(({ data }) => setRoles((data?.map((r) => r.role) as AppRole[]) ?? []));
          }
        }
      })
      .finally(() => setLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      roles,
      loading,
      signOut: async () => {
        try {
          // Clear local state immediately
          setSession(null);
          setUser(null);
          setRoles([]);

          // Sign out from Supabase with scope 'local' to clear session from storage
          await supabase.auth.signOut({ scope: 'local' });
        } catch (error) {
          console.error("Error signing out:", error);
        }
      },
    }),
    [session, user, roles, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function hasAnyRole(roles: AppRole[], allowed: AppRole[]) {
  return roles.some((r) => allowed.includes(r));
}
