 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/providers/AuthProvider";
 
 export type PermissionModule =
   | "home_cms"
   | "events"
   | "cells"
   | "devotionals"
   | "studies"
   | "missions"
   | "departments"
   | "kids"
   | "testimonials"
   | "ebd_daily"
   | "settings"
   | "users";
 
 export function usePermissions(module: PermissionModule) {
   const { user, roles } = useAuth();
 
   return useQuery({
     queryKey: ["permissions", user?.id, module],
     queryFn: async () => {
       // If user is admin, grant all permissions
       if (roles.includes("admin")) {
         return {
           canRead: true,
           canWrite: true,
           canDelete: true,
         };
       }
 
       // If not authenticated or not an editor, deny all
       if (!user || !roles.includes("editor")) {
         return {
           canRead: false,
           canWrite: false,
           canDelete: false,
         };
       }
 
       // For editors, check specific permissions
       const { data, error } = await supabase
         .from("admin_permissions")
         .select("can_read, can_write, can_delete")
         .eq("user_id", user.id)
         .eq("module", module)
         .maybeSingle();
 
       if (error) {
         console.error("Error fetching permissions:", error);
         return {
           canRead: false,
           canWrite: false,
           canDelete: false,
         };
       }
 
       if (!data) {
         // No specific permission found, deny by default
         return {
           canRead: false,
           canWrite: false,
           canDelete: false,
         };
       }
 
       return {
         canRead: data.can_read ?? false,
         canWrite: data.can_write ?? false,
         canDelete: data.can_delete ?? false,
       };
     },
     enabled: !!user,
     staleTime: 1000 * 60 * 5, // Cache for 5 minutes
   });
 }