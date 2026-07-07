import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Kerala district coordinates
const districtCoords: Record<string, { lat: number; lon: number }> = {
  Thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
  Kollam: { lat: 8.8932, lon: 76.6141 },
  Pathanamthitta: { lat: 9.2648, lon: 76.7870 },
  Alappuzha: { lat: 9.4981, lon: 76.3388 },
  Kottayam: { lat: 9.5916, lon: 76.5222 },
  Idukki: { lat: 9.8494, lon: 76.9719 },
  Ernakulam: { lat: 9.9816, lon: 76.2999 },
  Thrissur: { lat: 10.5276, lon: 76.2144 },
  Palakkad: { lat: 10.7867, lon: 76.6548 },
  Malappuram: { lat: 11.0510, lon: 76.0711 },
  Kozhikode: { lat: 11.2588, lon: 75.7804 },
  Wayanad: { lat: 11.6854, lon: 76.1320 },
  Kannur: { lat: 11.8745, lon: 75.3704 },
  Kasaragod: { lat: 12.4996, lon: 74.9869 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { district } = await req.json();
    const API_KEY = Deno.env.get("OPENWEATHERMAP_API_KEY");
    if (!API_KEY) throw new Error("OPENWEATHERMAP_API_KEY not configured");

    const coords = districtCoords[district] || districtCoords["Wayanad"];
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenWeatherMap error:", response.status, errText);
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Also get forecast for rain probability
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&cnt=8`
    );
    const forecastData = forecastRes.ok ? await forecastRes.json() : null;
    
    // Calculate rain probability from forecast
    let rainProbability = 0;
    let rainTime = "";
    if (forecastData?.list) {
      for (const item of forecastData.list) {
        if (item.pop > rainProbability) {
          rainProbability = item.pop;
          const date = new Date(item.dt * 1000);
          rainTime = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
        }
      }
    }

    const weather = {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6), // m/s to km/h
      condition: data.weather[0]?.main || "Clear",
      description: data.weather[0]?.description || "",
      icon: data.weather[0]?.icon || "01d",
      rainProbability: Math.round(rainProbability * 100),
      rainTime,
      feelsLike: Math.round(data.main.feels_like),
    };

    // Generate farmer advisory
    let advisory = "";
    let advisoryMl = "";
    if (weather.rainProbability > 60) {
      advisory = `Heavy rain expected${weather.rainTime ? ` around ${weather.rainTime}` : ""}. Avoid pesticide spraying.`;
      advisoryMl = `കനത്ത മഴ പ്രതീക്ഷിക്കുന്നു${weather.rainTime ? ` ${weather.rainTime} ന്` : ""}. കീടനാശിനി തളിക്കൽ ഒഴിവാക്കുക.`;
    } else if (weather.temp > 35) {
      advisory = "Extreme heat. Irrigate in the evening and provide shade for seedlings.";
      advisoryMl = "അതിശക്തമായ ചൂട്. വൈകുന്നേരം നനയ്ക്കുക, തൈകൾക്ക് തണൽ നൽകുക.";
    } else if (weather.humidity > 85) {
      advisory = "High humidity. Watch for fungal diseases. Ensure proper drainage.";
      advisoryMl = "ഉയർന്ന ഈർപ്പം. കുമിൾ രോഗങ്ങൾ ശ്രദ്ധിക്കുക. ഡ്രെയിനേജ് ഉറപ്പാക്കുക.";
    } else {
      advisory = "Good weather for farming activities. Ideal for field work.";
      advisoryMl = "കൃഷി പ്രവർത്തനങ്ങൾക്ക് നല്ല കാലാവസ്ഥ. വയൽ ജോലിക്ക് അനുയോജ്യം.";
    }

    return new Response(JSON.stringify({ ...weather, advisory, advisoryMl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Weather function error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
