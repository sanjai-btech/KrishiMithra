import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bug, AlertTriangle, ShieldCheck, Loader2, ThermometerSun, Droplets } from "lucide-react";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";

interface PestRisk {
  name: string; nameMl: string;
  risk: "low" | "medium" | "high";
  trigger: string; triggerMl: string;
  prevention: string; preventionMl: string;
}

const pestRisksByCondition = {
  humid: [
    { name: "Fungal Leaf Blight", nameMl: "കുമിൾ ഇല കരിച്ചിൽ", risk: "high" as const, trigger: "Humidity > 80%", triggerMl: "ഈർപ്പം > 80%", prevention: "Apply Mancozeb 2g/L or Trichoderma", preventionMl: "മാൻകോസെബ് 2g/L അല്ലെങ്കിൽ ട്രൈക്കോഡെർമ ചേർക്കുക" },
    { name: "Bud Rot (Coconut)", nameMl: "കൂമ്പ് ചീയൽ (തെങ്ങ്)", risk: "high" as const, trigger: "Continuous rain + high humidity", triggerMl: "തുടർച്ചയായ മഴ + ഉയർന്ന ഈർപ്പം", prevention: "Apply Bordeaux mixture to crown", preventionMl: "ബോർഡോ മിശ്രിതം കൂമ്പിൽ ചേർക്കുക" },
    { name: "Rhizome Rot (Ginger)", nameMl: "കിഴങ്ങ് ചീയൽ (ഇഞ്ചി)", risk: "medium" as const, trigger: "Waterlogged soil", triggerMl: "വെള്ളം കെട്ടിനിൽക്കുന്ന മണ്ണ്", prevention: "Improve drainage, apply Trichoderma", preventionMl: "ഡ്രെയിനേജ് മെച്ചപ്പെടുത്തുക, ട്രൈക്കോഡെർമ ചേർക്കുക" },
  ],
  dry: [
    { name: "Spider Mites", nameMl: "ചിലന്തി", risk: "medium" as const, trigger: "Hot & dry weather", triggerMl: "ചൂടും വരണ്ടതുമായ കാലാവസ്ഥ", prevention: "Spray Neem oil 5ml/L", preventionMl: "വേപ്പെണ്ണ 5ml/L സ്‌പ്രേ ചെയ്യുക" },
    { name: "Mealybug", nameMl: "മീലിബഗ്", risk: "medium" as const, trigger: "Dry season stress", triggerMl: "വരൾച്ചാ സമ്മർദ്ദം", prevention: "Release ladybird beetles or spray fish oil soap", preventionMl: "ലേഡിബേർഡ് വണ്ടുകളെ വിടുക അല്ലെങ്കിൽ ഫിഷ് ഓയിൽ സോപ്പ്" },
    { name: "Rhinoceros Beetle", nameMl: "കാണ്ടാമൃഗ വണ്ട്", risk: "low" as const, trigger: "Decaying organic matter", triggerMl: "ജൈവ വസ്തുക്കളുടെ അഴുകൽ", prevention: "Apply Metarhizium in manure pits", preventionMl: "വളക്കുഴിയിൽ മെറ്റാറൈസിയം ചേർക്കുക" },
  ],
  moderate: [
    { name: "Leaf Spot", nameMl: "ഇല പുള്ളി", risk: "low" as const, trigger: "Moderate humidity", triggerMl: "മിതമായ ഈർപ്പം", prevention: "Remove affected leaves, apply Pseudomonas", preventionMl: "ബാധിച്ച ഇലകൾ നീക്കുക, സ്യൂഡോമോണാസ് ചേർക്കുക" },
    { name: "Stem Borer", nameMl: "തണ്ട് തുരപ്പൻ", risk: "medium" as const, trigger: "Crop stress", triggerMl: "വിള സമ്മർദ്ദം", prevention: "Install pheromone traps, apply Bt", preventionMl: "ഫെറോമോൺ കെണി സ്ഥാപിക്കുക, Bt ചേർക്കുക" },
    { name: "Aphids", nameMl: "മുഞ്ഞ", risk: "low" as const, trigger: "New growth flush", triggerMl: "പുതിയ വളർച്ച", prevention: "Spray neem oil or release lacewings", preventionMl: "വേപ്പെണ്ണ സ്‌പ്രേ അല്ലെങ്കിൽ ലേസ്‌വിംഗ്" },
  ],
};

