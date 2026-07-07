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
    const { district, crop } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a Kerala agricultural market analyst. Provide current market price data and a short prediction for Kerala crops.

District: ${district || "Wayanad"}
${crop ? `Focus crop: ${crop}` : "Include all major Kerala crops"}

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "prices": [
    {
      "crop": "Coconut",
      "cropMl": "തെങ്ങ",
      "unit": "per kg",
      "price": 32,
      "trend": "up",
      "changePercent": 5,
      "prediction": "Prices expected to rise 3-5% next month due to festival demand",
      "predictionMl": "ഉത്സവ ഡിമാൻഡ് കാരണം അടുത്ത മാസം 3-5% വില ഉയരും"
    }
  ],
  "advisory": "Best time to sell coconut and rubber. Hold ginger for better prices.",
  "advisoryMl": "തേങ്ങയും റബ്ബറും വിൽക്കാൻ നല്ല സമയം. ഇഞ്ചി നല്ല വിലയ്ക്ക് സൂക്ഷിക്കുക."
}

Include these Kerala crops: Coconut, Rubber, Rice, Banana, Black Pepper, Cardamom, Ginger, Tapioca, Arecanut, Coffee. Use realistic Kerala market prices in INR.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";
    
    // Parse JSON from AI response
    let marketData;
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      marketData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error("Failed to parse market data:", content);
      marketData = { prices: [], advisory: "Unable to fetch market data", advisoryMl: "മാർക്കറ്റ് ഡാറ്റ ലഭിച്ചില്ല" };
    }

    return new Response(JSON.stringify(marketData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Market prices error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
