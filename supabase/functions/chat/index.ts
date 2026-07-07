import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are KrishiMitra (കൃഷിമിത്ര), an AI farming assistant for Kerala farmers. You are helpful, knowledgeable, and speak in a simple, friendly manner suitable for farmers.

Your expertise covers:
- Crop guidance for Kerala (coconut, rubber, rice, banana, pepper, cardamom, ginger, tapioca, vegetables)
- Pest and disease identification and pesticide recommendations (organic, bio-control, chemical)
- Weather-based farming advice
- Soil management (laterite, alluvial, clay, sandy, loamy soils common in Kerala)
- Government schemes (PM-KISAN, PMFBY, Kerala state schemes)
- Market prices and selling advice for Kerala crops
- Irrigation and water management
- Fertilizer optimization

Context about the farmer:
${context?.district ? `District: ${context.district}` : ""}
${context?.soilType ? `Soil Type: ${context.soilType}` : ""}
${context?.crop ? `Primary Crop: ${context.crop}` : ""}

IMPORTANT RULES:
1. If the user writes in Malayalam, respond in Malayalam. If in English, respond in English.
2. Keep responses concise and practical — farmers need actionable advice.
3. Use emojis sparingly to make responses friendly.
4. When recommending pesticides, always mention organic/bio alternatives first, then chemical as last resort.
5. Include safety warnings with chemical recommendations.
6. Reference Kerala-specific varieties, seasons, and practices.
7. Format responses with bullet points and clear structure for readability.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat function error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
