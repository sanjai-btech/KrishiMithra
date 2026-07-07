import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChevronDown, Leaf, CheckCircle2, ArrowLeft, Layers, Sprout } from "lucide-react";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/contexts/LangContext";
import soilImg from "@/assets/soil-sample.jpg";

const soilTypes = ["Clay Soil", "Sandy Soil", "Loamy Soil", "Laterite Soil", "Alluvial Soil"];
const soilTypesMl: Record<string, string> = {
  "Clay Soil": "കളിമണ്ണ്",
  "Sandy Soil": "മണൽ മണ്ണ്",
  "Loamy Soil": "ലോമി മണ്ണ്",
  "Laterite Soil": "ലാറ്ററൈറ്റ് മണ്ണ്",
  "Alluvial Soil": "എക്കൽ മണ്ണ്",
};

const soilData: Record<string, { chars: string; charsMl: string; crops: { name: string; nameMl: string; score: number; tip: string; tipMl: string }[] }> = {
  "Laterite Soil": {
    chars: "Rich in iron & aluminium, acidic pH 5-6, well-drained, common in Kerala hills.",
    charsMl: "ഇരുമ്പും അലുമിനിയവും സമ്പുഷ്ടം, pH 5-6, കേരള കുന്നുകളിൽ സാധാരണം.",
    crops: [
      { name: "🥥 Coconut", nameMl: "🥥 തെങ്ങ്", score: 95, tip: "Ideal in laterite. Add organic manure yearly.", tipMl: "ലാറ്ററൈറ്റിൽ അനുയോജ്യം. എല്ലാ വർഷവും ജൈവവളം ചേർക്കുക." },
      { name: "🌳 Rubber", nameMl: "🌳 റബ്ബർ", score: 90, tip: "Thrives in acidic laterite. Plant June-July.", tipMl: "അമ്ല ലാറ്ററൈറ്റിൽ വളരുന്നു. ജൂൺ-ജൂലൈ നടുക." },
      { name: "🥜 Cashew", nameMl: "🥜 കശുമാവ്", score: 85, tip: "Drought-tolerant. Minimal irrigation.", tipMl: "വരൾച്ചയെ ചെറുക്കും. കുറഞ്ഞ ജലസേചനം." },
      { name: "🥔 Tapioca", nameMl: "🥔 മരച്ചീനി", score: 80, tip: "Grows well with lime amendment.", tipMl: "കുമ്മായം ചേർത്താൽ നന്നായി വളരും." },
      { name: "🫚 Ginger", nameMl: "🫚 ഇഞ്ചി", score: 70, tip: "Needs partial shade and mulching.", tipMl: "ഭാഗിക തണൽ ആവശ്യം." },
      { name: "🌶️ Black Pepper", nameMl: "🌶️ കുരുമുളക്", score: 75, tip: "Train on support trees. Harvest Dec-Jan.", tipMl: "താങ്ങുമരത്തിൽ പടർത്തുക." },
      { name: "☕ Coffee", nameMl: "☕ കാപ്പി", score: 72, tip: "Arabica suits higher elevations.", tipMl: "അറബിക്ക ഇനം ഉയർന്ന പ്രദേശങ്ങൾക്ക് അനുയോജ്യം." },
    ],
  },
  "Clay Soil": {
    chars: "Heavy texture, poor drainage, high nutrient retention. pH 6-7.",
    charsMl: "കനത്ത ഘടന, ദുർബല ഡ്രെയിനേജ്, ഉയർന്ന പോഷക സംരക്ഷണം.",
    crops: [
      { name: "🌾 Rice", nameMl: "🌾 നെല്ല്", score: 95, tip: "Perfect for waterlogged clay.", tipMl: "വെള്ളം കെട്ടിനിൽക്കുന്ന കളിമണ്ണിന് അനുയോജ്യം." },
      { name: "🌻 Sunflower", nameMl: "🌻 സൂര്യകാന്തി", score: 75, tip: "Needs raised beds.", tipMl: "ഉയർന്ന തടം ആവശ്യം." },
      { name: "🥬 Cabbage", nameMl: "🥬 കാബേജ്", score: 70, tip: "Add compost to improve texture.", tipMl: "കമ്പോസ്റ്റ് ചേർക്കുക." },
      { name: "🫘 Beans", nameMl: "🫘 പയർ", score: 72, tip: "Fixes nitrogen in soil.", tipMl: "മണ്ണിൽ നൈട്രജൻ ചേർക്കുന്നു." },
    ],
  },
  "Sandy Soil": {
    chars: "Light, warm, dry with low nutrients. Good for root crops. pH 5.5-7.",
    charsMl: "ഭാരം കുറഞ്ഞ, ചൂടുള്ള, വരണ്ട മണ്ണ്. കിഴങ്ങുവിളകൾക്ക് നല്ലത്.",
    crops: [
      { name: "🥕 Carrot", nameMl: "🥕 കാരറ്റ്", score: 90, tip: "Deep sand gives straight roots.", tipMl: "ആഴമുള്ള മണലിൽ നേരായ വേരുകൾ." },
      { name: "🥜 Groundnut", nameMl: "🥜 നിലക്കടല", score: 85, tip: "Best pod quality in sandy soil.", tipMl: "മണൽ മണ്ണിൽ മികച്ച ഗുണനിലവാരം." },
      { name: "🍉 Watermelon", nameMl: "🍉 തണ്ണിമത്തൻ", score: 80, tip: "Use drip irrigation.", tipMl: "ഡ്രിപ്പ് ജലസേചനം ഉപയോഗിക്കുക." },
      { name: "🧅 Onion", nameMl: "🧅 ഉള്ളി", score: 76, tip: "Well-drained soil prevents rot.", tipMl: "നല്ല ഡ്രെയിനേജ് ചീയൽ തടയുന്നു." },
    ],
  },
  "Loamy Soil": {
    chars: "Ideal mix of sand, silt, clay. Excellent drainage & nutrients. pH 6-7.",
    charsMl: "മണൽ, എക്കൽ, കളിമണ്ണ് എന്നിവയുടെ മികച്ച മിശ്രിതം.",
    crops: [
      { name: "🍅 Tomato", nameMl: "🍅 തക്കാളി", score: 95, tip: "Stake plants. Apply calcium.", tipMl: "ചെടികൾ കെട്ടുക. കാൽസ്യം ചേർക്കുക." },
      { name: "🌶️ Chilli", nameMl: "🌶️ മുളക്", score: 90, tip: "Full sun, water regularly.", tipMl: "നല്ല വെയിൽ, പതിവായി നനക്കുക." },
      { name: "🫑 Bell Pepper", nameMl: "🫑 കാപ്സിക്കം", score: 88, tip: "Needs consistent moisture.", tipMl: "സ്ഥിരമായ ഈർപ്പം ആവശ്യം." },
      { name: "🥒 Cucumber", nameMl: "🥒 വെള്ളരി", score: 85, tip: "Trellis for cleaner fruit.", tipMl: "പന്തൽ ഉണ്ടാക്കുക." },
      { name: "🍆 Brinjal", nameMl: "🍆 വഴുതന", score: 82, tip: "Watch for shoot borers.", tipMl: "തണ്ട് തുരപ്പൻ ശ്രദ്ധിക്കുക." },
    ],
  },
  "Alluvial Soil": {
    chars: "River-deposited, very fertile. Good moisture retention. pH 6.5-8.",
    charsMl: "നദി നിക്ഷേപിച്ച, വളരെ ഫലഭൂയിഷ്ഠം. നല്ല ഈർപ്പ സംരക്ഷണം.",
    crops: [
      { name: "🌾 Rice", nameMl: "🌾 നെല്ല്", score: 95, tip: "Alluvial plains are Kerala's rice bowl.", tipMl: "എക്കൽ സമതലങ്ങൾ കേരളത്തിന്റെ നെൽപ്പാടങ്ങൾ." },
      { name: "🌽 Maize", nameMl: "🌽 ചോളം", score: 85, tip: "Rotate with rice.", tipMl: "നെല്ലുമായി മാറി കൃഷി ചെയ്യുക." },
      { name: "🥬 Vegetables", nameMl: "🥬 പച്ചക്കറികൾ", score: 90, tip: "Almost all veggies thrive here.", tipMl: "ഏതാണ്ട് എല്ലാ പച്ചക്കറികളും വളരും." },
      { name: "🍌 Banana", nameMl: "🍌 വാഴ", score: 88, tip: "Nendran variety is most profitable.", tipMl: "നേന്ത്രൻ ഇനം ലാഭകരം." },
    ],
  },
};

