import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { trackingUrl } = await req.json();

        if (!trackingUrl) {
            return new Response(
                JSON.stringify({ error: "URL não fornecida" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log("Following redirect for:", trackingUrl);

        // Follow the redirect WITHOUT actually loading the page
        // We just want to see where it redirects to
        const response = await fetch(trackingUrl, {
            method: "HEAD",
            redirect: "manual", // Don't follow redirects, just get the Location header
        });

        // Check for redirect
        const location = response.headers.get("location");

        if (!location) {
            // Try GET request as some servers don't respond to HEAD
            const getResponse = await fetch(trackingUrl, {
                method: "GET",
                redirect: "manual",
            });

            const locationFromGet = getResponse.headers.get("location");

            if (locationFromGet) {
                console.log("Redirect location (GET):", locationFromGet);
                return new Response(
                    JSON.stringify({ redirectUrl: locationFromGet }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            return new Response(
                JSON.stringify({ error: "Não foi possível encontrar o redirecionamento" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log("Redirect location:", location);

        return new Response(
            JSON.stringify({ redirectUrl: location }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error("Error following redirect:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
