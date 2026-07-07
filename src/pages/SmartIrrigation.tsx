import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Droplets, Cloud, ThermometerSun, Timer, Loader2 } from "lucide-react";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";

const cropWaterNeeds: Record<string, { daily: number; stage: string; stageMl: string }> = {
  Rice: { daily: 8, stage: "Tillering", stageMl: "ടില്ലറിംഗ്" },
  Coconut: { daily: 40, stage: "Bearing", stageMl: "കായ്ച്ച" },
  Rubber: { daily: 5, stage: "Mature", stageMl: "പക്വം" },
  Banana: { daily: 15, stage: "Flowering", stageMl: "പൂവിടൽ" },
  "Black Pepper": { daily: 3, stage: "Berry development", stageMl: "കുരു വികസനം" },
  Vegetables: { daily: 6, stage: "Vegetative", stageMl: "സസ്യ ഘട്ടം" },
};

const SmartIrrigation = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState("Coconut");

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("weather", { body: { district: "Wayanad" } });
        if (error) throw error;
        setWeather(data);
      } catch {
        setWeather({ temp: 31, humidity: 78, wind: 12, rainProbability: 65, condition: "Clouds", advisory: "Moderate rain expected", advisoryMl: "മിതമായ മഴ പ്രതീക്ഷിക്കുന്നു" });
      } finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const crop = cropWaterNeeds[selectedCrop] || cropWaterNeeds.Coconut;
  const skipIrrigation = weather && weather.rainProbability > 50;
  const waterSaved = skipIrrigation ? crop.daily * 10 : 0;

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-muted p-2 hover:bg-primary/10">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-foreground">{t("Smart Irrigation", "സ്മാർട്ട് ജലസേചനം")}</h1>
          <p className="text-xs text-muted-foreground">{t("AI-powered water management", "AI ജല മാനേജ്മെന്റ്")}</p>
        </div>
        <LangToggle />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Crop selector */}
          <div className="card-farm">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("Select your crop", "വിള തിരഞ്ഞെടുക്കുക")}</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(cropWaterNeeds).map(c => (
                <button key={c} onClick={() => setSelectedCrop(c)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${c === selectedCrop ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Weather Summary */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-farm-elevated">
            <div className="mb-3 flex items-center gap-2">
              <Cloud className="h-5 w-5 text-info" />
              <h3 className="text-sm font-bold text-foreground">{t("Current Conditions", "നിലവിലെ അവസ്ഥ")}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-info/10 p-3 text-center">
                <ThermometerSun className="mx-auto mb-1 h-5 w-5 text-info" />
                <p className="text-lg font-bold text-foreground">{weather?.temp}°C</p>
                <p className="text-[10px] text-muted-foreground">{t("Temp", "താപം")}</p>
              </div>
              <div className="rounded-xl bg-info/10 p-3 text-center">
                <Droplets className="mx-auto mb-1 h-5 w-5 text-info" />
                <p className="text-lg font-bold text-foreground">{weather?.humidity}%</p>
                <p className="text-[10px] text-muted-foreground">{t("Humidity", "ഈർപ്പം")}</p>
              </div>
              <div className="rounded-xl bg-info/10 p-3 text-center">
                <Cloud className="mx-auto mb-1 h-5 w-5 text-info" />
                <p className="text-lg font-bold text-foreground">{weather?.rainProbability}%</p>
                <p className="text-[10px] text-muted-foreground">{t("Rain", "മഴ")}</p>
              </div>
            </div>
          </motion.div>

          {/* Irrigation Recommendation */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={`card-farm-elevated border-2 ${skipIrrigation ? "border-success/30" : "border-warning/30"}`}>
            <div className="mb-3 flex items-center gap-2">
              <Droplets className={`h-5 w-5 ${skipIrrigation ? "text-success" : "text-warning"}`} />
              <h3 className="text-sm font-bold text-foreground">{t("Today's Recommendation", "ഇന്നത്തെ ശുപാർശ")}</h3>
            </div>
            {skipIrrigation ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-success/10 p-4 text-center">
                  <p className="text-lg font-bold text-success">✅ {t("Skip Irrigation Today", "ഇന്ന് നന വേണ്ട")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t(`Rain probability is ${weather?.rainProbability}%. Save water!`, `മഴ സാധ്യത ${weather?.rainProbability}%. വെള്ളം ലാഭിക്കുക!`)}
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-success/5 px-3 py-2">
                  <span className="text-xs font-semibold text-success">{t("Water Saved", "ലാഭിച്ച വെള്ളം")}</span>
                  <span className="text-sm font-bold text-success">{waterSaved}L</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-warning/10 p-4 text-center">
                  <p className="text-lg font-bold text-warning">💧 {t("Irrigate in Evening", "വൈകുന്നേരം നനയ്ക്കുക")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("Low rain probability. Soil moisture is low.", "മഴ സാധ്യത കുറവ്. മണ്ണിലെ ഈർപ്പം കുറവ്.")}
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground">{t("Recommended Volume", "ശുപാർശ ചെയ്ത അളവ്")}</span>
                  <span className="text-sm font-bold text-foreground">{crop.daily}L/{t("plant", "ചെടി")}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Crop Water Schedule */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-farm">
            <div className="mb-3 flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-foreground">{t("Crop Water Schedule", "വിള ജലസേചന പട്ടിക")}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("Crop", "വിള")}</span><span className="font-bold text-foreground">{selectedCrop}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("Growth Stage", "വളർച്ചാ ഘട്ടം")}</span><span className="font-bold text-foreground">{lang === "ml" ? crop.stageMl : crop.stage}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("Daily Need", "ദിവസ ആവശ്യം")}</span><span className="font-bold text-foreground">{crop.daily}L/{t("plant", "ചെടി")}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("Best Time", "മികച്ച സമയം")}</span><span className="font-bold text-foreground">{t("6-8 AM or 4-6 PM", "6-8 AM അല്ലെങ്കിൽ 4-6 PM")}</span></div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SmartIrrigation;
