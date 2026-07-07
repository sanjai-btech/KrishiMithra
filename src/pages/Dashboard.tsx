import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Cloud, Droplets, Bug, Beaker, Sprout, TrendingUp,
  Sun, Wind, ThermometerSun, AlertTriangle,
  ArrowRight, Brain, Cpu, ShieldCheck, Camera,
  MapPin, ChevronDown, Landmark, Bell, MessageCircle,
  Loader2,
} from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import AgentBadge from "@/components/AgentBadge";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";

const keralaDistricts = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
  "Kozhikode", "Wayanad", "Kannur", "Kasaragod",
];

const keralaSoilTypes = [
  { en: "Laterite", ml: "ലാറ്ററൈറ്റ്" },
  { en: "Alluvial", ml: "എക്കൽ" },
  { en: "Clayey", ml: "കളിമണ്ണ്" },
  { en: "Sandy", ml: "മണൽ" },
  { en: "Loamy", ml: "ലോമി" },
];

interface WeatherData {
  temp: number;
  humidity: number;
  wind: number;
  condition: string;
  rainProbability: number;
  rainTime: string;
  advisory: string;
  advisoryMl: string;
}

interface MarketPrice {
  crop: string;
  cropMl: string;
  unit: string;
  price: number;
  trend: string;
  changePercent: number;
  prediction: string;
  predictionMl: string;
}

interface MarketData {
  prices: MarketPrice[];
  advisory: string;
  advisoryMl: string;
}

