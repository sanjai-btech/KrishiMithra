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
    const { imageUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a plant disease and pest detection expert for Kerala agriculture. Analyze the plant image and provide:

1. **Disease/Pest Identified**: Name of the disease or pest (in English and Malayalam)
2. **Severity**: Low, Medium, or High
3. **Affected Crop**: What crop is this
4. **Symptoms**: What symptoms are visible
5. **Recommended Pesticides**: Provide 3-4 recommendations in this order:
   - Organic solution first
   - Bio-control agent
   - Chemical (as last resort)
   
For each pesticide, provide:
- Name (English + Malayalam)
- Type: organic/bio/chemical
- Dosage
- Safety instructions
- Risk level: low/medium/high

Format your response as JSON with this structure:
{
  "disease": "Disease name",
  "diseaseMl": "Malayalam name",
  "severity": "low|medium|high",
  "crop": "Crop name",
  "cropMl": "Malayalam crop name",
  "symptoms": "Description",
  "symptomsMl": "Malayalam description",
  "pesticides": [
    {
      "name": "Pesticide name",
      "nameMl": "Malayalam name",
      "type": "organic|bio|chemical",
      "target": "What it treats",
      "targetMl": "Malayalam",
      "dosage": "How to apply",
      "dosageMl": "Malayalam",
      "safety": "Safety info",
      "safetyMl": "Malayalam",
      "risk": "low|medium|high"
    }
  ]
}

ONLY respond with valid JSON. No markdown, no extra text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this plant image for diseases and pests. Provide pesticide recommendations." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";
    
    // Try to parse JSON from the response
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { error: "Could not parse AI response", raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Analyze plant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