const SoilAnalysis = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [imageUploaded, setImageUploaded] = useState(false);
  const [selectedSoil, setSelectedSoil] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);

  const handleAnalyze = (soil: string) => {
    setAnalyzing(true);
    setResult(null);
    setExpandedCrop(null);
    setTimeout(() => { setResult(soil); setAnalyzing(false); }, 1500);
  };

  const handleUpload = () => { setImageUploaded(true); handleAnalyze("Laterite Soil"); };

  const data = result ? soilData[result] : null;

  const getBarColor = (score: number) => {
    if (score >= 90) return "bg-success";
    if (score >= 75) return "bg-primary";
    if (score >= 60) return "bg-accent";
    return "bg-warning";
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-muted p-2 transition-colors hover:bg-primary/10">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-foreground">{t("Soil Intelligence", "മണ്ണ് ഇന്റലിജൻസ്")}</h1>
          <p className="text-xs text-muted-foreground">{t("Analyze your soil for best results", "മികച്ച ഫലങ്ങൾക്കായി മണ്ണ് വിശകലനം ചെയ്യുക")}</p>
        </div>
        <LangToggle />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-farm-elevated mb-4">
        {!imageUploaded ? (
          <button onClick={handleUpload} className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border py-8 transition-all hover:border-primary hover:bg-primary/5">
            <div className="rounded-xl bg-primary/10 p-3"><Camera className="h-7 w-7 text-primary" /></div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{t("Upload Soil Image", "മണ്ണിന്റെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക")}</p>
              <p className="text-xs text-muted-foreground">{t("Take a photo or upload from gallery", "ഫോട്ടോ എടുക്കുക അല്ലെങ്കിൽ ഗാലറിയിൽ നിന്ന് അപ്‌ലോഡ് ചെയ്യുക")}</p>
            </div>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <img src={soilImg} alt="Soil sample" className="h-40 w-40 rounded-2xl object-cover ring-2 ring-success/30" />
            <span className="text-xs font-semibold text-success">{t("✅ Image uploaded", "✅ ചിത്രം അപ്‌ലോഡ് ചെയ്തു")}</span>
          </div>
        )}
      </motion.div>

      <div className="card-farm mb-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("Or select soil type manually", "അല്ലെങ്കിൽ മണ്ണിന്റെ തരം തിരഞ്ഞെടുക്കുക")}</p>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary">
            {selectedSoil ? (lang === "ml" ? soilTypesMl[selectedSoil] : selectedSoil) : t("Choose soil type...", "മണ്ണിന്റെ തരം തിരഞ്ഞെടുക്കുക...")}
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-card shadow-lg">
              {soilTypes.map((s) => (
                <button key={s} onClick={() => { setSelectedSoil(s); setDropdownOpen(false); handleAnalyze(s); }}
                  className={`block w-full px-4 py-3 text-left text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-primary/10 ${selectedSoil === s ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}>
                  {lang === "ml" ? soilTypesMl[s] : s}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {analyzing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 py-8">
          <Layers className="h-8 w-8 animate-pulse-soft text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">{t("Analyzing soil...", "മണ്ണ് വിശകലനം ചെയ്യുന്നു...")}</p>
        </motion.div>
      )}

      <AnimatePresence>
        {result && data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 pb-24">
            <div className="card-farm-elevated">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <h3 className="text-sm font-bold text-foreground">{t("Detected", "കണ്ടെത്തി")}: {lang === "ml" ? soilTypesMl[result] : result}</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{lang === "ml" ? data.charsMl : data.chars}</p>
            </div>

            <div className="card-farm-elevated">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Leaf className="h-4 w-4 text-primary" /> {t(`Recommended Crops (${data.crops.length})`, `ശുപാർശ ചെയ്ത വിളകൾ (${data.crops.length})`)}
              </h3>
              <div className="space-y-2">
                {data.crops.map((c, idx) => (
                  <motion.div key={c.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}>
                    <button onClick={() => setExpandedCrop(expandedCrop === c.name ? null : c.name)} className="w-full rounded-xl p-2 text-left transition-colors hover:bg-muted/60">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-semibold text-foreground">{lang === "ml" ? c.nameMl : c.name}</span>
                        <span className={`font-bold ${c.score >= 85 ? "text-success" : c.score >= 70 ? "text-primary" : "text-accent-foreground"}`}>{c.score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <motion.div className={`h-full rounded-full ${getBarColor(c.score)}`} initial={{ width: 0 }} animate={{ width: `${c.score}%` }} transition={{ duration: 0.7, delay: idx * 0.08 }} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedCrop === c.name && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mx-2 mb-2 flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2">
                            <Sprout className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            <p className="text-xs leading-relaxed text-foreground">{lang === "ml" ? c.tipMl : c.tip}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoilAnalysis;