// OpenWeather Helper
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [district, setDistrict] = useState("Wayanad");
  const [districtOpen, setDistrictOpen] = useState(false);
  const [soilType, setSoilType] = useState("Laterite");
  const [soilOpen, setSoilOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [marketLoading, setMarketLoading] = useState(true);

  const agents = [
    { icon: Cloud, label: t("Weather Agent", "കാലാവസ്ഥ ഏജന്റ്") },
    { icon: Sprout, label: t("Crop Agent", "വിള ഏജന്റ്") },
    { icon: Bug, label: t("Pest Agent", "കീട ഏജന്റ്") },
    { icon: TrendingUp, label: t("Market Agent", "വിപണി ഏജന്റ്") },
    { icon: Brain, label: t("Decision Agent", "തീരുമാന ഏജന്റ്") },
    { icon: MessageCircle, label: t("Chat Agent", "ചാറ്റ് ഏജന്റ്") },
  ];

  // Fetch weather using OpenWeatherMap API
  // Fetch weather using OpenWeatherMap API
  useEffect(() => {
    const fetchWeather = async () => {
      console.log("Fetching weather for:", district);
      setWeatherLoading(true);
      try {
        // Updated URL to be more reliable with district names
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${district},India&units=metric&appid=${OPENWEATHER_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error Details:", errorData);
          throw new Error("Weather fetch failed");
        }
        
        const data = await response.json();
        console.log("API Data Received:", data);

        // Logic for dynamic advisories based on weather conditions
        const isHumid = data.main.humidity > 80;
        const willRain = data.rain ? true : false;

        setWeather({
          temp: Math.round(data.main.temp),
          humidity: data.main.humidity,
          wind: Math.round(data.wind.speed * 3.6), // Converts m/s to km/h
          condition: data.weather[0].main,
          rainProbability: data.rain ? 85 : 10,
          rainTime: "Today",
          advisory: willRain 
            ? "Rain expected soon. Avoid pesticide spraying." 
            : isHumid 
              ? "High humidity detected. Monitor for fungal growth." 
              : "Weather is clear. Good for field work.",
          advisoryMl: willRain 
            ? "മഴയ്ക്ക് സാധ്യതയുണ്ട്. കീടനാശിനി തളിക്കുന്നത് ഒഴിവാക്കുക." 
            : isHumid 
              ? "ഉയർന്ന ആർദ്രത. കുമിൾബാധ ശ്രദ്ധിക്കുക." 
              : "കാലാവസ്ഥ തെളിഞ്ഞതാണ്. കൃഷിപ്പണികൾക്ക് അനുയോജ്യം.",
        });
      } catch (e) {
        console.error("OpenWeather API error:", e);
        // Fallback data if API fails
        setWeather({
          temp: 31,
          humidity: 78,
          wind: 12,
          condition: "Cloudy",
          rainProbability: 65,
          rainTime: "Evening",
          advisory: "Moderate rain expected. Avoid pesticide spraying.",
          advisoryMl: "മിതമായ മഴയ്ക്ക് സാധ്യത. കീടനാശിനി തളിക്കുന്നത് ഒഴിവാക്കുക.",
        });
      } finally {
        setWeatherLoading(false);
      }
    };

    if (district) fetchWeather();
  }, [district]);// This ensures it runs every time district changes
  // Fetch market prices
  useEffect(() => {
    const fetchMarket = async () => {
      setMarketLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("market-prices", {
          body: { district },
        });
        if (error) throw error;
        setMarketData(data);
      } catch (e) {
        console.error("Market fetch error:", e);
        setMarketData({
          prices: [
            { crop: "Coconut", cropMl: "തേങ്ങ", unit: "per kg", price: 32, trend: "up", changePercent: 5, prediction: "", predictionMl: "" },
            { crop: "Rubber", cropMl: "റബ്ബർ", unit: "per kg", price: 185, trend: "down", changePercent: 2, prediction: "", predictionMl: "" },
            { crop: "Black Pepper", cropMl: "കുരുമുളക്", unit: "per kg", price: 520, trend: "up", changePercent: 3, prediction: "", predictionMl: "" },
          ],
          advisory: "Good time to sell coconut", advisoryMl: "തേങ്ങ വിൽക്കാൻ നല്ല സമയം",
        });
      } finally {
        setMarketLoading(false);
      }
    };
    fetchMarket();
  }, [district]);

  const topPrices = marketData?.prices?.slice(0, 3) || [];

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t("Good morning, Farmer 🌿", "സുപ്രഭാതം, കർഷകൻ 🌿")}</p>
          <h1 className="text-xl font-extrabold text-foreground">{t("KrishiMitra Dashboard", "കൃഷിമിത്ര ഡാഷ്‌ബോർഡ്")}</h1>
        </div>
        <LangToggle />
      </motion.div>

      {/* District & Soil Dropdowns */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {/* District */}
        <div className="relative">
          <button
            onClick={() => { setDistrictOpen(!districtOpen); setSoilOpen(false); }}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary"
          >
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{district}</span>
            <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform ${districtOpen ? "rotate-180" : ""}`} />
          </button>
          {districtOpen && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
              {keralaDistricts.map((d) => (
                <button key={d} onClick={() => { setDistrict(d); setDistrictOpen(false); }}
                  className={`block w-full px-4 py-3 text-left text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-primary/10 ${d === district ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}>
                  {d}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Soil Type */}
        <div className="relative">
          <button
            onClick={() => { setSoilOpen(!soilOpen); setDistrictOpen(false); }}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary"
          >
            <Sprout className="h-4 w-4 shrink-0 text-secondary" />
            <span className="truncate">{lang === "ml" ? keralaSoilTypes.find(s => s.en === soilType)?.ml || soilType : soilType}</span>
            <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform ${soilOpen ? "rotate-180" : ""}`} />
          </button>
          {soilOpen && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-card shadow-lg">
              {keralaSoilTypes.map((s) => (
                <button key={s.en} onClick={() => { setSoilType(s.en); setSoilOpen(false); }}
                  className={`block w-full px-4 py-3 text-left text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-primary/10 ${s.en === soilType ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}>
                  {lang === "ml" ? s.ml : s.en}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* AI Agents */}
      <div className="mb-5 flex flex-wrap gap-2">
        {agents.map((a) => (
          <AgentBadge key={a.label} icon={a.icon} label={a.label} />
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {/* Weather - Dynamic */}
        <FeatureCard
          icon={Cloud}
          title={t("Weather Intelligence", "കാലാവസ്ഥ ഇന്റലിജൻസ്")}
          subtitle={t(`Live forecast for ${district}`, `${district} പ്രവചനം`)}
          accentColor="bg-info/15"
          iconColor="text-info"
        >
          {weatherLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-info" />
              <span className="text-xs text-muted-foreground">{t("Fetching weather...", "കാലാവസ്ഥ ലഭിക്കുന്നു...")}</span>
            </div>
          ) : weather ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Sun className="h-4 w-4 text-accent" />
                    <span className="text-lg font-bold text-foreground">{weather.temp}°C</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Wind className="h-3.5 w-3.5" /> {weather.wind} km/h
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ThermometerSun className="h-3.5 w-3.5" /> {weather.humidity}%
                  </div>
                </div>
                {weather.rainProbability > 30 && (
                  <div className="rounded-lg bg-info/10 px-2 py-1 text-[11px] font-bold text-info">
                    🌧 {weather.rainProbability}% {t("rain", "മഴ")}
                  </div>
                )}
              </div>
              <div className="rounded-lg bg-info/5 px-3 py-2 text-xs text-info font-medium">
                💡 {lang === "ml" ? weather.advisoryMl : weather.advisory}
              </div>
            </div>
          ) : null}
        </FeatureCard>

        {/* Smart Irrigation */}
        <FeatureCard
          icon={Droplets}
          title={t("Smart Irrigation", "സ്മാർട്ട് ജലസേചനം")}
          subtitle={t("Water management advisor", "ജല മാനേജ്മെന്റ്")}
          accentColor="bg-success/15"
          iconColor="text-success"
          onClick={() => navigate("/irrigation")}
        >
          <div className="flex items-center justify-between">
            {weather && weather.rainProbability > 50 ? (
              <>
                <span className="text-sm font-semibold text-success">{t("✅ Skip irrigation today", "✅ ഇന്ന് നന വേണ്ട")}</span>
                <span className="rounded-lg bg-success/10 px-2 py-1 text-[11px] font-bold text-success">{t("Save 200L", "200L ലാഭം")}</span>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold text-warning">{t("💧 Irrigate in evening", "💧 വൈകുന്നേരം നനയ്ക്കുക")}</span>
                <span className="rounded-lg bg-warning/10 px-2 py-1 text-[11px] font-bold text-warning">{t("Low moisture", "കുറഞ്ഞ ഈർപ്പം")}</span>
              </>
            )}
          </div>
        </FeatureCard>

        {/* Pest & Disease */}
        <FeatureCard
          icon={Bug}
          title={t("Pest & Disease Doctor", "കീട ഡോക്ടർ")}
          subtitle={t("Risk assessment", "റിസ്ക് വിലയിരുത്തൽ")}
          accentColor="bg-warning/15"
          iconColor="text-warning"
          onClick={() => navigate("/pest-doctor")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-semibold text-warning">
                {weather && weather.humidity > 80
                  ? t("High Risk — Humid", "ഉയർന്ന റിസ്ക് — ഈർപ്പം")
                  : t("Medium Risk", "ഇടത്തരം റിസ്ക്")}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {weather && weather.humidity > 80
                ? t("Fungal alert", "കുമിൾ മുന്നറിയിപ്പ്")
                : t("Leaf blight alert", "ഇല കരിച്ചിൽ മുന്നറിയിപ്പ്")}
            </span>
          </div>
        </FeatureCard>

        {/* Fertilizer */}
        <FeatureCard
          icon={Beaker}
          title={t("Fertilizer Optimization", "വള ഒപ്റ്റിമൈസേഷൻ")}
          subtitle={t("Stage-based guidance", "ഘട്ട മാർഗ്ഗനിർദ്ദേശം")}
          accentColor="bg-accent/20"
          iconColor="text-accent-foreground"
          onClick={() => navigate("/fertilizer")}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              {soilType === "Laterite"
                ? t("Add lime + NPK 17-17-17", "കുമ്മായം + NPK 17-17-17 ചേർക്കുക")
                : t("Apply NPK 17-17-17", "NPK 17-17-17 ചേർക്കുക")}
            </span>
            <span className="rounded-lg bg-accent/20 px-2 py-1 text-[11px] font-bold text-accent-foreground">{t("₹850 saved", "₹850 ലാഭം")}</span>
          </div>
        </FeatureCard>

        {/* Crop Lifecycle */}
        <FeatureCard
          icon={Sprout}
          title={t("Crop Lifecycle", "വിള ജീവിതചക്രം")}
          subtitle={t("Growth tracking", "വളർച്ച ട്രാക്കിംഗ്")}
          accentColor="bg-primary/12"
          iconColor="text-primary"
        >
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>{t("Vegetative Stage", "സസ്യ ഘട്ടം")}</span>
              <span className="font-bold text-primary">65%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
              />
            </div>
          </div>
        </FeatureCard>

        {/* Market Intelligence */}
        <FeatureCard
          icon={TrendingUp}
          title={t("Market Intelligence", "വിപണി ഇന്റലിജൻസ്")}
          subtitle={t("Live price trends & predictions", "തത്സമയ വില ട്രെൻഡുകൾ")}
          accentColor="bg-secondary/15"
          iconColor="text-secondary"
          onClick={() => navigate("/market")}
        >
          {marketLoading ? (
            <div className="flex items-center gap-2 py-1">
              <Loader2 className="h-4 w-4 animate-spin text-secondary" />
              <span className="text-xs text-muted-foreground">{t("Loading prices...", "വിലകൾ ലോഡ്...")}</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                {topPrices.map((p) => (
                  <div key={p.crop} className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">{lang === "ml" ? p.cropMl : p.crop} ₹{p.price}/{p.unit?.replace("per ", "")}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${p.trend === "up" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                      {p.trend === "up" ? "↑" : "↓"} {p.changePercent}%
                    </span>
                  </div>
                ))}
              </div>
              {marketData?.advisory && (
                <p className="text-[11px] text-muted-foreground">
                  💡 {lang === "ml" ? marketData.advisoryMl : marketData.advisory}
                </p>
              )}
            </div>
          )}
        </FeatureCard>

        {/* Pesticide Predictor */}
        <FeatureCard
          icon={ShieldCheck}
          title={t("Pesticide Predictor", "കീടനാശിനി പ്രവചനം")}
          subtitle={t("Smart pest & disease solutions", "കീട & രോഗ പരിഹാരം")}
          accentColor="bg-warning/15"
          iconColor="text-warning"
          glowColor="bg-warning/20"
          onClick={() => navigate("/pesticides")}
        >
          <div className="flex items-center gap-3">
            <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-warning/40 bg-warning/5 transition-colors hover:border-warning hover:bg-warning/10">
              <input type="file" accept="image/*" className="hidden" onChange={() => navigate("/pesticides")} />
              <Camera className="h-5 w-5 text-warning" />
            </label>
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">{t("Upload plant photo", "ചെടിയുടെ ഫോട്ടോ അപ്‌ലോഡ്")}</span>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{t("Snap or upload to detect pests & diseases", "കീടങ്ങളും രോഗങ്ങളും കണ്ടെത്താൻ ഫോട്ടോ എടുക്കുക")}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-warning" />
          </div>
        </FeatureCard>

        {/* AI Chatbot */}
        <FeatureCard
          icon={MessageCircle}
          title={t("AI Farm Assistant", "AI കൃഷി സഹായി")}
          subtitle={t("Chat in English or Malayalam", "ഇംഗ്ലീഷിലോ മലയാളത്തിലോ ചാറ്റ് ചെയ്യുക")}
          accentColor="bg-primary/12"
          iconColor="text-primary"
          glowColor="bg-primary/20"
          onClick={() => navigate("/chatbot")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{t("Ask anything about farming", "കൃഷിയെ കുറിച്ച് എന്തും ചോദിക്കൂ")}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </FeatureCard>

        {/* Govt Schemes */}
        <FeatureCard
          icon={Landmark}
          title={t("Govt Schemes for You", "നിങ്ങൾക്കുള്ള സർക്കാർ പദ്ധതികൾ")}
          subtitle={t("Subsidies & support programs", "സബ്‌സിഡികളും സഹായ പദ്ധതികളും")}
          accentColor="bg-info/15"
          iconColor="text-info"
          glowColor="bg-info/20"
          onClick={() => navigate("/schemes")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{t("6 schemes available", "6 പദ്ധതികൾ ലഭ്യം")}</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground animate-pulse">
                <Bell className="h-2.5 w-2.5" />
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-info" />
          </div>
        </FeatureCard>
      </div>

      <div className="my-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Cpu className="h-3.5 w-3.5" />
        <span>{t("Powered by Agentic AI • 6 Agents Active", "ഏജന്റിക് AI • 6 ഏജന്റുകൾ സജീവം")}</span>
        <ShieldCheck className="h-3.5 w-3.5 text-success" />
      </div>
    </div>
  );
};

export default Dashboard;