const riskStyles = {
  low: { bg: "bg-success/15", text: "text-success", label: "Low", labelMl: "കുറവ്" },
  medium: { bg: "bg-warning/15", text: "text-warning", label: "Medium", labelMl: "ഇടത്തരം" },
  high: { bg: "bg-destructive/15", text: "text-destructive", label: "High", labelMl: "ഉയർന്നത്" },
};

const PestDiseaseDoctor = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("weather", { body: { district: "Wayanad" } });
        if (error) throw error;
        setWeather(data);
      } catch {
        setWeather({ temp: 31, humidity: 78, wind: 12, rainProbability: 65, condition: "Clouds" });
      } finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const getCondition = () => {
    if (!weather) return "moderate";
    if (weather.humidity > 80 || weather.rainProbability > 60) return "humid";
    if (weather.humidity < 50 && weather.rainProbability < 20) return "dry";
    return "moderate";
  };

  const condition = getCondition();
  const risks = pestRisksByCondition[condition];
  const overallRisk = condition === "humid" ? "high" : condition === "dry" ? "medium" : "low";

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-muted p-2 hover:bg-primary/10">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-foreground">{t("Pest & Disease Doctor", "കീട ഡോക്ടർ")}</h1>
          <p className="text-xs text-muted-foreground">{t("Weather-based risk assessment", "കാലാവസ്ഥ അടിസ്ഥാന റിസ്ക്")}</p>
        </div>
        <LangToggle />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {/* Overall Risk */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`card-farm-elevated border-2 ${overallRisk === "high" ? "border-destructive/30" : overallRisk === "medium" ? "border-warning/30" : "border-success/30"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${riskStyles[overallRisk].bg}`}>
                  <Bug className={`h-6 w-6 ${riskStyles[overallRisk].text}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t("Overall Pest Risk", "മൊത്തം കീട റിസ്ക്")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`Based on ${weather?.humidity}% humidity, ${weather?.rainProbability}% rain`,
                      `${weather?.humidity}% ഈർപ്പം, ${weather?.rainProbability}% മഴ അടിസ്ഥാനം`)}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${riskStyles[overallRisk].bg} ${riskStyles[overallRisk].text}`}>
                {lang === "ml" ? riskStyles[overallRisk].labelMl : riskStyles[overallRisk].label}
              </span>
            </div>
          </motion.div>

          {/* Weather context */}
          <div className="card-farm">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("Current Weather Context", "നിലവിലെ കാലാവസ്ഥ")}</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><ThermometerSun className="h-4 w-4 text-accent" /><span className="text-sm font-bold">{weather?.temp}°C</span></div>
              <div className="flex items-center gap-1.5"><Droplets className="h-4 w-4 text-info" /><span className="text-sm font-bold">{weather?.humidity}%</span></div>
              <div className="flex items-center gap-1.5"><span className="text-sm">🌧</span><span className="text-sm font-bold">{weather?.rainProbability}%</span></div>
            </div>
          </div>

          {/* Active Risks */}
          <div className="card-farm-elevated">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <AlertTriangle className="h-4 w-4 text-warning" />
              {t("Active Pest Risks", "സജീവ കീട ഭീഷണികൾ")}
            </h3>
            <div className="space-y-3">
              {risks.map((pest, idx) => {
                const rs = riskStyles[pest.risk];
                return (
                  <motion.div key={pest.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                    className="rounded-xl border border-border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{lang === "ml" ? pest.nameMl : pest.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rs.bg} ${rs.text}`}>
                        {lang === "ml" ? rs.labelMl : rs.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ⚡ {lang === "ml" ? pest.triggerMl : pest.trigger}
                    </p>
                    <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-success/5 px-2 py-1.5">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      <p className="text-xs font-medium text-success">{lang === "ml" ? pest.preventionMl : pest.prevention}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PestDiseaseDoctor;
