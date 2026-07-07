import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Beaker, Sprout, Leaf, AlertCircle } from "lucide-react";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/contexts/LangContext";

const soilRecommendations: Record<string, { advice: string; adviceMl: string; fertilizers: { name: string; nameMl: string; qty: string; qtyMl: string; timing: string; timingMl: string; cost: string }[] }> = {
  Laterite: {
    advice: "Laterite soils are acidic and low in nutrients. Apply lime before fertilizers.",
    adviceMl: "ലാറ്ററൈറ്റ് മണ്ണ് അമ്ലവും പോഷക കുറവുമാണ്. വളം ചേർക്കും മുമ്പ് കുമ്മായം ചേർക്കുക.",
    fertilizers: [
      { name: "Dolomite Lime", nameMl: "ഡോളമൈറ്റ് കുമ്മായം", qty: "500 kg/ha", qtyMl: "500 kg/ഹെ", timing: "Before planting", timingMl: "നടുന്നതിന് മുമ്പ്", cost: "₹3,500" },
      { name: "NPK 17-17-17", nameMl: "NPK 17-17-17", qty: "250 kg/ha", qtyMl: "250 kg/ഹെ", timing: "At planting + 45 days", timingMl: "നടുമ്പോഴും 45 ദിവസത്തിനും", cost: "₹4,200" },
      { name: "Organic compost", nameMl: "ജൈവ കമ്പോസ്റ്റ്", qty: "5 ton/ha", qtyMl: "5 ടൺ/ഹെ", timing: "Before planting", timingMl: "നടുന്നതിന് മുമ്പ്", cost: "₹2,000" },
    ],
  },
  Alluvial: {
    advice: "Alluvial soils are fertile. Focus on balanced NPK and micronutrients.",
    adviceMl: "എക്കൽ മണ്ണ് ഫലഭൂയിഷ്ഠമാണ്. സമതുലിത NPK-ൽ ശ്രദ്ധിക്കുക.",
    fertilizers: [
      { name: "NPK 20-10-10", nameMl: "NPK 20-10-10", qty: "200 kg/ha", qtyMl: "200 kg/ഹെ", timing: "Split application", timingMl: "വിഭജിച്ച് ചേർക്കുക", cost: "₹3,800" },
      { name: "Zinc Sulphate", nameMl: "സിങ്ക് സൾഫേറ്റ്", qty: "25 kg/ha", qtyMl: "25 kg/ഹെ", timing: "At tillering", timingMl: "ടില്ലറിംഗ് സമയത്ത്", cost: "₹600" },
      { name: "Vermicompost", nameMl: "വെർമികമ്പോസ്റ്റ്", qty: "3 ton/ha", qtyMl: "3 ടൺ/ഹെ", timing: "Basal", timingMl: "അടിവളമായി", cost: "₹4,500" },
    ],
  },
  Clayey: {
    advice: "Clay soils retain water. Avoid over-fertilization, use slow-release formulas.",
    adviceMl: "കളിമണ്ണ് വെള്ളം പിടിക്കും. അമിത വളം ഒഴിവാക്കുക.",
    fertilizers: [
      { name: "NPK 15-15-15 (Slow Release)", nameMl: "NPK 15-15-15 (സ്ലോ റിലീസ്)", qty: "200 kg/ha", qtyMl: "200 kg/ഹെ", timing: "Split into 3", timingMl: "3 ആയി വിഭജിക്കുക", cost: "₹4,000" },
      { name: "Gypsum", nameMl: "ജിപ്സം", qty: "500 kg/ha", qtyMl: "500 kg/ഹെ", timing: "Pre-planting", timingMl: "നടുന്നതിന് മുമ്പ്", cost: "₹1,500" },
      { name: "Green manure", nameMl: "പച്ചില വളം", qty: "Incorporate before planting", qtyMl: "നടുന്നതിന് മുമ്പ് ചേർക്കുക", timing: "30 days before", timingMl: "30 ദിവസം മുമ്പ്", cost: "₹500" },
    ],
  },
  Sandy: {
    advice: "Sandy soils lose nutrients quickly. Apply fertilizers in frequent small doses.",
    adviceMl: "മണൽ മണ്ണ് പോഷകങ്ങൾ വേഗം നഷ്ടപ്പെടുത്തും. ചെറിയ അളവിൽ കൂടെക്കൂടെ ചേർക്കുക.",
    fertilizers: [
      { name: "NPK 19-19-19 (Water Soluble)", nameMl: "NPK 19-19-19 (ജലത്തിൽ ലയിക്കുന്ന)", qty: "5g/L fertigation", qtyMl: "5g/L ഫെർട്ടിഗേഷൻ", timing: "Weekly", timingMl: "ആഴ്ചതോറും", cost: "₹5,500" },
      { name: "Organic matter", nameMl: "ജൈവ വസ്തു", qty: "10 ton/ha", qtyMl: "10 ടൺ/ഹെ", timing: "Pre-planting", timingMl: "നടുന്നതിന് മുമ്പ്", cost: "₹3,000" },
      { name: "Coir pith compost", nameMl: "ചകിരി കമ്പോസ്റ്റ്", qty: "5 ton/ha", qtyMl: "5 ടൺ/ഹെ", timing: "Mixing with soil", timingMl: "മണ്ണിൽ കലർത്തുക", cost: "₹2,500" },
    ],
  },
  Loamy: {
    advice: "Loamy soils are ideal. Maintain fertility with balanced organic and inorganic inputs.",
    adviceMl: "ലോമി മണ്ണ് ആദർശപരമാണ്. സമതുലിത ജൈവ-അജൈവ വളങ്ങൾ ഉപയോഗിക്കുക.",
    fertilizers: [
      { name: "NPK 17-17-17", nameMl: "NPK 17-17-17", qty: "200 kg/ha", qtyMl: "200 kg/ഹെ", timing: "2 splits", timingMl: "2 തവണയായി", cost: "₹3,400" },
      { name: "Neem cake", nameMl: "വേപ്പിൻ പിണ്ണാക്ക്", qty: "250 kg/ha", qtyMl: "250 kg/ഹെ", timing: "Basal application", timingMl: "അടിവളമായി", cost: "₹2,000" },
      { name: "Micronutrient mix", nameMl: "സൂക്ഷ്മ മൂലക മിശ്രിതം", qty: "5 kg/ha", qtyMl: "5 kg/ഹെ", timing: "Foliar spray at 30 & 60 days", timingMl: "30 & 60 ദിവസം ഇല സ്‌പ്രേ", cost: "₹800" },
    ],
  },
};

const FertilizerOptimization = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [soil, setSoil] = useState("Laterite");
  const soilTypes = Object.keys(soilRecommendations);
  const data = soilRecommendations[soil];
  const totalCost = data.fertilizers.reduce((sum, f) => sum + parseInt(f.cost.replace(/[₹,]/g, "")), 0);

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-muted p-2 hover:bg-primary/10">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-foreground">{t("Fertilizer Optimization", "വള ഒപ്റ്റിമൈസേഷൻ")}</h1>
          <p className="text-xs text-muted-foreground">{t("Soil-based fertilizer guide", "മണ്ണ് അടിസ്ഥാന വള ഗൈഡ്")}</p>
        </div>
        <LangToggle />
      </div>

      {/* Soil selector */}
      <div className="card-farm mb-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("Select your soil type", "മണ്ണിന്റെ തരം തിരഞ്ഞെടുക്കുക")}</p>
        <div className="flex flex-wrap gap-2">
          {soilTypes.map(s => (
            <button key={s} onClick={() => setSoil(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${s === soil ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Advice */}
      <motion.div key={soil} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="card-farm-elevated">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-info" />
            <p className="text-xs leading-relaxed text-foreground">{lang === "ml" ? data.adviceMl : data.advice}</p>
          </div>
        </div>

        {/* Fertilizer list */}
        <div className="card-farm-elevated">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <Beaker className="h-4 w-4 text-accent" />
            {t("Recommended Fertilizers", "ശുപാർശ ചെയ്ത വളങ്ങൾ")}
          </h3>
          <div className="space-y-3">
            {data.fertilizers.map((f, idx) => (
              <motion.div key={f.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                className="rounded-xl border border-border p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{lang === "ml" ? f.nameMl : f.name}</span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent-foreground">{f.cost}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sprout className="h-3 w-3" />
                  <span>{lang === "ml" ? f.qtyMl : f.qty}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Leaf className="h-3 w-3" />
                  <span>{lang === "ml" ? f.timingMl : f.timing}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cost Summary */}
        <div className="card-farm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{t("Estimated Total Cost", "ആകെ ചെലവ്")}</span>
            <span className="text-lg font-bold text-primary">₹{totalCost.toLocaleString()}/{t("ha", "ഹെ")}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FertilizerOptimization;
